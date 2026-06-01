const dns = require("dns");
const mongoose = require("mongoose");

// mongodb+srv:// requires SRV DNS; some Windows/ISP resolvers refuse it (querySrv ECONNREFUSED).
const dnsServers = (process.env.DNS_SERVERS || "8.8.8.8,8.8.4.4,1.1.1.1")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
if (dnsServers.length) {
  dns.setServers(dnsServers);
}

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MongoDB connection error: MONGO_URI is not set in Backend/.env");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
