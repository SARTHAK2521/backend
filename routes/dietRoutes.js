const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");
//iska data store hora hai diet.json mai
const dietsFile = path.join(__dirname, "../data/diets.json");

//check that file diet.json exist krta h ya nhi
async function ensureFileExists() {
    try {
        await fs.access(dietsFile);
    } catch (error) {
        await fs.writeFile(dietsFile, "[]", "utf8");
    }
}
ensureFileExists(); 
// GET request handler for displaying the diets

router.get("/", async (req, res) => {
    try {
        const data = await fs.readFile(dietsFile, "utf8");
        const diets = JSON.parse(data || "[]");

        console.log("📜 Diets from JSON:", diets); 
        res.render("diet", { diets });

    } catch (error) {
        console.error("❌ Error reading diet file:", error);
        res.render("error", { message: "Error loading diets!" });
    }
});


router.get("/add", (req, res) => {
    res.render("addDiet");
});


router.post("/add", async (req, res) => {
    let { name, calories } = req.body;

    name = name.trim();
    calories = calories.trim();

    if (!name || !calories || isNaN(calories)) {
        console.warn("⚠️ Invalid diet input:", req.body);
        return res.render("error", { message: "Please enter a valid diet name & calories!" });
    }

    try {
        const data = await fs.readFile(dietsFile, "utf8");
        let diets = JSON.parse(data || "[]");

        diets.push({ name, calories });

        await fs.writeFile(dietsFile, JSON.stringify(diets, null, 2));
        console.log("✅ Diet added successfully:", { name, calories });

        res.redirect("/diet");

    } catch (error) {
        console.error("❌ Error saving diet:", error);
        res.render("error", { message: "Error saving diet!" });
    }
});

module.exports = router;