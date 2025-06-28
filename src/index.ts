import dotenv from 'dotenv'
import { server } from './app'
import connectDb from './db/index.js'

dotenv.config({
  path:'./.env'
})

connectDb()
.then(()=>{
  server.listen(process.env.PORT, ()=>{
    console.log("Server is running ")
  })
})