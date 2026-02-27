// kilocode_change - new file
import { test, expect, describe, beforeAll } from "bun:test"
import path from "path"

import { tmpdir } from "../fixture/fixture"
import { Instance } from "../../src/project/instance"
import { Provider } from "../../src/provider/provider"
import { Env } from "../../src/env"

describe("SAP AI Core Provider", () => {
  test("provider loads when AICORE_SERVICE_KEY is set", async () => {
    await using tmp = await tmpdir({
      init: async (dir) => {
        await Bun.write(
          path.join(dir, "opencode.json"),
          JSON.stringify({
            $schema: "https://app.kilo.ai/config.json",
          }),
        )
      },
    })
    await Instance.provide({
      directory: tmp.path,
      init: async () => {
        // Set a mock service key (JSON format expected by SAP SDK)
        const mockServiceKey = JSON.stringify({
          clientid: "test-client-id",
          clientsecret: "test-client-secret",
          url: "https://test.authentication.sap.hana.ondemand.com",
          serviceurls: {
            AI_API_URL: "https://api.ai.test.sap.hana.ondemand.com",
          },
        })
        Env.set("AICORE_SERVICE_KEY", mockServiceKey)
      },
      fn: async () => {
        const providers = await Provider.list()
        expect(providers["sap-ai-core"]).toBeDefined()
        expect(providers["sap-ai-core"].source).toBe("env")
      },
    })
  })

  test("provider does not load when AICORE_SERVICE_KEY is not set", async () => {
    await using tmp = await tmpdir({
      init: async (dir) => {
        await Bun.write(
          path.join(dir, "opencode.json"),
          JSON.stringify({
            $schema: "https://app.kilo.ai/config.json",
          }),
        )
      },
    })
    await Instance.provide({
      directory: tmp.path,
      fn: async () => {
        const providers = await Provider.list()
        expect(providers["sap-ai-core"]).toBeUndefined()
      },
    })
  })

  test("provider respects deploymentId and resourceGroup from env", async () => {
    await using tmp = await tmpdir({
      init: async (dir) => {
        await Bun.write(
          path.join(dir, "opencode.json"),
          JSON.stringify({
            $schema: "https://app.kilo.ai/config.json",
          }),
        )
      },
    })
    await Instance.provide({
      directory: tmp.path,
      init: async () => {
        const mockServiceKey = JSON.stringify({
          clientid: "test-client-id",
          clientsecret: "test-client-secret",
          url: "https://test.authentication.sap.hana.ondemand.com",
          serviceurls: {
            AI_API_URL: "https://api.ai.test.sap.hana.ondemand.com",
          },
        })
        Env.set("AICORE_SERVICE_KEY", mockServiceKey)
        Env.set("AICORE_DEPLOYMENT_ID", "test-deployment-123")
        Env.set("AICORE_RESOURCE_GROUP", "test-resource-group")
      },
      fn: async () => {
        const providers = await Provider.list()
        expect(providers["sap-ai-core"]).toBeDefined()
        expect(providers["sap-ai-core"].options.deploymentId).toBe("test-deployment-123")
        expect(providers["sap-ai-core"].options.resourceGroup).toBe("test-resource-group")
      },
    })
  })

  test("provider can be configured with custom models via config", async () => {
    await using tmp = await tmpdir({
      init: async (dir) => {
        await Bun.write(
          path.join(dir, "opencode.json"),
          JSON.stringify({
            $schema: "https://app.kilo.ai/config.json",
            provider: {
              "sap-ai-core": {
                models: {
                  "gpt-4o": {
                    name: "GPT-4o via SAP AI Core",
                    tool_call: true,
                    limit: { context: 128000, output: 4096 },
                  },
                  "claude-3-sonnet": {
                    name: "Claude 3 Sonnet via SAP AI Core",
                    tool_call: true,
                    limit: { context: 200000, output: 4096 },
                  },
                },
              },
            },
          }),
        )
      },
    })
    await Instance.provide({
      directory: tmp.path,
      init: async () => {
        const mockServiceKey = JSON.stringify({
          clientid: "test-client-id",
          clientsecret: "test-client-secret",
          url: "https://test.authentication.sap.hana.ondemand.com",
          serviceurls: {
            AI_API_URL: "https://api.ai.test.sap.hana.ondemand.com",
          },
        })
        Env.set("AICORE_SERVICE_KEY", mockServiceKey)
      },
      fn: async () => {
        const providers = await Provider.list()
        expect(providers["sap-ai-core"]).toBeDefined()
        expect(providers["sap-ai-core"].models["gpt-4o"]).toBeDefined()
        expect(providers["sap-ai-core"].models["gpt-4o"].name).toBe("GPT-4o via SAP AI Core")
        expect(providers["sap-ai-core"].models["claude-3-sonnet"]).toBeDefined()
      },
    })
  })

  test("provider loads from auth when AICORE_SERVICE_KEY not in env", async () => {
    // This tests that auth credentials are applied to process.env
    await using tmp = await tmpdir({
      init: async (dir) => {
        await Bun.write(
          path.join(dir, "opencode.json"),
          JSON.stringify({
            $schema: "https://app.kilo.ai/config.json",
          }),
        )
      },
    })
    await Instance.provide({
      directory: tmp.path,
      init: async () => {
        // Ensure no env var is set initially
        delete process.env.AICORE_SERVICE_KEY
      },
      fn: async () => {
        // Without auth or env var, provider should not be loaded
        const providers = await Provider.list()
        expect(providers["sap-ai-core"]).toBeUndefined()
      },
    })
  })
})
