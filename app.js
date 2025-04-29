import express from 'express'
import userRouter from './routes/user.routes.js'
import { configDotenv } from "dotenv";
import connectToDb from './config/db.js';
import cookieParser from 'cookie-parser';
import indexRouter from './routes/index.route.js'

configDotenv()
connectToDb()
const app = express()

app.set('view engine', 'ejs');
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/user', userRouter);
app.use('/', indexRouter)


app.listen(3000, () => {
    console.log(`server is running on http://localhost:3000`)
})     