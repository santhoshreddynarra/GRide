const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Dummy users array (temporary database)
let users = [];

// Test route
app.get("/", (req, res) => {
    res.json({ message: "🚀 GigRide Backend Running (No DB)" });
});

// Register API
app.post("/api/register", (req, res) => {
    const { name, email, password, role } = req.body;

    const user = { name, email, password, role };
    users.push(user);

    res.json({ message: "User registered successfully", user });
});

// Login API
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    const user = users.find(
        (u) => u.email === email && u.password === password
    );

    if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", user });
});

// Server
app.listen(5000, () => {
    console.log("🚀 Server running on port 5000");
});