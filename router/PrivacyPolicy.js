const router = require("express").Router();

const filterByDateRange = require("../helper");
const privacyPolicySchema = require("../models/privacyPolicySchema")


// Privacy Policy

router.post("/privacy-policy", async (req, res) => {
 
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Please provide Title" });
  }
  if (!description) {   
    return res.status(400).json({ error: "Please provide Description." });
  }
  
  try {
    const { error } = privacyPolicySchema.validate({ title, description });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  
  const newMessage = new privacyPolicySchema({
    title,
    description
  });

  try {
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

 // GET PRIVACY POLICY 
 router.get("/privacy-policy", async (req, res) => {
    try {
      const privacyPolicy = await privacyPolicySchema.find();
      res.status(200).json(privacyPolicy);
    } catch (err) {
      res.status(500).json(err);
    }
  });

  
// UPDATE PRIVACY POLICY 
router.put("/update-privacy-policy", async (req, res) => {
    try {
      await privacyPolicySchema.findOneAndUpdate(
        {
          _id: req.body._id,
        },
        {
          title: req.body.title,
          description: req.body.description
        }
      );
      res
        .status(200)
        .json({ success:true, message: "Privacy Policy Updated SuccessFully", status: 200 });
    } catch (err) {
      res.status(500).json(err);
    }
  });


  // FILTER TEAM WITH DATE

router.get("/filter-static-content", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
  
      // if (!startDate || !endDate) {
      //   return res.status(400).json({ error: "Please provide both startDate and endDate query parameters." });
      // }
  
      const createdAt = filterByDateRange(startDate, endDate)
      const staticContent = await privacyPolicySchema.find(
         {
          createdAt:createdAt
        }
      );
  
      res.status(200).json(staticContent);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

module.exports = router;