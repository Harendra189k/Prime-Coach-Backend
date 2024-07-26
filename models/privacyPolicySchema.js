const mongoose = require('mongoose')

const privacyPolicySchema = mongoose.Schema({

  title: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
description: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  }   
},
{
  timestamps: true
})

module.exports = mongoose.model("privacyPolicy", privacyPolicySchema)