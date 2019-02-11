const mongoose = require("mongoose")


const user_schema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
  admin: Boolean
})

module.exports = mongoose.model("User", user_schema)