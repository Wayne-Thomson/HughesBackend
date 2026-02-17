import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Define the user schema.
// Each user has a title and content, both required.
const userSchema = new mongoose.Schema({
    username: {type: String, required: true }, 
    password: { type: String, required: true },
    displayName: { type: String, required: true },
    isAdmin: { type: Boolean, required: true }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return;
  }

  // Generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Export the User model based on the schema.
export default mongoose.model("User", userSchema);