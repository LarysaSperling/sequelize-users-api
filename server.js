import express from "express";
import dotenv from "dotenv";
import sequelize from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3333;

app.use(express.json());

function handleValidationError(error, res) {
  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({
      message: "Validation error",
      errors: error.errors.map((err) => err.message),
    });
  }

  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({
      message: "Email must be unique",
      errors: error.errors.map((err) => err.message),
    });
  }

  return res.status(500).json({
    message: "Server error",
    error: error.message,
  });
}

app.post("/users", async (req, res) => {
  try {
    const { name, email, age } = req.body;

    const user = await User.create({
      name,
      email,
      age,
    });

    res.status(201).json(user);
  } catch (error) {
    handleValidationError(error, res);
  }
});

app.get("/users", async (req, res) => {
  try {
    const { limit = 10, offset = 0, isActive } = req.query;

    const where = {};

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const users = await User.findAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const { name, email, age, isActive } = req.body;

    await user.update({
      name,
      email,
      age,
      isActive,
    });

    res.status(200).json(user);
  } catch (error) {
    handleValidationError(error, res);
  }
});

app.patch("/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.update(req.body);

    res.status(200).json(user);
  } catch (error) {
    handleValidationError(error, res);
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await user.destroy();

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error.message);
  }
}

startServer();