
const express = require("express");
const router = express.Router();

const {
    getAllNews,
    getNewsById,
    getExternalNews,
    syncExternalNews
} = require("../controllers/newsController");

// External API routes must come before /:id
router.get("/external", getExternalNews);
router.get("/sync", syncExternalNews);

// Database routes
router.get("/", getAllNews);
router.get("/:id", getNewsById);

module.exports = router;
