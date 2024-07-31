const mongoose = require("mongoose");

const coachSchema = mongoose.Schema({

    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
      },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Email  is required'],
        unique: true,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: Number,
        required: [true, 'Phone  is required'],
        trim: true,
      },
      password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'], 
      },
      otp: {
        type: String,
      },

      status: {
        type:String,
        ENUM: ["active", "deactive"],
        default: "active"
      }
},
{
  timestamps: true
})

module.exports = mongoose.model("Coach", coachSchema)