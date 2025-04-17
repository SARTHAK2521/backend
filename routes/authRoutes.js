//express-session	External middleware install using npm
const express = require("express");// express js framework for http req
const fs = require("fs");// built in module of nodejs (files ko read or write krne ko)
const path = require("path");//
const router = express.Router();

// function json file se data read krne ko
function getUsers() {
    try {
        const data = fs.readFileSync(path.join(__dirname, "../data/users.json"), "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// get method
router.get("/", (req, res) => {
    res.render("auth", { error: null });
});

//post method
router.post("/signup", (req, res) => {
    const { username, password } = req.body;
    let users = getUsers();

    if (users.some(u => u.username.trim().toLowerCase() === username.trim().toLowerCase())) {
        return res.render("auth", { error: "⚠️ Username already exists" });
    }

    const newUser = { username: username.trim(), password };
    users.push(newUser);
    fs.writeFileSync(path.join(__dirname, "../data/users.json"), JSON.stringify(users, null, 2));//updated user ko file mai likhdo

    req.session.user = newUser; 
    res.redirect("/"); 
});
//express-session	External middleware install using npm

router.post("/login", (req, res) => {
    const { username, password } = req.body;
    let users = getUsers();

    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.render("auth", { error: "❌ Invalid username or password" });
    }

    req.session.user = user; 
    res.redirect("/"); 
});

module.exports = router;
