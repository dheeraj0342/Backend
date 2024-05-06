import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    valodator: {
      validate: (val) => emailRegex.test(val),
      message: "Please enter a valid email",
    },
    unique: true,
    required: [true, "Please enter your email"],
  },
  password: {
    type: String,
    minlength: [6, "Password must be at least 6 characters long"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  avatar: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  courses: [
    {
      courseId : String
    },
  ],
},{
  timestamps: true,
});

//hash password before saving user
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// compare password 
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
//sign access token
userSchema.methods.SignAccessToken = function() {
  return jwt.sign({ id: this._id }, process.env.ACCESS_SECRET,{
    expiresIn: "5m",
  });
};

userSchema.methods.SignRefreshToken = function() {
  return jwt.sign({ id: this._id }, process.env.REFRESH_SECRET,{
    expiresIn: "3d",
  });
};

export default mongoose.model("User", userSchema);

