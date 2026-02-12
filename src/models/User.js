import mongoose from "mongoose";

// Define the user schema.
// Each user has a title and content, both required.
const userSchema = new mongoose.Schema({
    username: {type: String, required: true }, 
    password: { type: String, required: true },
    displayName: { type: String, required: true },
    accessLevel: { type: String, required: true }
}, { timestamps: true });

// Export the User model based on the schema.
export default mongoose.model("User", userSchema);