"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPhoneNumber = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const passport_google_oauth2_1 = require("passport-google-oauth2");
const auth_1 = __importDefault(require("../middleware/auth"));
const cookie_1 = __importDefault(require("cookie"));
const libphonenumber_js_1 = require("libphonenumber-js");
const twilio_1 = __importDefault(require("twilio"));
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'your_google_client_id';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret';
const TWILIO_SID = process.env.TWILIO_SID || 'your_twilio_sid';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'your_twilio_auth_token';
const TWILIO_PHONE = process.env.TWILIO_PHONE || 'your_twilio_phone';
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
function isValidPhoneNumber(phone) {
    const phoneNumber = (0, libphonenumber_js_1.parsePhoneNumberFromString)(phone);
    return phoneNumber ? phoneNumber.isValid() : false;
}
exports.isValidPhoneNumber = isValidPhoneNumber;
// Passport Local Strategy
passport_1.default.use(new passport_local_1.Strategy({ usernameField: 'username' }, (username, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findUnique({ where: { username } });
        if (!user) {
            return done(null, false, { message: 'User not found' });
        }
        // If the user was created via OAuth and has no password, disallow local login.
        if (!user.password) {
            return done(null, false, { message: 'No password set for this user' });
        }
        const isValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isValid) {
            return done(null, false, { message: 'Invalid password' });
        }
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
})));
// Passport Google Strategy
passport_1.default.use(new passport_google_oauth2_1.Strategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3001',
}, (accessToken, refreshToken, profile, // using any because the Profile type is not exported
done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Use the first email as the username.
        const email = profile.emails && ((_a = profile.emails[0]) === null || _a === void 0 ? void 0 : _a.value);
        if (!email) {
            return done(new Error('No email found in Google profile'));
        }
        let user = yield prisma.user.findUnique({ where: { username: email } });
        if (!user) {
            user = yield prisma.user.create({
                data: {
                    name: profile.displayName,
                    username: email,
                    password: '',
                    phoneNumber: '',
                },
            });
        }
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
})));
// Serialize and Deserialize User
passport_1.default.serializeUser((user, done) => done(null, user.id));
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findUnique({ where: { id } });
        if (user) {
            done(null, user);
        }
        else {
            done(null, false);
        }
    }
    catch (error) {
        done(error);
    }
}));
// Signup Route
router.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, username, password, phoneNumber } = req.body;
        if (!name || !username || !password || !phoneNumber) {
            return res.status(400).json({ message: 'Missing fields' });
        }
        if (!isValidPhoneNumber(phoneNumber)) {
            return res.status(400).json({ message: 'Invalid phone number format' });
        }
        const existingUser = yield prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'User exists' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield prisma.user.create({
            data: { name, username, password: hashedPassword, phoneNumber },
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, JWT_SECRET, {
            expiresIn: '1h',
        });
        res.json({ token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// Login Route
router.post('/login', (req, res, next) => {
    passport_1.default.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({ message: (info === null || info === void 0 ? void 0 : info.message) || 'Login failed' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, JWT_SECRET, {
            expiresIn: '1h',
        });
        res.json({ token });
    })(req, res, next);
});
// Google Auth Route
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
// Google Auth Callback
router.get('/google/callback', passport_1.default.authenticate('google', { session: false }), (req, res) => {
    const user = req.user;
    const token = jsonwebtoken_1.default.sign({
        id: user.id,
        username: user.username,
        name: user.name,
        password: user.password, // caution: including the password (even hashed) is not recommended.
    }, JWT_SECRET, { expiresIn: '1h' });
    // Set token as an HTTP-only cookie
    res.setHeader('Set-Cookie', cookie_1.default.serialize('token', token, {
        httpOnly: true,
        secure: process.env.SECRET_KEY === 'production',
        maxAge: 3600,
        path: '/',
    }));
    // Redirect to the home page
    const redirectUrl = process.env.NODE_ENV === 'production'
        ? 'https://www.shelteric.com/home'
        : 'http://localhost:3000/home';
    res.redirect(redirectUrl);
});
// Get Current User
router.get('/me', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authUser = req.user;
        const user = yield prisma.user.findUnique({ where: { id: authUser.id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}));
router.post('/location', passport_1.default.authenticate('jwt', { session: false }), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // The authenticated user is available as req.user (populated by Passport)
        const user = req.user;
        const { latitude, longitude } = req.body;
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return res
                .status(400)
                .json({ error: 'Latitude and Longitude must be numbers.' });
        }
        // Update the user's current location in the database.
        const updatedUser = yield prisma.user.update({
            where: { id: user.id },
            data: {
                currentLatitude: latitude,
                currentLongitude: longitude,
            },
        });
        res.json({
            message: 'Location updated successfully.',
            user: updatedUser,
        });
    }
    catch (error) {
        console.error('Error updating location:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
router.post('/send-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ message: 'Phone number is required' });
        }
        // Validate phone number format
        if (!isValidPhoneNumber(phoneNumber)) {
            return res.status(400).json({ message: 'Invalid phone number format' });
        }
        const user = yield prisma.user.findUnique({ where: { phoneNumber } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Generate a random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
        // Store OTP in the User model
        yield prisma.user.update({
            where: { phoneNumber },
            data: { otp, otpExpiresAt: expiresAt },
        });
        // Send OTP via Twilio
        const twilioClient = (0, twilio_1.default)(TWILIO_SID, TWILIO_AUTH_TOKEN);
        yield twilioClient.messages.create({
            body: `Your verification code is: ${otp}`,
            from: TWILIO_PHONE,
            to: phoneNumber,
        });
        res.json({ message: 'OTP sent successfully' });
    }
    catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
}));
// Verify OTP and Change Password
router.post('/verify-otp', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber, otp, newPassword } = req.body;
        if (!phoneNumber || !otp || !newPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        // Find user by phone number
        const user = yield prisma.user.findUnique({ where: { phoneNumber } });
        if (!user || user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        // Check if OTP has expired
        if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
            return res.status(400).json({ message: 'OTP has expired' });
        }
        // Hash new password
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        // Update user's password and clear OTP fields
        yield prisma.user.update({
            where: { phoneNumber },
            data: { password: hashedPassword, otp: null, otpExpiresAt: null },
        });
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Failed to verify OTP' });
    }
}));
exports.default = router;
