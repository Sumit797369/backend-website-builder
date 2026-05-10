import express from "express"
import {  getcurrentUser } from "../controllers/user.js"
// import { getMe } from "../controllers/user.controller.js"
import { isAuth } from "../middleware/authmiddleware.js"

const userRouter = express.Router()

userRouter.get("/me", isAuth, getcurrentUser)
// userRouter.get("/generate", isAuth, generateDemo)

export default userRouter