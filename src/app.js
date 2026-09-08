const express = require("express");
const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();
app.use(express.json());

const router = express.Router();

router.use("/auth", authRoutes);
app.use('/api', router);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

module.exports = app;
