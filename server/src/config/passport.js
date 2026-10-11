
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const configurePassport = () => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientID || !clientSecret || clientID === "your_google_client_id" || clientSecret === "your_google_client_secret") {
    console.warn("Google OAuth credentials not configured yet. Passport strategy is disabled until real values are added.");
    return;
  }

  passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  done(null, { id });
});

  passport.serializeUser((user, done) => {
    done(null, user.id || user._id || user.email);
  });

  passport.deserializeUser((id, done) => {
    done(null, { id });
  });
};

module.exports = configurePassport;
