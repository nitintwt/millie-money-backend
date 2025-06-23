import { ChatGroq } from "@langchain/groq";
import addTransaction from "./utils/addTransaction";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";

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
  ]

  const toolNode = new ToolNode(tools)
  const boundModel = model.bindTools(tools)
  const memory = new MemorySaver()

  function shouldContinue({ messages }: typeof MessagesAnnotation.State) {
    const lastMessage = messages[messages.length - 1] as AIMessage;
    return lastMessage.tool_calls?.length ? "tools" : "__end__";
  }

  const systemPrompt = new SystemMessage(`
   You are Millie, a helpful financial assistant. Users will talk to you to log expenses, income, or ask for summaries.
   Respond in a friendly and concise manner. Use tools only when needed.
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