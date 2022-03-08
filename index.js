if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const crypto = require("crypto");
const fs = require("fs");
const http = require("http").Server(app);
const morgan = require("morgan");
const Parameter = require("./parameters");

const dbUrl = process.env.DB_URL;
const connectDB = async () => {
  await mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
connectDB()
  .then(() => console.log("Connected to Database"))
  .catch((e) => console.log(e));

const private_key = fs.readFileSync("./private.pem", "utf8");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.post("/api/sendParameters", async (req, res) => {
  const data = req.body;
  // console.log(data);
  const decyptedData = crypto.privateDecrypt(
    {
      key: private_key,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(data.cypher, "base64")
  );
  const decyptedDataJSON = await JSON.parse(decyptedData.toString("utf8"));
  const save_parameters = await new Parameter({
    uid: data.uid,
  });
  save_parameters.cypher.push({
    cypherData: decyptedDataJSON,
    time: data.time,
  });
  await save_parameters.save();
  // console.log(decyptedDataJSON);
  res.status(200).json({
    status: "OK",
  });
});

app.get("/api/getAllParameters", async (req, res) => {
  const data = await Parameter.find()
  res.status(200).json({
    status: "OK",
    data: data
  });
});

app.get("/api/getParameters", async (req, res) => {
  const id = req.query.id;
  const data = await Parameter.find({ uid: id });
  res.status(200).json({
    status: "OK",
    data: data,
  });
});

// "192.168.113.196"
http.listen(process.env.PORT || 5000, () =>
  console.log("Server started at port 5000")
);
