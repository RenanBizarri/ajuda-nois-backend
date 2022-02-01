import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import routes from "./routes";

const app = express()
const port = 3003

dotenv.config()

const user = process.env.MONGO_USER
const pass = process.env.MONGO_PASS

const uri = `mongodb+srv://${user}:${pass}@cluster0.ekd7k.mongodb.net/Ajuda_Nois?retryWrites=true&w=majority`

mongoose.connect(uri).catch(err => {
    console.log(`Erro: ${err}`)
})

app.use(express.json())
app.use(routes)

app.listen(process.env.PORT || port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})