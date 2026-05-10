import express from "express"
import dotenv from "dotenv"
dotenv.config();
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import cors from "cors"
import userRouter from "./routes/user.route.js";
import websiteRouter from "./routes/website.route.js";
const app = express();
const port = process.env.PORT || 8000
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true
}))

app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)
app.use("/api/website",websiteRouter)

connectDB().then(() => {
    app.listen(port, () => {
        console.log("server started on port " + port);
    });
}).catch(err => {
    console.error("Failed to connect to DB", err);
});