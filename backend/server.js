/**
 * server.js
 * ----------
 * Ye humara main backend file hai. Isse chalane par ek "server" start hota hai
 * jo browser/React se requests sunta hai aur database se data nikaal ke deta hai.
 *
 * Simple shabdon mein: ye ek "waiter" hai jo React (customer) se order leta hai,
 * database (kitchen) se data laata hai, aur wapas serve karta hai.
 */

const express = require("express");
const cors = require("cors");
const companiesRouter = require("./routes/companies");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "https://runway-frontend-wxzq.onrender.com" }));     // isse React (alag port pe chalta hai) is server se baat kar sake
app.use(express.json());

// Jab koi /api/companies pe request bheje, companiesRouter usse handle karega
app.use("/api/companies", companiesRouter);

// Simple test route — browser mein khol ke check kar sakte ho server chal raha hai ya nahi
app.get("/", (req, res) => {
  res.send("Funding Tracker API is running.");
});

app.listen(PORT, () => {
  console.log(`Server chal raha hai: http://localhost:${PORT}`);
});
