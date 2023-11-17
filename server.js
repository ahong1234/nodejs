const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cors = require("cors");

const app = express();
const port = process.env.port || 3001;
const isProduction = process.env.NODE_ENV === "production";

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/data", (req, res) => {
  try {
    const savedData = readDataFromFile();
    res.json(savedData);
  } catch (error) {
    handleErrorResponse(res, error.message);
  }
});

app.post("/api/data", (req, res) => {
  try {
    validateRequestBody(req.body);

    const promptFromReact = req.body;
    validatePrompt(promptFromReact.prompt);

    promptFromReact.timestamp = new Date().toLocaleString();

    console.log("Data received from React app:", promptFromReact);

    saveDataToFile(promptFromReact);

    res.json({ message: `Prompt received: ${promptFromReact.prompt}` });
  } catch (error) {
    handleErrorResponse(res, error.message);
  }
});

function validateRequestBody(body) {
  if (!body || Object.keys(body).length === 0) {
    throw new Error("Request body is missing or empty.");
  }
}

function validatePrompt(prompt) {
  if (!prompt) {
    throw new Error(
      "Invalid request body. Key 'prompt' is missing or has no value."
    );
  }

  if (typeof prompt !== "string") {
    throw new Error("Key 'prompt' must have a string value.");
  }
}

function saveDataToFile(data) {
  const filePath = "data.json";

  let existingData = [];
  try {
    existingData = require(`./${filePath}`);
  } catch (error) {
    // File may not exist, which is okay
  }

  existingData.push(data);

  fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
}

function readDataFromFile() {
  const filePath = "data.json";

  try {
    return require(`./${filePath}`);
  } catch (error) {
    return [];
  }
}

function handleErrorResponse(res, errorMessage) {
  console.error("Error handling the request:", errorMessage);
  res.status(400).json({ error: errorMessage });
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
