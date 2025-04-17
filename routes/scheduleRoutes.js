const express = require("express");
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Path to the JSON data file
const DATA_FILE = path.join(__dirname, '../data/scheduleData.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ workouts: [] }, null, 2));
}

// Helper function to read data
function readData() {
    try {
        const rawData = fs.readFileSync(DATA_FILE);
        return JSON.parse(rawData);
    } catch (err) {
        console.error("Error reading data file:", err);
        return { workouts: [] };
    }
}

// Helper function to write data
function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing to data file:", err);
    }
}

// Generate ID for new workouts
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Schedule main page
router.get("/", (req, res) => {
    try {
        const data = readData();
        const userWorkouts = data.workouts.filter(
            workout => workout.userId === req.session.user.id
        );
        
        res.render("schedule", {
            username: req.session.user.username,
            workouts: userWorkouts,
            currentPage: 'schedule'
        });
    } catch (err) {
        console.error("Schedule route error:", err);
        res.status(500).render("error", {
            message: "Failed to load schedule",
            currentPage: 'error'
        });
    }
});

// Add workout
router.post("/add", (req, res) => {
    try {
        const { day, type, duration, notes } = req.body;
        const data = readData();
        
        const newWorkout = {
            id: generateId(),
            day,
            type,
            duration: parseInt(duration),
            notes,
            userId: req.session.user.id,
            createdAt: new Date().toISOString()
        };
        
        data.workouts.push(newWorkout);
        writeData(data);
        
        res.redirect("/schedule");
    } catch (err) {
        console.error("Add workout error:", err);
        res.status(500).redirect("/schedule");
    }
});

// Delete workout
router.post("/delete/:id", (req, res) => {
    try {
        const data = readData();
        data.workouts = data.workouts.filter(
            workout => workout.id !== req.params.id
        );
        writeData(data);
        res.redirect("/schedule");
    } catch (err) {
        console.error("Delete workout error:", err);
        res.status(500).redirect("/schedule");
    }
});

module.exports = router;