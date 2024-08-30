"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = __importDefault(require("./routers/user"));
const worker_1 = __importDefault(require("./routers/worker"));
const booking_1 = __importDefault(require("./routers/booking"));
const tracking_1 = __importDefault(require("./routers/tracking"));
const driver_1 = __importDefault(require("./routers/driver"));
const s3_1 = __importDefault(require("./routers/s3"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("./config/passport"));
const order_1 = __importDefault(require("./routers/order"));
const cors_1 = __importDefault(require("cors"));
const host = (_a = process.env.HOST) !== null && _a !== void 0 ? _a : 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3001;
const app = express_1.default();
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(cors_1.default());
// Retrieve and check the session secret
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    console.error('SESSION_SECRET environment variable is not set');
    process.exit(1); // Exit process with failure code
}
app.use(express_session_1.default({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));
// Initialize Passport
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Route handlers
app.use('/v1/user', user_1.default);
app.use('/v1/worker', worker_1.default);
app.use('/v1/booking', booking_1.default);
app.use('/v1/s3', s3_1.default);
app.use('/v1/order', order_1.default);
app.use('/c1/tracking', tracking_1.default);
app.use('/c1/driver', driver_1.default);
app.get('/', (req, res) => {
    res.send({ message: 'Hello API' });
});
app.listen(port, host, () => {
    console.log(`[ ready ] http://${host}:${port}`);
});
