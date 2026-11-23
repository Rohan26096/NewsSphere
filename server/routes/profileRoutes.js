
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    createProfile,
    getProfiles,
    getProfileById,
    updateProfile,
    deleteProfile
} = require("../controllers/profileController");

// All routes below require authentication
router.use(protect);

router.post("/", createProfile);
router.get("/", getProfiles);
router.get("/:id", getProfileById);
router.put("/:id", updateProfile);
router.delete("/:id", deleteProfile);

module.exports = router;
