const { validationResult } = require("express-validator");

const Project = require("../models/projectModel");
const User = require("../models/userModel");

const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

exports.createProject = asyncHandler(async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const { name, description } = req.body;

    const project = await Project.create({
        name,
        description,
        owner: req.user.id,
        members: [req.user.id]
    });

    res.status(201).json({
        success: true,
        project
    });

});


exports.getProjects = asyncHandler(async (req, res) => {

    const filter =
        req.user.role === "Admin"
            ? {}
            : { $or: [{ owner: req.user.id }, { members: req.user.id }] };

    const projects = await Project.find(filter)
        .populate("owner", "name email role")
        .populate("members", "name email role")
        .sort("-createdAt");

    res.json({
        success: true,
        count: projects.length,
        projects
    });

});

exports.getProject = asyncHandler(async (req, res) => {

    const project = await req.project.populate([
        { path: "owner", select: "name email role" },
        { path: "members", select: "name email role" }
    ]);

    res.json({
        success: true,
        project
    });

});

exports.updateProject = asyncHandler(async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    if (!req.isProjectOwner && req.user.role !== "Admin") {
        throw new AppError("Only the project owner or an Admin can update this project", 403);
    }

    const { name, description } = req.body;

    if (name !== undefined) req.project.name = name;
    if (description !== undefined) req.project.description = description;

    await req.project.save();

    res.json({
        success: true,
        project: req.project
    });

});

exports.deleteProject = asyncHandler(async (req, res) => {

    if (!req.isProjectOwner && req.user.role !== "Admin") {
        throw new AppError("Only the project owner or an Admin can delete this project", 403);
    }

    await req.project.deleteOne();

    res.json({
        success: true,
        message: "Project deleted successfully"
    });

});


exports.addMember = asyncHandler(async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const { userId, email } = req.body;

    const user = userId
        ? await User.findById(userId)
        : await User.findOne({ email });

    if (!user) {
        throw new AppError("User not found", 404);
    }

    const alreadyMember = req.project.members.some(
        (memberId) => memberId.toString() === user._id.toString()
    );

    if (alreadyMember) {
        throw new AppError("User is already a member of this project", 400);
    }

    req.project.members.push(user._id);
    await req.project.save();

    res.json({
        success: true,
        project: req.project
    });

});

exports.removeMember = asyncHandler(async (req, res) => {

    const { userId } = req.params;

    if (req.project.owner.toString() === userId) {
        throw new AppError("Cannot remove the project owner from the project", 400);
    }

    const isMember = req.project.members.some(
        (memberId) => memberId.toString() === userId
    );

    if (!isMember) {
        throw new AppError("User is not a member of this project", 400);
    }

    req.project.members = req.project.members.filter(
        (memberId) => memberId.toString() !== userId
    );

    await req.project.save();

    res.json({
        success: true,
        project: req.project
    });

});
