const express = require("express");
const router = express.Router();

// Temporary in-memory storage (replace with database)
const scheduleStorage = {
    workouts: []
};

// Generate ID for new workouts
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Schedule main page
router.get("/", (req, res) => {
    try {
        const userWorkouts = scheduleStorage.workouts.filter(
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
        
        scheduleStorage.workouts.push({
            id: generateId(),
            day,
            type,
            duration: parseInt(duration),
            notes,
            userId: req.session.user.id,
            createdAt: new Date()
        });
        
        res.redirect("/schedule");
    } catch (err) {
        console.error("Add workout error:", err);
        res.status(500).redirect("/schedule");
    }
});

// Delete workout
router.post("/delete/:id", (req, res) => {
    try {
        scheduleStorage.workouts = scheduleStorage.workouts.filter(
            workout => workout.id !== req.params.id
        );
        res.redirect("/schedule");
    } catch (err) {
        console.error("Delete workout error:", err);
        res.status(500).redirect("/schedule");
    }
});

module.exports = router;