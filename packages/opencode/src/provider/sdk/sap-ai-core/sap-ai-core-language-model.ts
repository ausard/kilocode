// kilocode_change - new file
import {
  type LanguageModelV2,
  type LanguageModelV2CallWarning,
  type LanguageModelV2Content,
  type LanguageModelV2FinishReason,
  type LanguageModelV2Prompt,
  type LanguageModelV2StreamPart,
} from "@ai-sdk/provider"
import { generateId } from "@ai-sdk/provider-utils"
import { OrchestrationClient } from "@sap-ai-sdk/orchestration"

export interface SapAiCoreLanguageModelConfig {
  provider: string
  deploymentId?: string
  resourceGroup?: string
}

// Types based on SAP AI SDK v2 API
interface PromptTemplatingConfig {
  model: {
    name: string
    version?: string
    params?: {
      max_tokens?: number
      temperature?: number
      top_p?: number
      stop?: string[]
    }
  }
  prompt?: {
    template?: Array<{ role: string; content: string | ContentPart[] }>
    tools?: ChatCompletionTool[]
  }
}

interface ContentPart {
  type: string
  text?: string
  image_url?: {
    url: string
  }
}

interface ChatCompletionTool {
  type: "function"
  function: {
    name: string
    description?: string
    parameters?: Record<string, unknown>
  }
}

interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool"
  content: string | ContentPart[]
  tool_calls?: Array<{
    id: string
    type: "function"
    function: {
      name: string
      arguments: string
    }
  }>
  tool_call_id?: string
}

export class SapAiCoreLanguageModel implements LanguageModelV2 {
  readonly specificationVersion = "v2"
  readonly modelId: string
  readonly supportsStructuredOutputs = false

  private readonly config: SapAiCoreLanguageModelConfig

  constructor(modelId: string, config: SapAiCoreLanguageModelConfig) {
    this.modelId = modelId
    this.config = config
  }

  get provider(): string {
    return this.config.provider
  }

  get supportedUrls() {
    return {}
  }

  async doGenerate(
    options: Parameters<LanguageModelV2["doGenerate"]>[0],
  ): Promise<Awaited<ReturnType<LanguageModelV2["doGenerate"]>>> {
    const warnings: LanguageModelV2CallWarning[] = []

    const { topK, topP, temperature, maxOutputTokens, stopSequences, tools } = options

    if (topK != null) {
      warnings.push({ type: "unsupported-setting", setting: "topK" })
    }

    const messages = convertToSapMessages(options.prompt)

    // Build orchestration config using SAP SDK v2 API structure
    const promptTemplating: PromptTemplatingConfig = {
      model: {
        name: this.modelId,
        params: {
          ...(maxOutputTokens != null && { max_tokens: maxOutputTokens }),
          ...(temperature != null && { temperature }),
          ...(topP != null && { top_p: topP }),
          ...(stopSequences?.length && { stop: stopSequences }),
        },
      },
    }

    // Add tools if provided
    if (tools && tools.length > 0) {
      promptTemplating.prompt = {
        tools: tools.map((tool) => ({
          type: "function" as const,
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters as Record<string, unknown>,
          },
        })),
      }
    }

    const client = new OrchestrationClient(
      { promptTemplating },
      {
        ...(this.config.deploymentId && { deploymentId: this.config.deploymentId }),
        ...(this.config.resourceGroup && { resourceGroup: this.config.resourceGroup }),
      },
    )

    const response = await client.chatCompletion({
      messages: messages as Array<{ role: "user" | "assistant" | "system" | "tool"; content: string }>,
    })

    const content: Array<LanguageModelV2Content> = []

    // Use convenience methods from SAP SDK
    const text = response.getContent()
    if (text != null && text.length > 0) {
      content.push({
        type: "text",
        text,
      })
    }

