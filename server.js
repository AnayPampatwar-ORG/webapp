
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


//import routes
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
app.use(userRoutes);
app.use(productRoutes);


app.use((req, res) => {
  res.status(404).send({ error: "Endpoint not found" });
});

// Listen on port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));

module.exports = app;