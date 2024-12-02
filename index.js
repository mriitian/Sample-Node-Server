import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const MONGO_URI = process.env.ATLAS_URI;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connection Established"))
  .catch((error) => {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1);
  });

// Mongoose Schema & Model
const personSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  mobileNumber: { type: String, required: true },
});

const Person = mongoose.model("Person", personSchema);

// Routes

// GET /person: Displays a table with a list of people
app.get("/person", async (req, res) => {
  try {
    const people = await Person.find();
    res.status(200).json(people);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving people", error });
  }
});

// POST /person: Displays a form to create a single person
app.post("/person", async (req, res) => {
  try {
    const { name, age, gender, mobileNumber } = req.body;
    const person = new Person({ name, age, gender, mobileNumber });
    await person.save();
    res.status(201).json({ message: "Person created successfully", person });
  } catch (error) {
    res.status(400).json({ message: "Error creating person", error });
  }
});

// PUT /person/:id: Displays a form to edit a person with a specified ID
app.put("/person/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, gender, mobileNumber } = req.body;
    const person = await Person.findByIdAndUpdate(
      id,
      { name, age, gender, mobileNumber },
      { new: true, runValidators: true }
    );
    if (!person) return res.status(404).json({ message: "Person not found" });
    res.status(200).json({ message: "Person updated successfully", person });
  } catch (error) {
    res.status(400).json({ message: "Error updating person", error });
  }
});

// DELETE /person/:id: Displays a page to delete a person with a specified ID
app.delete("/person/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const person = await Person.findByIdAndDelete(id);
    if (!person) return res.status(404).json({ message: "Person not found" });
    res.status(200).json({ message: "Person deleted successfully", person });
  } catch (error) {
    res.status(500).json({ message: "Error deleting person", error });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
