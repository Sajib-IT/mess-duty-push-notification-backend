const express = require("express");
const admin = require("firebase-admin");

const app = express();
app.use(express.json());

// 🔥 Load Firebase config from ENV
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Fix private key newline issue
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

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

  if (!fcmToken || !title || !body) {
    return res.status(400).json({
      success: false,
      message: "fcmToken, title, and body are required.",
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

// ❌ REMOVE app.listen()
// ✅ Export for Vercel
module.exports = app;