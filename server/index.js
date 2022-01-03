require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const conversationsRoute = require("./routes/conversations");
const path = require("path");
const http = require("http");
const socket = require("socket.io");

const authRoute = require("./routes/auth");
const postsRoute = require("./routes/posts");
const usersRoute = require("./routes/users");
const externalAPIRoutes = require("./routes/externalAPIs");

const port = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socket(server);

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public"));
app.use(cookieParser());

app.use(
  "/images/profile",
  express.static(path.join(__dirname, "public/profileMedia"))
);

app.use(
  "/images/posts",
  express.static(path.join(__dirname, "public/uploadedMedia"))
);

app.use(express.static(path.resolve(__dirname, "../client/build")));

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.DATABASE_CREDENTIALS);
}

// socket.io
io.on("connection", (socket) => {
  socket.emit("your id", socket.id);
  socket.on("send message", (body) => {
    console.log(body);
    io.emit("message", {
      message: body.message,
      conversationId: body.conversationId,
    });
  });
});

// routes
app.use("/api/auth", authRoute);
app.use("/api/posts", postsRoute);
app.use("/api/users", usersRoute);
app.use("/api/conversations", conversationsRoute);
app.use("/api/external", externalAPIRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

// error handler
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  if (typeof error.status === "undefined" || !error.status) {
    error.status = 505;
  }
  res.status(error.status).json({ error, message: error.message });
});

server.listen(port, () => {
  console.log(`server started on port ${port}`);
});
