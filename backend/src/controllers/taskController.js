const { validationResult } = require("express-validator");

const Task = require("../models/taskModel");

const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

const canModifyTask = (task, req) => {
    return (
        req.user.role === "Admin" ||
        req.isProjectOwner ||
        task.creator.toString() === req.user.id.toString() ||
        (task.assignee && task.assignee.toString() === req.user.id.toString())
    );
};

const assertAssigneeIsMember = (project, assignee) => {
    if (!assignee) return;

    const isMember = project.members.some(
        (memberId) => memberId.toString() === assignee
    );

    if (!isMember) {
        throw new AppError("Assignee must be a member of the project", 400);
    }
};

exports.createTask = asyncHandler(async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const { title, description, status, priority, dueDate, assignee } = req.body;

    assertAssigneeIsMember(req.project, assignee);

    const task = await Task.create({
        title,
        description,
        status,
        priority,
        dueDate,
        assignee: assignee || null,
        project: req.project._id,
        creator: req.user.id
    });

    res.status(201).json({
        success: true,
        task
    });

});


exports.getTasks = asyncHandler(async (req, res) => {

    const { status, priority, assignee } = req.query;

    const filter = { project: req.project._id };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;

    const tasks = await Task.find(filter)
        .populate("creator", "name email")
        .populate("assignee", "name email")
        .sort("-createdAt");

    res.json({
        success: true,
        count: tasks.length,
        tasks
    });

});

exports.getTask = asyncHandler(async (req, res) => {

    const task = await Task.findOne({
        _id: req.params.taskId,
        project: req.project._id
    })
        .populate("creator", "name email")
        .populate("assignee", "name email");

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    res.json({
        success: true,
        task
    });

});

exports.updateTask = asyncHandler(async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new AppError(errors.array()[0].msg, 400);
    }

    const task = await Task.findOne({
        _id: req.params.taskId,
        project: req.project._id
    });

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    if (!canModifyTask(task, req)) {
        throw new AppError("You are not authorized to modify this task", 403);
    }

    const { title, description, status, priority, dueDate, assignee } = req.body;

    assertAssigneeIsMember(req.project, assignee);

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignee !== undefined) task.assignee = assignee;

    await task.save();

    res.json({
        success: true,
        task
    });

});

exports.deleteTask = asyncHandler(async (req, res) => {

    const task = await Task.findOne({
        _id: req.params.taskId,
        project: req.project._id
    });

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    if (!canModifyTask(task, req)) {
        throw new AppError("You are not authorized to delete this task", 403);
    }

    await task.deleteOne();

    res.json({
        success: true,
        message: "Task deleted successfully"
    });

});
