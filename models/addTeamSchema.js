const mongoose = require("mongoose");

const addTeamSchema = mongoose.Schema({

    teamName: {
        type: String,
        required: true,
        trim: true,
      },
    
      sportType: {
        type: String,
        required: true,
        trim: true,
      },

      coachName: {
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

module.exports = mongoose.model("AddTeam", addTeamSchema)