const express = require("express");
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(express.json());

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

  const message = {
    token: fcmToken,
    notification: {
      title,
      body,
    },
  };

  try {
    const response = await admin.messaging().send(message);
    return res.status(200).json({
      success: true,
      message: "Notification sent successfully.",
      messageId: response,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to send notification.",
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
