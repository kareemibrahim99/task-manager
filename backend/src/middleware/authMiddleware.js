const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

const AppError = require("../utils/appError");

const asyncHandler = require("../utils/asyncHandler");

module.exports = asyncHandler(async (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError("Unauthorized", 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
        throw new AppError("User not found", 401);
    }

    req.user = user;

    next();

});