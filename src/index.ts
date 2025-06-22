import dotenv from 'dotenv'
import { app } from './app'
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient().$extends(withAccelerate())

dotenv.config({
  path:'./.env'
})

app.listen(process.env.PORT || 5000 , ()=>{
  console.log("Server is running")
})

//gracefully disconnect db when it is stopped or killed
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})