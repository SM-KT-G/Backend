//AI Node.js script to verify a JWT token and display its details

const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiODljZGE2NzYtZjBjOC00YTMyLThkMzUtZTMyYmY0OTg4MDE2IiwiaWF0IjoxNzYzMDM2NTgxLCJleHAiOjE3NjMwNDAxODF9.2RXY1znkKIwxPi9XCm3MPG5mJC5KTMs21_AvaOVuf04";

try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token is valid!");
    console.log("📦 Decoded payload:", decoded);
    console.log("\n📅 Token details:");
    console.log("- Issued at (iat):", new Date(decoded.iat * 1000).toLocaleString('ko-KR'));
    console.log("- Expires at (exp):", new Date(decoded.exp * 1000).toLocaleString('ko-KR'));
    console.log("- User UUID:", decoded.uuid);

    const now = Math.floor(Date.now() / 1000);
    const timeLeft = decoded.exp - now;
    console.log("\n⏰ Time remaining:", Math.floor(timeLeft / 60), "minutes", timeLeft % 60, "seconds");
} catch (error) {
    console.error("❌ Token verification failed:", error.message);
}
