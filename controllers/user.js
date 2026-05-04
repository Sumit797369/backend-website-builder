import User from "../models/user.js"

export const getcurrentUser = async (req, res) => {
  try {
    if (!req.userId) {
      return res.json({ user: null })
    }

    const user = await User.findById(req.userId).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.status(200).json(user)

  } catch (error) {
    return res.status(500).json({
      message: `get current user error ${error}`
    })
  }
}