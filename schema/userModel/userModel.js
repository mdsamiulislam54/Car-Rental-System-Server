import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true 
    },
    userEmail: {
      type: String,
      required: true 
    },
    role: {
      type: String,
      default: 'user'
    }
  },
  {
    timestamps: true
  }
);

export const UserModel = mongoose.model("User", UserSchema);
