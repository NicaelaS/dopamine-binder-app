require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const configurePassport = require("./config/passport");
const isAuthenticated = require("./middleware/authMiddleware");
const logger = require("./middleware/loggerMiddleware");
const User = require("./models/userModel");
const searchRoutes = require("./routes/searchRoutes");
const binderRoutes = require("./routes/binderRoutes");
const itemRoutes = require("./routes/itemRoutes");

const app = express();


// ── App config ───────────────────────────────────────────
app.use(cors({
    origin: "http://localhost:5173", // Replace with your frontend URL
    credentials: true, // Allow cookies to be sent
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ── Session ──────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));


// ── Passport ─────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

configurePassport();


// ── Middleware ────────────────────────────────────────────
app.use(logger);


// ── API config ───────────────────────────────────────────
app.use("/api/search", searchRoutes);
app.use("/api/items", itemRoutes);
app.use('/api/binders', binderRoutes);

// ── Routes ───────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Dopamine Binder is running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login",
  }),
  (req, res) => {
    res.redirect("http://localhost:5173");
  }
);

app.get("/profile", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-__v");

    res.json({
      user: {
        ...user.toObject(),
        photoUrl: user.photoUrl || user.avatar || "",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load user profile" });
  }
});

// ── Error handler (must be last) ─────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

module.exports = app;
