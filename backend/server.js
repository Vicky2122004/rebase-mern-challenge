const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// FIX: Added serverSelectionTimeoutMS for better connection stability
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Database connection error:", err));

const todoSchema = new mongoose.Schema({
  title: String,
  completed: Boolean,
});

const Todo = mongoose.model("Todo", todoSchema);

app.get("/api/todos", async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// FIX: Changed req.body.task -> req.body.title to match what the frontend sends
app.post("/api/todos", async (req, res) => {
  const todo = new Todo({
    title: req.body.title,
    completed: false,
  });

  try {
    const newTodo = await todo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
