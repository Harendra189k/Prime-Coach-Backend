const mongoose = require("mongoose");

const athleteSchema = mongoose.Schema({

    firstName: {
        type: String,
        required: [true, 'first name is required'],
        trim: true,
      },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
      },
      phone: {
        type: Number,
        required: [true, 'Phone No. is required'],
        trim: true,
      },
      password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
      },
      height: {
        type: Number,
        required: [true, 'Height is required'],
      },
      weight: {
        type: Number,
        required: [true, 'Weight is required'],
      },
      membershipType: {
        type: String,
        required: [true, 'MemberShip Type is required'],
        enum: ['Free Trial', 'Standard Membership', 'Prime Membership'],
      },
      membershipDate: {
        type: Date,
        required: [true, 'MemberShip Date is required'],
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
const AtheletModal = mongoose.model("Athlete", athleteSchema)

module.exports = AtheletModal