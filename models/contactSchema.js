const mongoose = require("mongoose");

const contactSchema = mongoose.Schema({

    name: {
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

        validate: {
          validator: function(v) {
            return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
          },
          message: props => `${props.value} is not a valid email address!`
        }
      },

      message: {
        type: String,
        required: true,
      },
    
      

})

module.exports = mongoose.model("ContactUs", contactSchema)