import express from "express"
// import { generateDemo, getcurrentUser } from "../controllers/user.js"
// import { getMe } from "../controllers/user.controller.js"
import { isAuth } from "../middleware/authmiddleware.js"
import { generteWebsite } from "../controllers/wesbsite.js"

const websiteRouter = express.Router()

websiteRouter.post("/generate", isAuth, generteWebsite)
// userRouter.get("/generate", isAuth, generateDemo)

export default websiteRouter