const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

const generateToken = require("../utils/generateToken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

exports.register = asyncHandler(async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });

    if (exists) {
        throw new AppError("Email already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });

    const token = generateToken(user._id);

    res.status(201).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });

});

exports.login = asyncHandler(async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken(user._id);

    res.json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });

});

exports.profile = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
        throw new AppError("User not found", 404);
    }

    res.json({
        success: true,
        user
    });

});