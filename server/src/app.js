require('dotenv').config();

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const configurePassport = require("./config/passport");

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

configurePassport();
app.use(passport.initialize());


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
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  (req, res) => {
    res.json({
      message: "Google authentication successful",
      user: req.user,
    });
  }
);

module.exports = app;
