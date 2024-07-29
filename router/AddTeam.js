const router = require("express").Router();

const filterByDateRange = require("../helper");
const AddTeam = require("../models/addTeamSchema");

// Add Team

router.post("/addteam", async (req, res) => {
  const { teamName, sportType, coachName } = req.body;
  if (!teamName) {
    return res.status(400).json({ error: "Please provide TeamName" });
  }
  if (!sportType) {
    return res.status(400).json({ error: "Please provide SportType." });
  }
  if (!coachName) {
    return res.status(400).json({ error: "Please provide CoachName." });
  }

  try {
    const { error } = AddTeam.validate({ teamName, sportType, coachName });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const newMessage = new AddTeam({
    teamName,
    sportType,
    coachName,
  });

  try {
    const savedMessage = await newMessage.save();
    res.status(201).json({ savedMessage, status: 200 });
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET TEAM
router.get("/getteams", async (req, res) => {
  try {
    const teams = await AddTeam.find();
    res.status(200).json(teams);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE TEAM
router.put("/update-team", async (req, res) => {
  try {
    await AddTeam.findOneAndUpdate(
      {
        _id: req.body._id,
      },
      {
        teamName: req.body.teamName,
        sportType: req.body.sportType,
        coachName: req.body.coachName,
      }
    );
    res.status(200).json({ message: "Team Updated SuccessFully", status: 200 });
  } catch (err) {
    res.status(500).json(err);
  }
});

//Delete Team
router.delete("/delete-team/:id", async (req, res) => {
  try {
    await AddTeam.findOneAndDelete({
      _id: req.params.id,
    });
    res.status(200).json({ message: "Team Deleted SuccessFully", status: 200 });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/update-team-status", async (req, res) => {
  try {
    await AddTeam.findOneAndUpdate(
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

// FILTER TEAM WITH DATE

router.get("/filter-teams", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // if (!startDate || !endDate) {
    //   return res.status(400).json({ error: "Please provide both startDate and endDate query parameters." });
    // }

    const createdAt = filterByDateRange(startDate, endDate);
    const teams = await AddTeam.find({
      createdAt: createdAt,
    });

    res.status(200).json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
