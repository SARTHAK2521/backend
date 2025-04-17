const express = require("express");
const path = require("path");
const session = require("express-session");
const morgan = require("morgan");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || "fitTrackProSecret123",
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true
    }
}));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Authentication middleware
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect("/auth");
}

// Route imports
const authRoutes = require("./routes/authRoutes");
const workoutRoutes = require("./routes/workoutRoutes");
const dietRoutes = require("./routes/dietRoutes");
 
const scheduleRoutes = require("./routes/scheduleRoutes");
 

// Routes
app.use("/auth", authRoutes);
app.use("/workouts", isAuthenticated, workoutRoutes);
app.use("/diet", isAuthenticated, dietRoutes);
 
app.use("/schedule", isAuthenticated, scheduleRoutes);
 

// Home route
app.get("/", isAuthenticated, (req, res) => {
    res.render("home", { 
        username: req.session.user.username,
        currentPage: 'home'
    });
});

 

// Logout
app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Session destruction error:", err);
        }
        res.redirect("/auth");
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error("Error:", err.stack);
    res.status(500).render("error", { 
        message: "Internal Server Error",
        currentPage: 'error'
    });
});


// 404 Handler
app.use((req, res) => {
    res.status(404).render("error", { 
        message: "Page Not Found",
        currentPage: 'error'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});