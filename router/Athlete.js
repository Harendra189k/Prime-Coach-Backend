const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Athlete = require("../models/athleteSchema");
const CryptoJS = require("crypto-js");
const nodemailer = require("nodemailer");
const cors = require('cors');
const AtheletModal = require("../models/athleteSchema");
const filterByDateRange = require("../helper");
require('dotenv').config();


router.use(cors());

// Athlete SignUP

router.post("/athletesign", async (req, res) => {
  try {
    const password = req.body.password &&
    CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString()

    const athlete = await Athlete.findOne({ email:req.body.email });
    if(athlete){
      return res.status(409).json({ message: "Email Already Exit."});
    }

    const savedAthlete = await AtheletModal.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      password: password,
      height: req.body.height,
      weight: req.body.weight,
      membershipType: req.body.membershipType,
      membershipDate: req.body.membershipDate,
    });
    // console.log(savedAthlete,"savedAthlete")
    res.status(201).json({message:"created data successfully", status:200} );
  } catch (err) {
    res.status(500).json(err);
  }
});



// Athlete Login with JWT token

router.post("/athletelogin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const athlete = await Athlete.findOne({ email });

    if (!athlete) {
      return res.status(401).json({ message: "Athlete not found." });
    }

    const decryptedPassword = CryptoJS.AES.decrypt(
      athlete.password,
      process.env.PASS_SEC
    ).toString(CryptoJS.enc.Utf8);

    if (decryptedPassword !== password) {
      return res.status(401).json({ message: "Invalid password." });
    }

    const token = jwt.sign(
      { email: athlete.email, _id: athlete._id },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );

    // console.log("Athlete Token ========>>>>>", token);

    res.status(200).json({
      message: "Login successful.",
      token: token,
      athlete: athlete,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// FORGOT PASSWORD

const generateTempPassword = () => {
  return Math.random().toString(36).slice(-8);
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  port: 465,
  auth: {
    user:	process.env.SENDER_EMAIL, 
    pass:	process.env.SENDER_EMAIL_CODE,
  }
});

router.post("/athlete-forgotpassword", async (req, res) => {
  const { email } = req.body;

  try {
    const athlete = await Athlete.findOne({ email });


    if (!athlete) {
      return res.status(401).json({ message: "Athlete not found" });
    }

    const tempPassword = generateTempPassword();

    const encryptedTempPassword = CryptoJS.AES.encrypt(
      tempPassword,
      process.env.PASS_SEC
    ).toString();

    athlete.password = encryptedTempPassword;
    await athlete.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: athlete.email,
      subject: "Your Code for reset password for Prime Coach",
      text: generateTempPassword(),
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent ===>", info.response);
      }
    });
    res.status(200).send("Email Send SuccessFull!")
  } catch (err) {
    res.status(500).json(err);
  }
});

// Reset Password API

router.post("/athlete-resetpassword", async (req, res) => {
  const { email, token, newPassword } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        console.error(err);
        return res.status(401).json({ message: "Invalid or expired token" });
      }

      const { email } = decodedToken;

      const athlete = await Athlete.findOne({ email });

      if (!athlete) {
        return res.status(404).json({ message: "athlete not found" });
      }

      const encryptedNewPassword = CryptoJS.AES.encrypt(
        newPassword,
        process.env.PASS_SEC
      ).toString();
      athlete.password = encryptedNewPassword;
      await athlete.save();

      res.status(200).json({ message: "Password reset successfully" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});


// GET ATHLETE
router.get("/getathlete", async(req, res) => {
  try{
    const ath = await Athlete.find(
      
    ).sort({createdAt:-1})
    res.status(200).json(ath)
  } 
  catch(err){
    res.status(500).json(err)
  }
})

// UPDATE ATHLETE
router.put("/update-athlete", async (req, res) => {
  try {
    await Athlete.findOneAndUpdate(
      {
        _id: req.body._id,
      },
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        height: req.body.height,
        weight: req.body.weight,
        membershipType: req.body.membershipType,
        membershipDate: req.body.membershipDate,
        password:
          req.body.password &&
          CryptoJS.AES.encrypt(
            req.body.password,
            process.env.PASS_SEC
          ).toString(),
      }
    );
    res
      .status(200)
      .json({ message: "Athlete Updated SuccessFully", status: 200 });
  } catch (err) {
    res.status(500).json(err);
  }
});

//Delete Athlete
router.delete("/delete-athlete/:id", async (req, res) => {
  try {
    await Athlete.findOneAndDelete({
      _id: req.params.id,
    }); res.status(200).json({ message: "Athlete Deleted SuccessFully", status: 200 });
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE STATUS

router.put("/update-athlete-status", async (req, res) => {
  try {
    await Athlete.findOneAndUpdate(
      {
        _id: req.body._id,
      },
      {
        status: req.body.status
      }
    );
    res
      .status(200)
      .json({ message: "Status Updated SuccessFully", status: 200 });
  } catch (err) {
    res.status(500).json(err);
  }
});


// FILTER ATHLETE WITH DATE

router.get("/filter-athlete", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // if (!startDate || !endDate) {
    //   return res.status(400).json({ error: "Please provide both startDate and endDate" });
    // }

     if (!startDate) {
      return res.status(200).json({ error: "Please provide  startDate", success:false });
     }

    const createdAt = filterByDateRange(startDate, endDate)
    const athlete = await Athlete.find(
       {
        createdAt:createdAt
      }
    );
    
    res.status(200).json(athlete);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
