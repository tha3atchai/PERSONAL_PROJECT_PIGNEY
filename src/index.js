require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const rateLimitMiddleware = require("./middlewares/rate-limit");
const notFoundMiddleware = require("./middlewares/not-found");
const errorMiddleware = require("./middlewares/error");

const authRoute = require("./routes/auth-route");
const piggygoalsRoute = require("./routes/piggygoals-route");
const userRoute = require("./routes/user-route");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(rateLimitMiddleware);
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use("/auth", authRoute);
app.use("/piggygoals", piggygoalsRoute);
app.use("/user", userRoute);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log("Server start on port", PORT));