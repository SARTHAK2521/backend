const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");

const workoutsFile = path.join(__dirname, "../data/workouts.json");

async function ensureFileExists() {
    try {
        await fs.access(workoutsFile);
    } catch (error) {
        await fs.writeFile(workoutsFile, "[]", "utf8");
    }
}
ensureFileExists(); 


router.get("/", async (req, res) => {
    try {
        const data = await fs.readFile(workoutsFile, "utf8");
        const workouts = JSON.parse(data || "[]");
        res.render("workouts", { workouts });
    } catch (error) {
        console.error("❌ Error reading workouts file:", error);
        res.render("error", { message: "Error loading workouts!" });
    }
});


router.get("/add", (req, res) => {
    res.render("addWorkout", { error: null }); 
});


router.post("/add", async (req, res) => {
    let { name, duration, type } = req.body;

    name = name.trim();
    duration = duration.trim();
    type = type.trim();

    if (!name || !duration || !type || isNaN(duration)) {//is not number check krta h
        return res.render("addWorkout", { error: "Please enter valid workout details!" });
    }

    try {
        const data = await fs.readFile(workoutsFile, "utf8");
        let workouts = JSON.parse(data || "[]");

        workouts.push({ name, duration, type });

        await fs.writeFile(workoutsFile, JSON.stringify(workouts, null, 2));
        console.log("✅ Workout added successfully:", { name, duration, type });

        res.redirect("/workouts");

    } catch (error) {
        console.error("❌ Error saving workout:", error);
        res.render("error", { message: "Error saving workout!" });
    }
});
router.get("/", (req, res) => {
    res.render("workouts", { username: req.session.user.username });
});

module.exports = router;
