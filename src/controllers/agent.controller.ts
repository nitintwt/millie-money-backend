import { HumanMessage } from "@langchain/core/messages"
import agent from "../agent.js"
import { z } from "zod"
import { io } from "../app.js"
import { Socket } from "socket.io"

const inputSchema = z.object({
  input:z.string(),
  userId:z.number()
})

const reActAgent = async (message) => {

  try {
    const millie = await agent()
    const response = await millie.invoke({messages:[new HumanMessage(message)]} , {configurable:{thread_id:"1"}})
    return response.messages[response.messages.length - 1].content
  } catch (error) {
    return "Something went wrong. Try again"
  }
}

export default reActAgent