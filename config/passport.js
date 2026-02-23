const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

function configurePassport(passport) {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL;

  if (!clientID || !clientSecret || !callbackURL) {
    throw new Error("Google OAuth environment variables are required");
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          
          let user = await User.findOne({ googleId: profile.id });
          
          if (user) {
            
            return done(null, user);
          }
          
          user = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : ""
          });
          
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
}

module.exports = { configurePassport };
