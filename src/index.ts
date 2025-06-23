import dotenv from 'dotenv'
import { app } from './app'
import connectDb from './db/index.js'

dotenv.config({
  path:'./.env'
})

connectDb()
.then(()=>{
  app.listen(process.env.PORT, ()=>{
    console.log("Server is running ")
  })
})