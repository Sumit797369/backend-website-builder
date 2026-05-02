import express from "express"
import { googleAuth, logOut,register,login } from "../controllers/auth.js"
import { isAuth } from "../middleware/authmiddleware.js"


const authRouter = express.Router()


authRouter.post("/google", googleAuth)

authRouter.post("/register", register)
authRouter.post("/login", login)
authRouter.post("/logout", logOut)


authRouter.get("/me", isAuth, (req, res) => {
  res.json({ message: "User is authenticated", userId: req.userId })
})

export default authRouter