"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const feedbackController_1 = require("../controller/feedbackController");
const passport_1 = __importDefault(require("passport"));
const router = express_1.default.Router();
// Get all feedbacks
router.get('/feedbacks', feedbackController_1.getFeedbacks);
// Create feedback (authentication required)
router.post('/feedback', passport_1.default.authenticate('jwt', { session: false }), feedbackController_1.createFeedback);
exports.default = router;
