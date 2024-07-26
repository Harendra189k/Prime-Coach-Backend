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
        required: [true, 'email  is required'],
        unique: true,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: Number,
        required: [true, 'phone  is required'],
        trim: true,
      },
      password: {
        type: String,
        required: [true, 'password is required'],
        minlength: [6, 'Password must be at least 6 characters long'], 
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