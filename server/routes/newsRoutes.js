
const express = require("express");

const router = express.Router();

const {
    getAllNews,
    getNewsById
} = require("../controllers/newsController");

router.get("/", getAllNews);

router.get("/:id", getNewsById);

module.exports = router;
