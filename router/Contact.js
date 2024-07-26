const router = require("express").Router();

const ContactUs = require("../models/contactSchema")


// Contact Us 

router.post("/contact", async (req, res) => {
 
  const { name, email, message } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Please provide name" });
  }
  if (!message) {
    return res.status(400).json({ error: "Please provide message." });
  }
  if (!email) {
    return res.status(400).json({ error: "Please provide email." });
  }
  

  try {
    const { error } = ContactUs.validate({ name, email, message });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  
  const newMessage = new ContactUs({
    name,
    email,
    message
  });

  try {
    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;