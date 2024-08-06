const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Coach = require("../models/coachSchema");
const CryptoJS = require("crypto-js");
const nodemailer = require("nodemailer");
const filterByDateRange = require("../helper");
require("dotenv").config();


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

// Coach SignUP

router.post("/coachsign", async (req, res) => {
  try {
    const {firstName, lastName, email, phone, password} = req.body

    if(!firstName || !lastName || !email || !phone || !password){
      return res.status(403).json({error: "Please Enter all Fields"})
    }

    const cleanedPhone = phone.trim();
    if (cleanedPhone.length !== 10 || !/^\d+$/.test(cleanedPhone)) {
        return res.status(403).json({ error: "Phone number must be exactly 10 digits" });
    }
    
     if(!emailRegex.test(email)){
      return res.status(403).json({error: "Invalid Email"})
     }

     if(!passwordRegex.test(password)){
      return res.status(403).json({error: "Password must be 8 charecters and must contain a Upper case, Lower case, Symbol and a Number"})
     }


    const coach = await Coach.findOne({ email: req.body.email });
    if (coach) {
      return res.status(409).json({ message: "Email Already Exits." });
    }

    const newCoach = new Coach({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      password:
        req.body.password &&
        CryptoJS.AES.encrypt(
          req.body.password,
          process.env.PASS_SEC
        ).toString(),
    });

    const savedCoach = await newCoach.save();
    res.status(201).json({ ...savedCoach, status: 200 });
  } catch (err) {
    res.status(500).json(err);
  }
});

//COACH LOGIN

router.post("/coachlogin", async (req, res) => {
  
  try {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character'
      });
    }
    const coach = await Coach.findOne({ email });

    if (!coach) {
      return res.status(401).json({ message: "Coach not found." });
    }

    const bytes = CryptoJS.AES.decrypt(coach.password, process.env.PASS_SEC);
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== password) {
      return res.status(401).json({ message: "Invalid password." });
    }

    const token = jwt.sign(
      { email: coach.email, _id: coach._id },
      process.env.JWT_SECRET,
      { expiresIn: "20d" }
    );

    res.status(200).json({
      message: "Login successful.",
      token: token,
      coach: coach,
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
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_EMAIL_CODE,
  },
});

router.post("/coach-forgotpassword", async (req, res) => {
  const { email } = req.body;

  try {
    const coach = await Coach.findOne({ email });

    if (!coach) {
      return res.status(401).json({ message: "Coach not found" });
    }

    const tempPassword = generateTempPassword();

    const encryptedTempPassword = CryptoJS.AES.encrypt(
      tempPassword,
      process.env.PASS_SEC
    ).toString();

    coach.password = encryptedTempPassword;
    await coach.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: coach.email,
      subject: "Your Reset Password Code for Prime Coach",
      text: generateTempPassword(),
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent ===>", info.response);
      }
    });

    res.status(200).send("Email Send SuccessFuly...");
  } catch (err) {
    res.status(500).json(err);
  }
});

// USE CODE
router.post("/coach-forgotpassword/getreset", async (req, res) => {
  try {
    const reset = await Coach.find({
      email: req.body.email,
      otp: req.body.otp,
    });
    if (!reset) {
      res.status(401).send("Code not Match");
    }
    res.status(200).json(reset);
  } catch (err) {
    res.status(500).json(err);
  }
});

// RESET PASSWORD

router.post("/coach-resetpassword", async (req, res) => {
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

      const coach = await Coach.findOne({ email });

      if (!coach) {
        return res.status(404).json({ message: "Coach not found" });
      }

      const encryptedNewPassword = CryptoJS.AES.encrypt(
        newPassword,
        process.env.PASS_SEC
      ).toString();
      coach.password = encryptedNewPassword;
      await coach.save();

      res.status(200).json({ message: "Password reset successfully" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET COACH

router.get("/getcoach", async (req, res) => {
  try {
    const teams = await Coach.find().sort({ createdAt: -1 });
    res.status(200).json(teams);
  } catch (err) {
    res.status(500).json(err);
  }
});




// UPDATE COACH
router.put("/update-coach", async (req, res) => {
  try {
    await Coach.findOneAndUpdate(
      {
        _id: req.body._id,
      },
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
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
      .json({ message: "Coach Updated SuccessFully", status: 200 });
  } catch (err) {
    res.status(500).json(err);
  }
});

//Delete Coach
router.delete("/delete-coach/:id", async (req, res) => {
  try {
    await Coach.findOneAndDelete({
      _id: req.params.id,
    });
    res
      .status(200)
      .json({ message: "Coach Deleted SuccessFully", status: 200 });
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE STATUS

router.put("/update-status", async (req, res) => {
  try {
    await Coach.findOneAndUpdate(
      {
        _id: req.body._id,
      },
      {
        status: req.body.status,
      }
    );
    res
      .status(200)
      .json({ message: "Status Updated SuccessFully", status: 200 });
  } catch (err) {
    res.status(500).json(err);
  }
});

// FILTER COACH WITH DATE

router.get("/filter-coach", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // if (!startDate) {
    //   return res.status(400).json({ error: "Please provide startDate" });
    // }

    const createdAt = filterByDateRange(startDate, endDate);
    const coach = await Coach.find({
      createdAt: createdAt,
    });

    res.status(200).json(coach);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
