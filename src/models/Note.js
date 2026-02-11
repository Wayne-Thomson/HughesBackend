import mongoose from "mongoose";

// Define the Note schema.
// Each note has a title and content, both required.
const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true  
    }
}, { timestamps: true });

// Export the Note model based on the schema.
export default mongoose.model("Note", noteSchema);