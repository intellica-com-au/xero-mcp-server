import { ZodRawShape } from "zod";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "./format-error.js";
import { auth } from "@modelcontextprotocol/sdk/client/auth.js";
import ListInvoicesTool from "../tools/list/list-invoices.tool.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

const authMiddleware = (handler: ToolCallback<any>): ToolCallback<any> => {
  return async (args, args2) => {
    try {
      await xeroClient.authenticate();

      return await handler(args, args2);
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
