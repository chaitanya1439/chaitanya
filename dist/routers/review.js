"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controller/reviewController");
const passport_1 = __importDefault(require("passport"));
const router = express_1.default.Router();
// Get all reviews for a room
router.get('/reviews/:roomId', reviewController_1.getReviewsForRoom);
// Create review (authentication required)
router.post('/review', passport_1.default.authenticate('jwt', { session: false }), reviewController_1.createReview);
exports.default = router;
