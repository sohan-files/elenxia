import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const twilioSid = process.env.TWILIO_ACCOUNT_SID || "";
const twilioToken = process.env.TWILIO_AUTH_TOKEN || "";
const twilioFrom = process.env.TWILIO_FROM || "";


if (!twilioSid || !twilioToken || !twilioFrom) {
  console.error('Twilio credentials missing or invalid. Check .env file.');
}

let canSend = false;
let client = null;

if (twilioSid && twilioToken && twilioFrom) {
  try {
    client = twilio(twilioSid, twilioToken);
    canSend = true;
  } catch (error) {
    console.error('Failed to initialize Twilio client:', error.message);
    canSend = false;
    client = null;
  }
}

if (!canSend) {
  console.warn("!!! TWILIO IS NOT CONFIGURED. SMS MESSAGES WILL NOT BE SENT.");
  console.warn("!!! Create a .env file in backend/node and add your Twilio credentials.");
}

app.get("/health", (_, res) => res.json({ ok: true }));

app.post("/api/sms", async (req, res) => {
  try {
    const { to, body } = req.body || {};
    if (!to || !body) return res.status(400).json({ error: "Missing 'to' or 'body'" });
    if (!canSend) return res.status(500).json({ error: "Twilio not configured" });

    const msg = await client.messages.create({ to, from: twilioFrom, body });
    res.json({ id: msg.sid, status: msg.status });
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

const port = process.env.PORT || 8787;

app.listen(port, () => {
  console.log(`PillPall SMS server listening on :${port}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});


