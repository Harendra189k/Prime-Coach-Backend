const router = require("express").Router();
const filterByDateRange = require('../helper')

const AddPlayer = require("../models/addPlayerSchema")


// Add Player 

router.post("/addplayer", async (req, res) => {
 
  const { firstName, lastName, email, category } = req.body;
  if (!firstName) {
    return res.status(400).json({ error: "Please provide FirstName" });
  }
  if (!lastName) {
    return res.status(400).json({ error: "Please provide LastName." });
  }
  if (!email) {
    return res.status(400).json({ error: "Please provide Email." });
  }
  if (!category) {
    return res.status(400).json({ error: "Please provide Category." });
  }
  

  try {
    const { error } = AddPlayer.validate({ firstName, lastName, email, category });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const newMessage = new AddPlayer({
    firstName,
    lastName,
    email,
    category
  });

  try {
    const savedMessage = await newMessage.save();
    res.status(201).json({savedMessage, status:200});
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET PALYER
router.get("/getplayer", async(req, res) => {
  try{
    const teams = await AddPlayer.find(

    ).sort({createdAt:-1})
    res.status(200).json(teams)
  } 
  catch(err){
    res.status(500).json(err)
  }
})

// UPDATE PLAYER 
router.put("/update-player", async (req, res) => {
  try {
    await AddPlayer.findOneAndUpdate(
      {
        _id: req.body._id,
      },
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        category: req.body.category
      }
    );
    res
      .status(200)
      .json({ message: "Player Updated SuccessFully", status: 200 });
  } catch (err) {
    res.status(500).json(err);
  }
});

//Delete Team
router.delete("/delete-player/:id", async (req, res) => {
  try {
    await AddPlayer.findOneAndDelete({
      _id: req.params.id,
    }); res.status(200).json({ message: "Player Deleted SuccessFully", status: 200 });
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE STATUS
router.put("/update-player-status", async (req, res) => {
  try {
    await AddPlayer.findOneAndUpdate(
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


// FILTER PLAYER WITH DATE

router.get("/filter-players", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // if (!startDate || !endDate) {
    //   return res.status(400).json({ error: "Please provide both startDate and endDate query parameters." });
    // }

    const createdAt = filterByDateRange(startDate, endDate)
    const teams = await AddPlayer.find(
       {
        createdAt:createdAt
      }
    );

    res.status(200).json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;