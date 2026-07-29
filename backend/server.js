require("dotenv").config();

const connectDB = require("./src/config/db");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const authRoutes = require("./src/routes/authRoutes");

const errorHandler = require("./src/middleware/errorHandler");

const app = express();

app.use(cors());

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());

app.use(cookieParser());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Task Manager API Running"
    });
});

app.use("/api/auth", authRoutes);


app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route Not Found"
    });
});


app.use(errorHandler);



const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});