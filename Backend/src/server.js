const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./socket/socket");

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`🚀 Queue server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO ready on the same port`);
  });
});
