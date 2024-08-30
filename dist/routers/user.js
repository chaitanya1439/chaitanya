"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controller/authController");
const authenticate_1 = require("../middleware/authenticate");
const passport_1 = __importDefault(require("passport"));
const router = express_1.default.Router();
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
router.get('/login', authController_1.login);
router.post('/logout', authenticate_1.authenticate, authController_1.logout);
router.get('/profile', authenticate_1.authenticate, authController_1.getUserProfile);
router.put('/profile', authenticate_1.authenticate, authController_1.updateUserProfile);
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/secrets', passport_1.default.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    // Access the authenticated user:
    if (req.user) {
        // You can now access the authenticated user's information:
        const user = req.user;
        console.log('Authenticated user:', user);
        // Redirect to the profile route:
        res.redirect('/profile');
    }
    else {
        // Handle the case where authentication failed:
        // You might want to access error information from 'req' here:
        // console.log('Authentication failed:', req.error); 
        res.redirect('/login');
        res.redirect('/register');
    }
});
exports.default = router;
