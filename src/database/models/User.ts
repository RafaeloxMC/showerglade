import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    slackId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String },
    isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
