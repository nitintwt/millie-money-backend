import { z } from "zod";
import { StructuredTool , DynamicStructuredTool } from "@langchain/core/tools";
import { prisma } from "../db/index.js";

const transactionSchema = z.object({
  type: z.string(),
  amount: z.number(),
  date: z.string(),
  ownerId: z.number()
});

const addTransaction = new DynamicStructuredTool({
  name: "add_transaction",
  description: "Add a transaction (income or expense) to the database. Requires type, amount, date, and ownerId.",
  schema: transactionSchema,
  func: async ({ type, amount, date, ownerId }) => {
    try {
      await prisma.transaction.create({
        data: {
          type,
          amount,
          date: new Date(date),
          ownerId
        }
      });
      return { success: true};
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
});

export default addTransaction;
