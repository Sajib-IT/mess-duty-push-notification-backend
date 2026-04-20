const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());

// 🔥 Load Firebase config from ENV or local file
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  // Fix private key newline issue
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
} else {
  serviceAccount = require("./serviceAccountKey.json");
}

// Initialize Firebase Admin (prevent multiple init)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/**
 * POST /send-notification
 * Body: { fcmToken: string, title: string, body: string }
 */
app.post("/send-notification", async (req, res) => {
  const { fcmToken, title, body } = req.body;

  if (!fcmToken) {
    return res.status(400).json({
      success: false,
      message: "fcmToken is required.",
    });
  }
    if (!title ) {
    return res.status(400).json({
      success: false,
      message: "title is required.",
    });
  }
    if ( !body) {
    return res.status(400).json({
      success: false,
      message: "body is required.",
    });
  }

  try {
    const response = await admin.messaging().send({
      token: fcmToken,
      notification: {
        title,
        body,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Notification sent successfully",
      messageId: response,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send notification",
      error: error.message,
    });
  }
});

// ✅ Listen locally when run directly; export for Vercel serverless
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Kill the existing process and restart.`);
      process.exit(1);
    } else {
      throw err;
    }
  });
}

module.exports = app;