require("dotenv").config();

const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminSchema");
const CryptoJS = require("crypto-js");
const nodemailer = require("nodemailer");
const coachSchema = require("../models/coachSchema");
const athleteSchema = require("../models/athleteSchema");
const addTeamSchema = require("../models/addTeamSchema");
const addPlayerSchema = require("../models/addPlayerSchema");

// Admin

router.post("/adminlist", async (req, res) => {
  try {
    const newAdmin = new Admin({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password:
        req.body.password &&
        CryptoJS.AES.encrypt(
          req.body.password,
          process.env.PASS_SEC
        ).toString(),
    });

    const savedAdmin = await newAdmin.save();
    res.status(201).json(savedAdmin);
  } catch (err) {
    res.status(500).json(err);
  }
});

//ADMIN LOGIN

router.post("/adminlogin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: "Admin not found." });
    }

    const bytes = CryptoJS.AES.decrypt(admin.password, process.env.PASS_SEC);
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== password) {
      return res.status(401).json({ message: "Invalid password." });
    }

    const token = jwt.sign(
      { email: admin.email, _id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "200d" }
    );

    res.status(200).json({
      message: "Login successful.",
      token: token,
      admin: admin,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin FORGOT PASSWORD

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

router.post("/admin-forgotpassword", async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    const otp = generateTempPassword();

    admin.otp = otp;
    await admin.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: admin.email,
      subject: "Your Reset Password Code for Admin ",
      text: otp,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent ===>", info.response);
      }
    });

    res.status(200).send("Email Send SuccessFuly");
  } catch (err) {
    res.status(500).json(err);
  }
});

// USE CODE
router.post("/admin-forgotpassword/getreset", async (req, res) => {
  try {
    const reset = await Admin.findOne({
      otp: req.body.otp,
    });
    if (!reset) {
      res.status(401).send("Code not match");
    } else {
      res.status(200).json(reset);
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/admin-resetpassword", async (req, res) => {
  try {
    await Admin.findOneAndUpdate(
      {
        email: req.body.email,
      },
      {
        password:
          req.body.password &&
          CryptoJS.AES.encrypt(
            req.body.password,
            process.env.PASS_SEC
          ).toString(),
      },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Password Changed SuccessFully", status: 200 });
  } catch (err) {
    res.status(500).json(err);
  }
});

// COACH STATUS
router.put("/status/:id", async (req, res) => {
  try {
    const coachstatus = await coachSchema.findOne({
      _id: req.params.id,
    });
    if (!coachstatus) {
      res.status(401).send("Coach not Match");
    }
    coachstatus.status = req.body.status;
    //  console.log("CoachStatus", coachstatus)
    await coachstatus.save();
    res.status(200).json(coachstatus);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ADMIN
router.get("/getadmin", async (req, res) => {
  try {
    const admin = await Admin.findOne();
    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET COUNT
router.get("/getcount", async (req, res) => {
  try {
    const coach = await coachSchema.countDocuments();
    const athlete = await athleteSchema.countDocuments();
    const addTeam = await addTeamSchema.countDocuments();
    const addPlayer = await addPlayerSchema.countDocuments();
    res.status(200).json({
      coach: coach,
      athlete: athlete,
      addTeam: addTeam,
      addPlayer: addPlayer,
      status: 200,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE ADMIN
router.put("/update-admin", async (req, res) => {
  try {
    await Admin.findOneAndUpdate({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    });
    res
      .status(200)
      .json({ message: "Admin Updated SuccessFully", status: 200 });
  } catch (err) {
    res.status(500).json(err);
  }
});

//   // CHANGE ADMIN PASSWORD
// router.post("/change-admin-password", async (req, res) => {
//   try {
//     const adminData = await Admin.findOne(
//       {
//         email: req.body.email,
//       },

//     );
//     const admin_is_pass_match = adminData.password
//     const decryptedPassword = admin_is_pass_match.toString(CryptoJS.enc.Utf8);
//     console.log(decryptedPassword)
//     if(decryptedPassword ===  req.body.oldPassword){
//        const changePassword = req.body.newPassword

//       adminData.password = changePassword;
//      await adminData.save();

//     }else {
//       return res.status(401).json({ message: "Old Password not Match" });
//     }
//     res
//       .status(200)
//       .json({ message: "Admin Password Change SuccessFully", status: 200 });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

router.put("/change-admin-password", async (req, res) => {
  try {
    const adminData = await Admin.findOne({ email: req.body.email });
    if (!adminData) {
      return res.status(404).json({ message: "Admin not found" });
    }
    const storedEncryptedPassword = adminData.password;
    const bytes = CryptoJS.AES.decrypt(
      storedEncryptedPassword,
      process.env.PASS_SEC
    );
    const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
    // console.log(decryptedPassword)

    if (decryptedPassword === req.body.oldPassword) {
      adminData.password =
        req.body.newPassword &&
        CryptoJS.AES.encrypt(
          req.body.newPassword,
          process.env.PASS_SEC
        ).toString();
      await adminData.save();

      return res
        .status(200)
        .json({ message: "Admin Password Changed Successfully", status: 200 });
    } else {
      return res.status(401).json({ message: "Old Password does not match" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;

