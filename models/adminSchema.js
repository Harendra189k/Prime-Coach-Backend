const mongoose = require('mongoose')

const AdminSchema = mongoose.Schema({

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
      password: {
        type: String,
        required: [true, 'password is required'],
        minlength: [8, 'Password must be at least 8 characters long'], 
      },
      otp: {
        type: String
      }
      
},
{
  timestamps: true
})

module.exports = mongoose.model("Admin", AdminSchema)