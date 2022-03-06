const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const parametersSchema = new Schema({
  uid: Number,
  cypher: [
    {
      cypherData: String,
      time: String,
    },
  ],
});

module.exports = mongoose.model("Parameter", parametersSchema);
