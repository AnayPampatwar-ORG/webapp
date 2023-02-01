require("dotenv").config(); // ALLOWS ENVIRONMENT VARIABLES TO BE SET ON PROCESS.ENV SHOULD BE AT TOP
const db = require("./config/db");
const express = require("express");
const app = express();
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");

//middleware setup
app.use(bodyParser.json());
app.use(userRoutes);
app.use(express.json()); // parse json bodies in the request object

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("MySQL Connected...");
});

app.use((err, req, res, next) => {
  try {
    console.log("Parsing JSON: ", req.body);
    const parsedData = JSON.parse(req.body);
  } catch (error) {
    console.error("Error parsing JSON: ", error);
    return res.status(400).json({ error: "Error parsing JSON" });
  }
  
});
// Global Error Handler.
app.use((err, req, res, next) => {
  console.log("Global Error Handler")
  console.log(err);
  console.log(req.body);
  

// global error handler
  res.status(500).json({
    message: "Something went relqqqy wrong",
  });
});

app.use((req, res) => {
  res.status(404).send({ error: "Endpoint not found" });
});

// Listen on port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));

module.exports = app;