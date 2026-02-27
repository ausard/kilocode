# AI SDK Dependencies Upgrade Report

**Generated:** February 26, 2026  
**Scope:** Minor and patch version upgrades only (no major version changes)

## Summary

| Status             | Count  |
| ------------------ | ------ |
| Upgrades Available | 16     |
| Already Latest     | 6      |
| **Total Packages** | **22** |

---

## Packages with Available Upgrades

### Core AI SDK

| Package | Current | Latest      | Changelog                                                                    |
| ------- | ------- | ----------- | ---------------------------------------------------------------------------- |
| `ai`    | 5.0.124 | **5.0.140** | [CHANGELOG](https://github.com/vercel/ai/blob/main/packages/ai/CHANGELOG.md) |

**Changes (5.0.124 → 5.0.140):**

- Patch releases containing bug fixes and dependency updates
- Note: v6.x is available but excluded per major version constraint
- The 5.1.x line consists of beta releases only

---

### Provider Packages

| Package                     | Current | Latest      | Changelog                                                                                   |
| --------------------------- | ------- | ----------- | ------------------------------------------------------------------------------------------- |
| `@ai-sdk/anthropic`         | 2.0.65  | **2.0.67**  | [CHANGELOG](https://github.com/vercel/ai/blob/main/packages/anthropic/CHANGELOG.md)         |
| `@ai-sdk/openai`            | 2.0.89  | **2.0.95**  | [CHANGELOG](https://github.com/vercel/ai/blob/main/packages/openai/CHANGELOG.md)            |
| `@ai-sdk/amazon-bedrock`    | 3.0.82  | **3.0.84**  | [CHANGELOG](https://github.com/vercel/ai/blob/main/packages/amazon-bedrock/CHANGELOG.md)    |
| `@ai-sdk/azure`             | 2.0.91  | **2.0.97**  | [CHANGELOG](https://github.com/vercel/ai/blob/main/packages/azure/CHANGELOG.md)             |
| `@ai-sdk/google`            | 2.0.54  | **2.0.56**  | [CHANGELOG](https://github.com/vercel/ai/blob/main/packages/google/CHANGELOG.md)            |
| `@ai-sdk/google-vertex`     | 3.0.106 | **3.0.110** | [CHANGELOG](https://github.com/vercel/ai/blob/main/packages/google-vertex/CHANGELOG.md)     |
| `@ai-sdk/groq`              | 2.0.34  | **2.0.35**  | [CHANGELOG](https://github.com/vercel/ai/blob/main/packages/groq/CHANGELOG.md)              |
| `@ai-sdk/mistral`           | 2.0.27  | **2.0.28**  | [CHANGELOG](https://github.com/vercel/ai/blob/main/packages/mistral/CHANGELOG.md)           |
| `@ai-sdk/cerebras`          | 1.0.36  | **1.0.38**  | [CHANGELOG](https://github.com/vercel/ai/blob/main/packages/cerebras/CHANGELOG.md)          |
| `@ai-sdk/cohere`            | 2.0.22  | **2.0.23**  | [CHANGELOG](https://github.com/vercel/ai/blob/main/packages/cohere/CHANGELOG.md)            |
| `@ai-sdk/gateway`           | 2.0.30  | **2.0.46**  | [CHANGELOG](https://github.com/vercel/ai/blob/main/packages/gateway/CHANGELOG.md)           |
| `@ai-sdk/perplexity`        | 2.0.23  | **2.0.24**  | [CHANGELOG](https://github.com/vercel/ai/blob/main/packages/perplexity/CHANGELOG.md)        |
| `@ai-sdk/togetherai`        | 1.0.34  | **1.0.36**  | [CHANGELOG](https://github.com/vercel/ai/blob/main/packages/togetherai/CHANGELOG.md)        |
| `@ai-sdk/vercel`            | 1.0.33  | **1.0.34**  | [CHANGELOG](https://github.com/vercel/ai/blob/main/packages/vercel/CHANGELOG.md)            |
| `@ai-sdk/xai`               | 2.0.56  | **2.0.61**  | [CHANGELOG](https://github.com/vercel/ai/blob/main/packages/xai/CHANGELOG.md)               |
| `@ai-sdk/openai-compatible` | 1.0.32  | **1.0.33**  | [CHANGELOG](https://github.com/vercel/ai/blob/main/packages/openai-compatible/CHANGELOG.md) |

---

## Packages Already at Latest (within major version)

| Package                       | Current | Notes                                   |
| ----------------------------- | ------- | --------------------------------------- |
| `@openrouter/ai-sdk-provider` | 1.5.4   | Latest in 1.x.x (2.x requires AI SDK 6) |
| `@ai-sdk/deepinfra`           | 1.0.36  | Already latest stable                   |
| `@ai-sdk/provider`            | 2.0.1   | Already latest stable                   |
| `@ai-sdk/provider-utils`      | 3.0.21  | Already latest stable                   |
| `ai-gateway-provider`         | 2.3.1   | Already latest stable                   |

---

## Detailed Change Summaries

### `ai` (5.0.124 → 5.0.140)

Versions 5.0.125 through 5.0.140 are patch releases. The changelog does not have granular entries for each 5.0.x patch version. These releases contain bug fixes and dependency updates backported from the 6.x branch.

### `@ai-sdk/anthropic` (2.0.65 → 2.0.67)

- **2.0.66-2.0.67:** Dependency updates from `@ai-sdk/provider-utils`
- Maintenance releases without feature changes

### `@ai-sdk/openai` (2.0.89 → 2.0.95)

- **2.0.90-2.0.95:** Dependency updates
- Version 2.0.95 is tagged as `ai-v5` (final 2.x release for AI SDK 5 users)
- Major features (GPT-5, Responses API, web search tools) are in 3.x only

### `@ai-sdk/amazon-bedrock` (3.0.82 → 3.0.84)

- **3.0.83-3.0.84:** Dependency updates to `@ai-sdk/anthropic` and `@ai-sdk/provider-utils`
- No direct bug fixes or features specific to Bedrock provider

### `@ai-sdk/azure` (2.0.91 → 2.0.97)

- **2.0.92-2.0.97:** Transitive dependency bumps from `@ai-sdk/openai`
- Inherits improvements from OpenAI provider updates

### `@ai-sdk/google` (2.0.54 → 2.0.56)

- **2.0.55-2.0.56:** Dependency updates from `@ai-sdk/provider-utils`
- No direct feature changes to Google provider

### `@ai-sdk/google-vertex` (3.0.106 → 3.0.110)

- **3.0.107:** Dependency update (`@ai-sdk/anthropic@2.0.66`)
- **3.0.108:** Dependency update (`@ai-sdk/anthropic@2.0.67`)
- **3.0.109:** ⭐ **Feature:** Added support for `gemini-3.1-flash-image-preview` model
- **3.0.110:** Dependency update (`@ai-sdk/google@2.0.56`)

### `@ai-sdk/groq` (2.0.34 → 2.0.35)

- **2.0.35:** Dependency updates
- Final stable 2.x release before 3.x breaking changes

### `@ai-sdk/mistral` (2.0.27 → 2.0.28)

- **2.0.28:** Dependency updates
- Earlier 2.0.x notable features: magistral reasoning models, JSON schema support

### `@ai-sdk/gateway` (2.0.30 → 2.0.46)

- **Significant jump (+16 patch versions)**
- Multiple dependency updates and potential bug fixes
- Worth reviewing individual changelog entries

### `@ai-sdk/xai` (2.0.56 → 2.0.61)

- **+5 patch versions** with dependency updates
- Worth reviewing individual changelog entries

---

## Notes on Major Version Upgrades (NOT Recommended Yet)

The following major versions are available but were **excluded** from this report:

| Package                       | Current Major | Latest Major | Breaking Changes                      |
| ----------------------------- | ------------- | ------------ | ------------------------------------- |
| `ai`                          | 5.x           | 6.x          | Responses API default, new interfaces |
| `@ai-sdk/openai`              | 2.x           | 3.x          | GPT-5 support, Responses API          |
| `@ai-sdk/anthropic`           | 2.x           | 3.x          | ProviderV3 interfaces                 |
| `@ai-sdk/google`              | 2.x           | 3.x          | API changes                           |
| `@ai-sdk/amazon-bedrock`      | 3.x           | 4.x          | Claude Sonnet 4.5, new features       |
| `@openrouter/ai-sdk-provider` | 1.x           | 2.x          | Requires AI SDK 6, ProviderV3         |

**Recommendation:** Upgrading to AI SDK 6 would require a coordinated migration of all providers. Consider planning a separate major version upgrade sprint.

---

## Quick Upgrade Commands

To upgrade all packages at once (after review):

```bash
# Update root catalog (ai)
# Edit package.json catalog.ai from "5.0.124" to "5.0.140"

# Update packages/opencode/package.json dependencies
bun add @ai-sdk/anthropic@2.0.67 \
       @ai-sdk/openai@2.0.95 \
       @ai-sdk/amazon-bedrock@3.0.84 \
       @ai-sdk/azure@2.0.97 \
       @ai-sdk/google@2.0.56 \
       @ai-sdk/google-vertex@3.0.110 \
       @ai-sdk/groq@2.0.35 \
       @ai-sdk/mistral@2.0.28 \
       @ai-sdk/cerebras@1.0.38 \
       @ai-sdk/cohere@2.0.23 \
       @ai-sdk/gateway@2.0.46 \
       @ai-sdk/perplexity@2.0.24 \
       @ai-sdk/togetherai@1.0.36 \
       @ai-sdk/vercel@1.0.34 \
       @ai-sdk/xai@2.0.61 \
       @ai-sdk/openai-compatible@1.0.33
```

---

## References

- AI SDK Repository: https://github.com/vercel/ai
- OpenRouter Provider: https://github.com/OpenRouterTeam/ai-sdk-provider
- AI SDK Documentation: https://sdk.vercel.ai/docs
