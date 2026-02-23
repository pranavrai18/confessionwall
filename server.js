const path = require("path");
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");
require("dotenv").config();

const { connectDb } = require("./config/db");
const { configurePassport } = require("./config/passport");
const confessionRoutes = require("./routes/confessions");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:4000",
    credentials: true
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

configurePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/confessions", confessionRoutes);

const clientPath = path.join(__dirname, "..", "client");
app.use(express.static(clientPath));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

connectDb(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to database", error);
    process.exit(1);
  });
