import { ZodRawShape } from "zod";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "./format-error.js";

// const authMiddleware = <Args extends undefined | ZodRawShape = any>(
//   callback: ToolCallback<Args>,
// ): (...args) => {
//   return async (args) => {
//     try {
//       await xeroClient.authenticate();

//       return await callback(args);
//     } catch (error) {
//       return {
//         result: null,
//         isError: true,
//         error: formatError(error),
//       };
//     }
//   };
// };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const authMiddleware: any = (handler: any) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const func = async (...args: any) => {
    try {
      await xeroClient.authenticate();

      return await handler(...args);
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
  };

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
      handler: authMiddleware(handler),
    });
