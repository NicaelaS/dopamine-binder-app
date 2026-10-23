const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");


const configurePassport = () => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (
    !clientID ||
    !clientSecret ||
    clientID === "your_google_client_id" ||
    clientSecret === "your_google_client_secret"
  ) {
    console.warn(
      "Google OAuth credentials not configured yet. Passport strategy is disabled until real values are added."
    );
    return;
  }

  passport.use(
  new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            avatar: profile.photos?.[0]?.value || "",
            photoUrl: profile.photos?.[0]?.value || "",
          });
        } else {
          const nextName = profile.displayName || user.name;
          const nextPhoto = profile.photos?.[0]?.value || "";

          user.name = nextName;
          user.avatar = nextPhoto;
          user.photoUrl = nextPhoto;

          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

module.exports = configurePassport;