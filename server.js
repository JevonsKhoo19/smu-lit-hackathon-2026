import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "SMU LIT Hackathon API running",
  });
});

const PORT = process.env.PORT || 5000;

app.post("/api/analyze-case", async (req, res) => {
  try {
    const {
      dispute,
      amount,
      date,
      outcome
    } = req.body;

    console.log("Received case:", {
      dispute,
      amount,
      date,
      outcome
    });

    // Temporary response.
    // We will replace this with Bedrock next.
    const analysis = {
      facts: [
        `Claim amount: S$${amount}`,
        `Incident date: ${date}`
      ],
      assumptions: [],
      missingInformation: [],
      followUpQuestions: [],
      outcomeSought: outcome
    };

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error("Case analysis error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to analyse case."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});