
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());


const bodyParser = require("body-parser");
//const userRoutes = require("./routes/userRoutes");

//middleware setup
app.use(bodyParser.json());
//app.use(userRoutes);
app.use(express.json()); // parse json bodies in the request object


//testing api
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the application." });
});
app.get("/healthz", (req, res) => {
  res.status(200).send();
});

//global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(400).send("Bad Request!");
});

//import routes
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const imageRoutes = require("./routes/imageRoutes");
app.use(userRoutes);
app.use(productRoutes);
app.use(imageRoutes);


app.use((req, res) => {
  res.status(404).send({ error: "Endpoint not found" });
});

// Listen on port
const PORT = process.env.PORT;
console.log(process.env.DB_HOST);
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));

module.exports = app;