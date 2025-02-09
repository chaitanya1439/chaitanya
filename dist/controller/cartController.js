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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutCart = exports.getCart = exports.removeFromCart = exports.addToCart = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const addToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { menuItemId, quantity } = req.body;
    const userId = req.user.id;
    try {
        let cart = yield prisma.cart.findFirst({
            where: { userId, status: 'Active' },
            include: { items: true },
        });
        if (!cart) {
            cart = yield prisma.cart.create({
                data: {
                    userId,
                    status: 'Active',
                },
                include: { items: true },
            });
        }
        const existingCartItem = cart.items.find(item => item.menuItemId === menuItemId);
        if (existingCartItem) {
            const updatedCartItem = yield prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity + quantity },
            });
            return res.status(200).json(updatedCartItem);
        }
        else {
            const newCartItem = yield prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    menuItemId,
                    quantity,
                },
            });
            return res.status(201).json(newCartItem);
        }
    }
    catch (error) {
        return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
});
exports.addToCart = addToCart;
const removeFromCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { menuItemId, quantity } = req.body;
    const userId = req.user.id;
    try {
        const cart = yield prisma.cart.findFirst({
            where: { userId, status: 'Active' },
            include: { items: true },
        });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        const existingCartItem = cart.items.find(item => item.menuItemId === menuItemId);
        if (!existingCartItem) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }
        if (existingCartItem.quantity > quantity) {
            const updatedCartItem = yield prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity - quantity },
            });
            return res.status(200).json(updatedCartItem);
        }
        else {
            yield prisma.cartItem.delete({
                where: { id: existingCartItem.id },
            });
            return res.status(200).json({ message: 'Item removed from cart' });
        }
    }
    catch (error) {
        return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
});
exports.removeFromCart = removeFromCart;
const getCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    try {
        const cart = yield prisma.cart.findFirst({
            where: { userId, status: 'Active' },
            include: { items: { include: { menuItem: true } } },
        });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        return res.status(200).json(cart);
    }
    catch (error) {
        return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
});
exports.getCart = getCart;
const checkoutCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    try {
        // Find the active cart for the user
        const cart = yield prisma.cart.findFirst({
            where: { userId, status: 'Active' },
            include: { items: { include: { menuItem: true } } },
        });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }
        // Calculate the total amount
        const totalAmount = cart.items.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);
        // Create the order
        const order = yield prisma.order.create({
            data: {
                userId,
                totalAmount,
                status: 'Pending',
                menuItemId: cart.items[0].menuItemId, // Use the first menuItemId for this example
            },
        });
        // Create order items
        yield prisma.orderItem.createMany({
            data: cart.items.map(item => ({
                orderId: order.id,
                menuItemId: item.menuItemId,
                quantity: item.quantity,
            })),
        });
        // Mark the cart as completed
        yield prisma.cart.update({
            where: { id: cart.id },
            data: { status: 'Completed' },
        });
        return res.status(201).json(order);
    }
    catch (error) {
        return res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
    }
});
exports.checkoutCart = checkoutCart;
