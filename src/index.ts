import express from 'express';
import userRouter from './routers/user';
import workerRouter from './routers/worker';
import bookingRouter from './routers/booking';
import trackingRouter from './routers/tracking';
import driverRouter from './routers/driver';
import s3Router from './routers/s3';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from './config/passport';
import orderRouter from './routers/order';
import cors from 'cors';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3001;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Retrieve and check the session secret
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  console.error('SESSION_SECRET environment variable is not set');
  process.exit(1); // Exit process with failure code
}

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Route handlers
app.use('/v1/user', userRouter);
app.use('/v1/worker', workerRouter);
app.use('/v1/booking', bookingRouter);
app.use('/v1/s3', s3Router);
app.use('/v1/order', orderRouter);
app.use('/c1/tracking', trackingRouter);
app.use('/c1/driver', driverRouter);

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});