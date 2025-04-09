import { ZodRawShape } from "zod";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "./format-error.js";
import { RequestHandlerExtra } from "@modelcontextprotocol/sdk/shared/protocol.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const authMiddleware = <Args extends undefined | ZodRawShape = undefined>(
  handler: ToolCallback<Args>,
): ToolCallback<Args> => {
  const func: ToolCallback<Args> = (async (
    props: { [x: string]: unknown } & RequestHandlerExtra,
    extra,
  ) => {
    try {
      await xeroClient.authenticate();

      return await handler(props, extra);
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${formatError(error)}`,
          },
        ],
      };
    }
  }) as ToolCallback<Args>;

  return func;
};

export const CreateXeroTool =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <Args extends undefined | ZodRawShape = any>(
      name: string,
      description: string,
      schema: Args,
      handler: ToolCallback<Args>,
    ): (() => ToolDefinition<Args>) =>
    () => ({
      name: name,
      description: description,
      schema: schema,
      handler: authMiddleware(handler) as ToolCallback<Args>,
    });
