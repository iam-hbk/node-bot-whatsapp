import express, { Request, Response } from "express";
import handleIncomingMessage from "./routes/messageHandler";
import connectDB from "./database/mongo_db";
const app = express();
const port = 3000;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
export const client = require("twilio")(accountSid, authToken);

connectDB();


// let db: Database;
// try {
//   db = await readCSV();
//   db.exec("PRAGMA journal_mode = WAL;");
//   console.log("\nDatabase Loaded Successfully 🚀");
// } catch (error) {
//   console.error("DATABASE ERROR", (error as Error).message);
// }

app.get("/", async (req, res) => {
  res.send("Whatsapp bot is running on Node!");
});

//listen to reponses
app.post(
  "/webhook",
  express.urlencoded({ extended: true }),
  express.json(),
  async (req, res) => {
    handleIncomingMessage(res, req);
  }
);
app.post(
  "/error",
  express.urlencoded({ extended: true }),
  express.json(),
  async (req: Request, res: Response) => {
    // const { Body, From } = req.body;
    console.log(JSON.parse(req.body.Payload));
    console.log("Error occured");
  }
);
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
});

// Handle process termination
// process.on("SIGINT", closeDatabase);
// process.on("SIGTERM", closeDatabase);

// function closeDatabase() {
//   if (db) {
//     db.close();
//     console.log("Database connection closed");
//     process.exit(0);
//   } else {
//     process.exit(0); // Exit the process if there's no database connection
//   }
// }
