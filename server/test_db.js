const mongoose = require("mongoose");
require("dotenv").config();

console.log("URI:", process.env.MONGO_URI.replace(/:([^@]+)@/, ":****@"));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("CONNECTED");
    process.exit(0);
  })
  .catch((err) => {
    console.error("ERROR:", err.message);
    process.exit(1);
  });
