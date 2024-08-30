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
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const passport_google_oauth2_1 = require("passport-google-oauth2");
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const passport_jwt_1 = require("passport-jwt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || (() => { throw new Error("JWT_SECRET is not defined in environment variables"); })();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || (() => { throw new Error("GOOGLE_CLIENT_ID is not defined in environment variables"); })();
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || (() => { throw new Error("GOOGLE_CLIENT_SECRET is not defined in environment variables"); })();
// Local Strategy for email and password authentication
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: 'email',
    passwordField: 'password',
}, (email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findUnique({ where: { email } });
        if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        const userWithToken = Object.assign(Object.assign({}, user), { token });
        return done(null, userWithToken);
    }
    catch (err) {
        console.error('Error in LocalStrategy:', err);
        return done(err);
    }
})));
passport_1.default.use(new passport_google_oauth2_1.Strategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/home",
    scope: ['profile', 'email'],
}, (_accessToken, _refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const result = yield prisma.user.findUnique({ where: { email: (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value } });
        if (!result) {
            const newUser = yield prisma.user.create({
                data: {
                    email: ((_b = profile.emails) === null || _b === void 0 ? void 0 : _b[0].value) || '',
                    password: 'google',
                },
            });
            return done(null, newUser);
        }
        else {
            return done(null, result);
        }
    }
    catch (err) {
        console.error('Error in GoogleStrategy:', err);
        return done(err, false);
    }
})));
// Serialize user for session
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
// Deserialize user from session
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
    catch (err) {
        console.error('Error in deserializeUser:', err);
        done(err);
    }
}));
// JWT Strategy for token authentication
passport_1.default.use(new passport_jwt_1.Strategy({
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
}, (jwtPayload, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findUnique({ where: { id: jwtPayload.id } });
        if (user) {
            return done(null, user);
        }
        else {
            return done(null, false, { message: 'User not found.' });
        }
    }
    catch (err) {
        console.error('Error in JwtStrategy:', err);
        return done(err, false);
    }
})));
exports.generateToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
};
exports.default = passport_1.default;
