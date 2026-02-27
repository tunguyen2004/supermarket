/**
 * Search Routes
 * Tìm kiếm toàn cục
 */

const express = require("express");
const router = express.Router();
const searchService = require("../services/searchService");
const { verifyToken } = require("../middleware/auth");

// GET /api/search?q=keyword&limit=5
router.get("/", verifyToken, searchService.globalSearch);

module.exports = router;
