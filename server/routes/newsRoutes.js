
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getAllNews,
    getNewsById,
    getExternalNews,
    syncExternalNews,
    getPersonalizedNews
} = require("../controllers/newsController");

// External news
router.get("/external", getExternalNews);
router.get("/sync", syncExternalNews);

// Personalized feed (authentication required)
router.get(
    "/personalized/:profileId",
    protect,
    getPersonalizedNews
);

// Database news
router.get("/", getAllNews);
router.get("/:id", getNewsById);

module.exports = router;
