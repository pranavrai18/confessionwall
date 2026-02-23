const express = require("express");
const Confession = require("../models/Confession");

const router = express.Router();

function ensureAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Authentication required" });
}

function safeConfession(confession) {
  const { _id, text, reactions, createdAt } = confession;
  return { id: _id, text, reactions, createdAt };
}

router.post("/", ensureAuth, async (req, res) => {
  try {
    const { text, secretCode } = req.body || {};

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Confession text is required" });
    }
    if (!secretCode || secretCode.length < 4) {
      return res.status(400).json({ error: "Secret code must be at least 4 characters" });
    }

    const confession = await Confession.create({
      text: text.trim(),
      secretCode,
      userId: req.user.id
    });

    return res.status(201).json(safeConfession(confession));
  } catch (error) {
    return res.status(500).json({ error: "Failed to create confession" });
  }
});

router.get("/", async (req, res) => {
  try {
    const confessions = await Confession.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.json(confessions.map((confession) => safeConfession(confession)));
  } catch (error) {
    return res.status(500).json({ error: "Failed to load confessions" });
  }
});

router.put("/:id", ensureAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, secretCode } = req.body || {};

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Confession text is required" });
    }
    if (!secretCode || secretCode.length < 4) {
      return res.status(400).json({ error: "Secret code must be at least 4 characters" });
    }

    const confession = await Confession.findById(id);
    if (!confession) {
      return res.status(404).json({ error: "Confession not found" });
    }

    if (confession.userId !== req.user.id) {
      return res.status(403).json({ error: "Not allowed to edit this confession" });
    }

    if (confession.secretCode !== secretCode) {
      return res.status(403).json({ error: "Incorrect secret code" });
    }

    confession.text = text.trim();
    await confession.save();

    return res.json(safeConfession(confession));
  } catch (error) {
    return res.status(500).json({ error: "Failed to update confession" });
  }
});

router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { secretCode } = req.body || {};

    if (!secretCode || secretCode.length < 4) {
      return res.status(400).json({ error: "Secret code must be at least 4 characters" });
    }

    const confession = await Confession.findById(id);
    if (!confession) {
      return res.status(404).json({ error: "Confession not found" });
    }

    if (confession.userId !== req.user.id) {
      return res.status(403).json({ error: "Not allowed to delete this confession" });
    }

    if (confession.secretCode !== secretCode) {
      return res.status(403).json({ error: "Incorrect secret code" });
    }

    await Confession.deleteOne({ _id: id });

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete confession" });
  }
});

router.post("/:id/react", async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body || {};

    if (!type || !["like", "love", "laugh"].includes(type)) {
      return res.status(400).json({ error: "Invalid reaction type" });
    }

    const confession = await Confession.findByIdAndUpdate(
      id,
      { $inc: { [`reactions.${type}`]: 1 } },
      { new: true }
    );

    if (!confession) {
      return res.status(404).json({ error: "Confession not found" });
    }

    return res.json({ id: confession._id, reactions: confession.reactions });
  } catch (error) {
    return res.status(500).json({ error: "Failed to add reaction" });
  }
});

module.exports = router;
