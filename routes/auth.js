const express = require("express");
const passport = require("passport");

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/?auth=failed" }),
  (req, res) => {
    const successUrl = process.env.CLIENT_SUCCESS_URL || "/";
    res.redirect(successUrl);
  }
);

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.json({ ok: true });
  });
});

router.get("/me", (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.json({ authenticated: false });
  }
  return res.json({
    authenticated: true,
    user: {
      id: req.user._id,
      displayName: req.user.displayName,
      email: req.user.email
    }
  });
});

module.exports = router;
