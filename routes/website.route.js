import express from "express"
// import { generateDemo, getcurrentUser } from "../controllers/user.js"
// import { getMe } from "../controllers/user.controller.js"
import { isAuth } from "../middleware/authmiddleware.js"
import { generteWebsite, deployWebsite, getWebsiteBySlug, fetchWebsiteById } from "../controllers/wesbsite.js"

const websiteRouter = express.Router()

websiteRouter.post("/generate", isAuth, generteWebsite)
websiteRouter.post("/deploy/:id", isAuth, deployWebsite)
websiteRouter.get("/id/:id", isAuth, fetchWebsiteById)
websiteRouter.get("/:slug", getWebsiteBySlug)
// userRouter.get("/generate", isAuth, generateDemo)

export default websiteRouter