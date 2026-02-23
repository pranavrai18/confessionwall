const mongoose = require("mongoose");

async function connectDb(mongoUri) {
  if (!mongoUri) {
    throw new Error("MONGO_URI is required");
  }

  await mongoose.connect(mongoUri, {
    autoIndex: true
  });
}

module.exports = { connectDb };
