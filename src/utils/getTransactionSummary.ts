import { z } from "zod";
import { StructuredTool , DynamicStructuredTool } from "@langchain/core/tools";
import { prisma } from "../db/index.js";

const querySchema = z.object({
  from :z.string().optional(),
  to:z.string().optional(),
  category:z.string().optional(),
  type:z.string().optional(),
  ownerId: z.number(),
})

const getTransactionSummary = new DynamicStructuredTool({
  name:"get_transactions_summary",
  description:"get transaction summary on different scenarios",
  schema:querySchema,
  func : async ({from , to , category , type , ownerId=1}) =>{
    try {
      const result = await prisma.transaction.aggregate({
        _sum: {
          amount: true
        },
        where: {
          type: "expense",
          ownerId,
          ...(category && { category }),
          ...(from && to && {
            date: {
              gte: new Date(from),
              lte: new Date(to)
            }
          })
        }
      });
      return { totalSpent: result._sum.amount ?? 0 };
    } catch (error) {
      console.log("Something went wrong while getting transaction summary" , error)
      return{
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }
})

export default getTransactionSummary