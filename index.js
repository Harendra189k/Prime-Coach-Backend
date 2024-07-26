const express  = require("express")
// const cors = require('cors')
const app = express()
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const athleteRoute = require("./router/Athlete")
const coachRoute = require("./router/Coach")
const contactRoute = require("./router/Contact")
const addTeamRoute = require("./router/AddTeam")
const addPlayerRoute = require("./router/AddPlayer")
const adminRoute = require("./router/Admin")
const privacyPolicyRoute = require("./router/PrivacyPolicy")



// app.use(cors())

dotenv.config()


mongoose.connect(
    process.env.MONGO_URL
)
.then(() => console.log("DBConnection Successfull!"))
.catch((err) => {
    console.log(err)
})


app.get("/api/test", (req, res) => {
    res.send("Test route is working!");
});


app.use(express.json())
app.use("/api/prime", athleteRoute)
app.use("/api/prime", coachRoute)
app.use("/api/prime", contactRoute)
app.use("/api/prime", addTeamRoute)
app.use("/api/prime", addPlayerRoute)
app.use("/api/prime", adminRoute)
app.use("/api/prime", privacyPolicyRoute)



app.listen(process.env.PORT || 5000, () => {
    console.log((`Backend Server is Running on port ${process.env.PORT }`))
})