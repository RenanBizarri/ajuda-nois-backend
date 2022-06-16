import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import routes from "./routes";

const app = express()
const port = 3000

dotenv.config()

const user = process.env.MONGO_USER
const pass = process.env.MONGO_PASS

const uri = `mongodb+srv://${user}:${pass}@cluster0.h98zpzi.mongodb.net/?retryWrites=true&w=majority`

mongoose.connect(uri).catch(err => {
    console.log(`Erro: ${err}`)
})

const allowedOrigins = [`http://localhost:${port}`, "https://ajudanois.vercel.app", "https://ajuda-nois.herokuapp.com"]
const corsOptions: cors.CorsOptions = {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"]
}

app.use(cors())
app.use(express.json({ limit: '5mb' }))
app.use(routes)

app.listen(process.env.PORT || port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})