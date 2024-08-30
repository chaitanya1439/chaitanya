"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const restaurantController_1 = require("../controller/restaurantController");
const router = express_1.default.Router();
router.post('/create', passport_1.default.authenticate('jwt', { session: false }), restaurantController_1.createRestaurant);
router.get('/', passport_1.default.authenticate('jwt', { session: false }), restaurantController_1.getRestaurants);
router.post('/menu', passport_1.default.authenticate('jwt', { session: false }), restaurantController_1.addMenuItem);
router.get('/menu/:restaurantId', passport_1.default.authenticate('jwt', { session: false }), restaurantController_1.getMenuItems);
exports.default = router;
