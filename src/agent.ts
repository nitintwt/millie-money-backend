import { ChatGroq } from "@langchain/groq";
import addTransaction from "./utils/addTransaction.js";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";
import todaysDate from "./utils/todaysDate.js";
import getTransactionSummary from "./utils/getTransactionSummary.js";

const agent = async ()=>{
  const model = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    maxRetries: 2,
    maxTokens:750,
    apiKey:process.env.GROQ_API_KEY,
  })

  const tools =[
    addTransaction,
    todaysDate,
    getTransactionSummary
  ]

  const toolNode = new ToolNode(tools)
  const boundModel = model.bindTools(tools)
  const memory = new MemorySaver()

  function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
    const lastMessage = messages[messages.length - 1] as AIMessage;
    return lastMessage.tool_calls?.length ? "tools" : "__end__";
  }

  const systemPrompt = new SystemMessage(`
  You are Millie, an intelligent and friendly financial assistant.

  Your job is to help users manage their money through natural conversations. Users may ask you to log expenses or income, view summaries of their spending, check balances, or understand their financial habits.

  Always respond in a helpful, friendly, and concise tone. 
  If a user gives information that requires database action (like recording a transaction or retrieving data), use the appropriate tool.

  Be proactive in asking for any missing details. If the user's request is unclear, politely ask clarifying questions.

  Only use tools when necessary and never invent data.

  Your responses should feel natural, like a supportive money coach — not like a chatbot.

  use todaysDate tool to get date , use it when user didn't gave exact date.

  Use your logic to categories things. Select category only from this :- [
  "food", "transport", "rent", "utilities", "shopping", "health",
  "entertainment", "travel", "education", "subscriptions", "misc", "gifts", "pets",
  "salary", "freelance", "bonus", "interest", "dividends", "refunds", "reimbursements", "investment", "other"]

  When a user asks "how much I spent today/yesterday/on food", extract:
  - type if mentioned
  - category if mentioned
  - date range: use today's or yesterday's date if said
  Then call 'getTransactionSummary' to answer.

  `);

  async function callModel(state: typeof MessagesAnnotation.State) {
    const userMessages = state.messages
    const messagesWithSystemPrompt = [systemPrompt , ...userMessages]
    const response = await boundModel.invoke(messagesWithSystemPrompt)

    return {messages:[response]}
  }

  const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addEdge("__start__", "agent")
    .addNode("tools", toolNode)
    .addEdge("tools", "agent")
    .addConditionalEdges("agent", shouldContinue);

  return workflow.compile({checkpointer:memory}); 
}

export default agent

;(async () => {
  const millie = await agent()
  const response = await millie.invoke({messages:[new HumanMessage("How much did I spend today ?")]}, {configurable:{thread_id:"1"}})
  console.log(response.messages[response.messages.length - 1].content)
})()