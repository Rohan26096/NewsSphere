
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getArticleInsights,
    askArticleQuestion,
    getArticleChat,
    clearArticleChat
} = require("../controllers/aiController");

router.use(protect);

router.post("/insights", getArticleInsights);

router.post("/chat", askArticleQuestion);
router.get("/chat/:articleId", getArticleChat);
router.delete("/chat/:articleId", clearArticleChat);

module.exports = router;
