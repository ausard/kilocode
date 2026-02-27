// kilocode_change - new file
import type { LanguageModelV2 } from "@ai-sdk/provider"
import { SapAiCoreLanguageModel } from "./sap-ai-core-language-model"

export type SapAiCoreModelId = string

export interface SapAiCoreProviderSettings {
  /**
   * Optional deployment ID for the SAP AI Core orchestration deployment.
   * If not provided, the SDK will use the default deployment.
   */
  deploymentId?: string

  /**
   * Optional resource group for the SAP AI Core deployment.
   */
  resourceGroup?: string
}

export interface SapAiCoreProvider {
  (modelId: SapAiCoreModelId): LanguageModelV2
  languageModel(modelId: SapAiCoreModelId): LanguageModelV2
  chat(modelId: SapAiCoreModelId): LanguageModelV2
}

/**
 * Create a SAP AI Core provider instance.
 *
 * This provider uses the SAP AI SDK Orchestration service to interact with
 * various LLMs deployed on SAP AI Core. It requires the AICORE_SERVICE_KEY
 * environment variable to be set with valid SAP AI Core service credentials.
 *
 * @param options - Provider configuration options
 * @returns A SAP AI Core provider instance
 *
 * @example
 * ```ts
 * const provider = createSapAiCore({
 *   deploymentId: 'your-deployment-id',
 *   resourceGroup: 'your-resource-group'
 * })
 *
 * const model = provider('gpt-4o')
 * ```
 */
export function createSapAiCore(options: SapAiCoreProviderSettings = {}): SapAiCoreProvider {
  const createLanguageModel = (modelId: SapAiCoreModelId) => {
    return new SapAiCoreLanguageModel(modelId, {
      provider: "sap-ai-core.chat",
      deploymentId: options.deploymentId,
      resourceGroup: options.resourceGroup,
    })
  }

  const provider = function (modelId: SapAiCoreModelId) {
    return createLanguageModel(modelId)
  }

  provider.languageModel = createLanguageModel
  provider.chat = createLanguageModel

  return provider as SapAiCoreProvider
}

/**
 * Default SAP AI Core provider instance.
 *
 * Uses environment variables for configuration:
 * - AICORE_SERVICE_KEY: Required. JSON service key for SAP AI Core authentication.
 * - AICORE_DEPLOYMENT_ID: Optional. The deployment ID for the orchestration service.
 * - AICORE_RESOURCE_GROUP: Optional. The resource group for the deployment.
 */
export const sapAiCore = createSapAiCore()