    // Extract tool calls if present
    const toolCalls = response.getToolCalls()
    if (toolCalls != null && toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        content.push({
          type: "tool-call",
          toolCallId: toolCall.id ?? generateId(),
          toolName: toolCall.function.name,
          input: toolCall.function.arguments,
        })
      }
    }

    const usage = response.getTokenUsage()

    return {
      content,
      finishReason: mapFinishReason(response.getFinishReason()),
      usage: {
        inputTokens: usage?.prompt_tokens ?? undefined,
        outputTokens: usage?.completion_tokens ?? undefined,
        totalTokens: usage?.total_tokens ?? undefined,
      },
      request: { body: JSON.stringify({ promptTemplating, messages }) },
      response: {
        id: response.rawResponse?.data?.request_id,
        body: response.rawResponse?.data,
      },
      warnings,
    }
  }

  async doStream(
    options: Parameters<LanguageModelV2["doStream"]>[0],
  ): Promise<Awaited<ReturnType<LanguageModelV2["doStream"]>>> {
    const warnings: LanguageModelV2CallWarning[] = []

    const { topK, topP, temperature, maxOutputTokens, stopSequences, tools } = options

    if (topK != null) {
      warnings.push({ type: "unsupported-setting", setting: "topK" })
    }

    const messages = convertToSapMessages(options.prompt)

    // Build orchestration config using SAP SDK v2 API structure
    const promptTemplating: PromptTemplatingConfig = {
      model: {
        name: this.modelId,
        params: {
          ...(maxOutputTokens != null && { max_tokens: maxOutputTokens }),
          ...(temperature != null && { temperature }),
          ...(topP != null && { top_p: topP }),
          ...(stopSequences?.length && { stop: stopSequences }),
        },
      },
    }

    // Add tools if provided
    if (tools && tools.length > 0) {
      promptTemplating.prompt = {
        tools: tools.map((tool) => ({
          type: "function" as const,
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters as Record<string, unknown>,
          },
        })),
      }
    }

    const client = new OrchestrationClient(
      { promptTemplating },
      {
        ...(this.config.deploymentId && { deploymentId: this.config.deploymentId }),
        ...(this.config.resourceGroup && { resourceGroup: this.config.resourceGroup }),
      },
    )

    const sapStreamResponse = await client.stream({
      messages: messages as Array<{ role: "user" | "assistant" | "system" | "tool"; content: string }>,
    })

    let finishReason: LanguageModelV2FinishReason = "unknown"
    let isFirstChunk = true
    let isActiveText = false
    const usage = {
      promptTokens: undefined as number | undefined,
      completionTokens: undefined as number | undefined,
      totalTokens: undefined as number | undefined,
    }

    const toolCalls: Array<{
      id: string
      type: "function"
      function: {
        name: string
        arguments: string
      }
      hasFinished: boolean
    }> = []

    const stream = new ReadableStream<LanguageModelV2StreamPart>({
      async start(controller) {
        controller.enqueue({ type: "stream-start", warnings })

        try {
          // Use the stream property from SAP SDK response
          for await (const chunk of sapStreamResponse.stream) {
            if (isFirstChunk) {
              isFirstChunk = false
              controller.enqueue({
                type: "response-metadata",
                id: chunk.data?.request_id,
              })
            }

            // Get delta content from chunk
            const delta = chunk.getDeltaContent?.()
            if (delta) {
              if (!isActiveText) {
                controller.enqueue({
                  type: "text-start",
                  id: "txt-0",
                })
                isActiveText = true
              }

              controller.enqueue({
                type: "text-delta",
                id: "txt-0",
                delta,
              })
            }

            // Handle tool calls in streaming
            const deltaToolCalls = chunk.getDeltaToolCalls?.()
            if (deltaToolCalls) {
              for (const toolCallDelta of deltaToolCalls) {
                const index = toolCallDelta.index ?? 0

                if (toolCalls[index] == null) {
                  const id = toolCallDelta.id ?? generateId()
                  const name = toolCallDelta.function?.name ?? ""

                  controller.enqueue({
                    type: "tool-input-start",
                    id,
                    toolName: name,
                  })

                  toolCalls[index] = {
                    id,
                    type: "function",
                    function: {
                      name,
                      arguments: toolCallDelta.function?.arguments ?? "",
                    },
                    hasFinished: false,
                  }
                } else {
                  const toolCall = toolCalls[index]
                  if (toolCallDelta.function?.arguments) {
                    toolCall.function.arguments += toolCallDelta.function.arguments
                    controller.enqueue({
                      type: "tool-input-delta",
                      id: toolCall.id,
                      delta: toolCallDelta.function.arguments,
                    })
                  }
                }
              }
            }
          }

          // End text if active
          if (isActiveText) {
            controller.enqueue({ type: "text-end", id: "txt-0" })
          }

          // Get final values from stream response
          finishReason = mapFinishReason(sapStreamResponse.getFinishReason?.())
          const tokenUsage = sapStreamResponse.getTokenUsage?.()
          if (tokenUsage) {
            usage.promptTokens = tokenUsage.prompt_tokens
            usage.completionTokens = tokenUsage.completion_tokens
            usage.totalTokens = tokenUsage.total_tokens
          }

          // Get tool calls from final response
          const finalToolCalls = sapStreamResponse.getToolCalls?.()
          if (finalToolCalls && finalToolCalls.length > 0) {
            for (const toolCall of finalToolCalls) {
              // Check if we already emitted this tool call
              const existing = toolCalls.find((tc) => tc.id === toolCall.id)
              if (!existing) {
                controller.enqueue({
                  type: "tool-input-start",
                  id: toolCall.id,
                  toolName: toolCall.function.name,
                })
                controller.enqueue({
                  type: "tool-input-delta",
                  id: toolCall.id,
                  delta: toolCall.function.arguments,
                })
              }
              controller.enqueue({
                type: "tool-input-end",
                id: toolCall.id,
              })
              controller.enqueue({
                type: "tool-call",
                toolCallId: toolCall.id,
                toolName: toolCall.function.name,
                input: toolCall.function.arguments,
              })
            }
          } else {
            // End any unfinished tool calls from streaming
            for (const toolCall of toolCalls.filter((tc) => !tc.hasFinished)) {
              controller.enqueue({
                type: "tool-input-end",
                id: toolCall.id,
              })
              controller.enqueue({
                type: "tool-call",
                toolCallId: toolCall.id,
                toolName: toolCall.function.name,
                input: toolCall.function.arguments,
              })
            }
          }

          controller.enqueue({
            type: "finish",
            finishReason,
            usage: {
              inputTokens: usage.promptTokens,
              outputTokens: usage.completionTokens,
              totalTokens: usage.totalTokens,
            },
          })

          controller.close()
        } catch (error) {
          controller.enqueue({
            type: "error",
            error: error instanceof Error ? error.message : String(error),
          })
          controller.close()
        }
      },
    })

    return {
      stream,
      request: { body: JSON.stringify({ promptTemplating, messages }) },
      response: {},
    }
  }
}

