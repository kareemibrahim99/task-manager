const mongoose = require("mongoose");

const Project = require("../models/projectModel");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");


module.exports = asyncHandler(async (req, res, next) => {

    const targetId = req.params.projectId || req.params.id;

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
        throw new AppError("Invalid project id", 400);
    }

    const project = await Project.findById(targetId);

    if (!project) {
        throw new AppError("Project not found", 404);
    }

    const isOwner = project.owner.toString() === req.user.id.toString();

    const isMember = project.members.some(
        (memberId) => memberId.toString() === req.user.id.toString()
    );

    const isAdmin = req.user.role === "Admin";

    if (!isOwner && !isMember && !isAdmin) {
        throw new AppError("You do not have access to this project", 403);
    }

    req.project = project;
    req.isProjectOwner = isOwner;

    next();

});
