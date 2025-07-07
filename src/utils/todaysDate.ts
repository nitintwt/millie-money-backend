import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const todaysDate = new DynamicStructuredTool({
  name: "get_todays_date",
  description: "This function returns today's date. Use it when user didn't give a date.",
  schema: z.object({}),
  func: async () => {
    return new Date().toISOString()
  }
});

export default todaysDate