function mapFinishReason(reason: string | null | undefined): LanguageModelV2FinishReason {
  switch (reason) {
    case "stop":
      return "stop"
    case "length":
      return "length"
    case "tool_calls":
    case "function_call":
      return "tool-calls"
    case "content_filter":
      return "content-filter"
    default:
      return "unknown"
  }
}

function convertToSapMessages(prompt: LanguageModelV2Prompt): ChatMessage[] {
  const messages: ChatMessage[] = []

  for (const message of prompt) {
    switch (message.role) {
      case "system":
        messages.push({
          role: "system",
          content: message.content,
        })
        break

      case "user":
        messages.push({
          role: "user",
          content: convertUserContent(message.content),
        })
        break

      case "assistant":
        const assistantContent = convertAssistantContent(message.content)
        messages.push({
          role: "assistant",
          content: assistantContent.content,
          ...(assistantContent.toolCalls && { tool_calls: assistantContent.toolCalls }),
        })
        break

      case "tool":
        // SAP AI Core expects tool results as separate messages
        for (const part of message.content) {
          messages.push({
            role: "tool",
            content: typeof part.result === "string" ? part.result : JSON.stringify(part.result),
            tool_call_id: part.toolCallId,
          })
        }
        break
    }
  }

  return messages
}

function convertUserContent(
  content: Array<{ type: "text"; text: string } | { type: "image"; image: URL | Uint8Array; mimeType?: string }>,
): string | ContentPart[] {
  // If all content is text, join it as a simple string
  const textOnly = content.every((part) => part.type === "text")
  if (textOnly) {
    return content
      .filter((part): part is { type: "text"; text: string } => part.type === "text")
      .map((part) => part.text)
      .join("\n")
  }

  // Otherwise, convert to content parts (for multimodal)
  const parts: ContentPart[] = []
  for (const part of content) {
    if (part.type === "text") {
      parts.push({ type: "text", text: part.text })
    } else if (part.type === "image") {
      // Convert image to base64 for SAP AI Core
      const imageData = part.image instanceof URL ? part.image.toString() : Buffer.from(part.image).toString("base64")

      parts.push({
        type: "image_url",
        image_url: {
          url: part.image instanceof URL ? imageData : `data:${part.mimeType ?? "image/png"};base64,${imageData}`,
        },
      })
    }
  }

  return parts
}

function convertAssistantContent(content: LanguageModelV2Content[]): {
  content: string
  toolCalls?: Array<{
    id: string
    type: "function"
    function: {
      name: string
      arguments: string
    }
  }>
} {
  let textContent = ""
  const toolCalls: Array<{
    id: string
    type: "function"
    function: {
      name: string
      arguments: string
    }
  }> = []

  for (const part of content) {
    if (part.type === "text") {
      textContent += part.text
    } else if (part.type === "tool-call") {
      toolCalls.push({
        id: part.toolCallId,
        type: "function",
        function: {
          name: part.toolName,
          arguments: typeof part.input === "string" ? part.input : JSON.stringify(part.input),
        },
      })
    }
  }

  return {
    content: textContent,
    ...(toolCalls.length > 0 && { toolCalls }),
  }
}
