const mongoose = require("mongoose");

const addPlayerSchema = mongoose.Schema({

    firstName: {
        type: String,
        required: true,
        trim: true,
      },

      lastName: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,

        // validate: {
        //   validator: function(v) {
        //     return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
        //   },
        //   message: props => `${props.value} is not a valid email address!`
        // }
      },

      category: {
        type: String,
        required: true,
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

module.exports = mongoose.model("AddPlayer", addPlayerSchema)