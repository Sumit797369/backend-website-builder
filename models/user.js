import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },

  email: {
    type: String,
    unique: true,
    required: true,
  },

  password: {
    type: String,
    default: null, 
  },

  avatar: {
    type: String,
  },

  provider: {
    type: String,
    enum: ["google", "local"],
    default: "local",
  },

  credits: {
    type: Number,
    default: 100,
    min: 0,
  },

  plan: {
    type: String,
    enum: ["free", "pro", "enterprise"],
    default: "free",
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;