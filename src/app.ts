import express from "express"
import cors from 'cors'

const app = express()

app.use(cors({
  origin: "*",
  credentials:true,
}))

app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended: true , limit:"16kb"})) 

app.get("/" , (req, res) =>{
  res.status(200).json({
    message: "Going good"
  })
})

export {app}