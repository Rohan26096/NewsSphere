
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    createHighlight,
    getHighlights,
    updateHighlight,
    deleteHighlight
} = require("../controllers/highlightController");

router.use(protect);

router.post("/", createHighlight);
router.get("/", getHighlights);
router.put("/:id", updateHighlight);
router.delete("/:id", deleteHighlight);

module.exports = router;
