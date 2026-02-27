#!/usr/bin/env bun
// kilocode_change - new file
// Debug script for SAP AI Core provider
// Run with: bun packages/opencode/test/kilocode/sap-ai-core-debug.ts

import { createSapAiCore, SapAiCoreLanguageModel } from "../../src/provider/sdk/sap-ai-core"

async function main() {
  console.log("=== SAP AI Core Provider Debug ===\n")

  // Check environment variables
  console.log("1. Checking environment variables...")
  const serviceKey = process.env.AICORE_SERVICE_KEY
  const deploymentId = process.env.AICORE_DEPLOYMENT_ID
  const resourceGroup = process.env.AICORE_RESOURCE_GROUP

  console.log(`   AICORE_SERVICE_KEY: ${serviceKey ? "SET (hidden)" : "NOT SET"}`)
  console.log(`   AICORE_DEPLOYMENT_ID: ${deploymentId ?? "NOT SET"}`)
  console.log(`   AICORE_RESOURCE_GROUP: ${resourceGroup ?? "NOT SET"}`)

  if (!serviceKey) {
    console.log("\n❌ AICORE_SERVICE_KEY is required. Please set it with your SAP AI Core service credentials.")
    console.log("\nExample:")
    console.log(
      '  export AICORE_SERVICE_KEY=\'{"clientid":"...","clientsecret":"...","url":"...","serviceurls":{"AI_API_URL":"..."}}\'',
    )
    process.exit(1)
  }

  // Create provider
  console.log("\n2. Creating SAP AI Core provider...")
  const provider = createSapAiCore({
    deploymentId,
    resourceGroup,
  })
  console.log("   ✓ Provider created")

  // Create a language model
  const modelId = process.argv[2] ?? "gpt-4o"
  console.log(`\n3. Creating language model: ${modelId}`)
  const model = provider(modelId)
  console.log(`   ✓ Model created`)
  console.log(`   - Provider: ${model.provider}`)
  console.log(`   - Model ID: ${model.modelId}`)
  console.log(`   - Spec version: ${model.specificationVersion}`)

  // Test non-streaming completion
  console.log("\n4. Testing non-streaming completion...")
  try {
    const startTime = Date.now()
    const result = await model.doGenerate({
      prompt: [
        { role: "system", content: "You are a helpful assistant. Be very brief." },
        { role: "user", content: [{ type: "text", text: "What is 2+2? Reply with just the number." }] },
      ],
      maxOutputTokens: 100,
      temperature: 0,
    })
    const elapsed = Date.now() - startTime

    console.log(`   ✓ Completion successful (${elapsed}ms)`)
    console.log(`   - Finish reason: ${result.finishReason}`)
    console.log(`   - Input tokens: ${result.usage.inputTokens}`)
    console.log(`   - Output tokens: ${result.usage.outputTokens}`)
    console.log(`   - Content:`)
    for (const part of result.content) {
      if (part.type === "text") {
        console.log(`     [text]: "${part.text}"`)
      } else if (part.type === "tool-call") {
        console.log(`     [tool-call]: ${part.toolName}(${part.input})`)
      }
    }
  } catch (error) {
    console.log(`   ❌ Completion failed:`, error)
  }

  // Test streaming completion
  console.log("\n5. Testing streaming completion...")
  try {
    const startTime = Date.now()
    const streamResult = await model.doStream({
      prompt: [
        { role: "system", content: "You are a helpful assistant. Be very brief." },
        { role: "user", content: [{ type: "text", text: "Count from 1 to 5, one number per line." }] },
      ],
      maxOutputTokens: 100,
      temperature: 0,
    })

    console.log(`   ✓ Stream started`)
    let fullText = ""
    let tokenCount = { input: 0, output: 0 }

    const reader = streamResult.stream.getReader()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      switch (value.type) {
        case "stream-start":
          console.log(`   [stream-start]`)
          break
        case "text-start":
          console.log(`   [text-start]`)
          break
        case "text-delta":
          process.stdout.write(value.delta)
          fullText += value.delta
          break
        case "text-end":
          console.log(`\n   [text-end]`)
          break
        case "finish":
          console.log(`   [finish] reason=${value.finishReason}`)
          tokenCount.input = value.usage.inputTokens ?? 0
          tokenCount.output = value.usage.outputTokens ?? 0
          break
        case "error":
          console.log(`   [error] ${value.error}`)
          break
        default:
          console.log(`   [${value.type}]`)
      }
    }

    const elapsed = Date.now() - startTime
    console.log(`   ✓ Stream completed (${elapsed}ms)`)
    console.log(`   - Input tokens: ${tokenCount.input}`)
    console.log(`   - Output tokens: ${tokenCount.output}`)
  } catch (error) {
    console.log(`   ❌ Streaming failed:`, error)
  }

  console.log("\n=== Debug complete ===")
}

main().catch(console.error)
