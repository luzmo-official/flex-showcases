const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Luzmo = require('@luzmo/nodejs-sdk');

dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

const requiredEnvKeys = [
  'LUZMO_API_KEY',
  'LUZMO_API_TOKEN',
  'LUZMO_COLLECTION_ID',
];

const missingEnvKeys = requiredEnvKeys.filter((key) => !process.env[key]);

if (missingEnvKeys.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missingEnvKeys.join(
      ', ',
    )}. Copy backend/.env.example to backend/.env and provide the values.`,
  );
}

const config = {
  luzmo: {
    apiToken: process.env.LUZMO_API_TOKEN,
    apiKey: process.env.LUZMO_API_KEY,
    collectionId: process.env.LUZMO_COLLECTION_ID,
    apiUrl: process.env.LUZMO_API_URL || 'https://api.luzmo.com',
  },
};

const client = new Luzmo({
  api_key: config.luzmo.apiKey,
  api_token: config.luzmo.apiToken,
  host: config.luzmo.apiUrl,
});

// Luzmo embed endpoint
const embed = async (body) => {
  try {
    const response = await client.create('authorization', {
      type: 'embed',
      expiry: new Date(Date.now() + 60 * 60 * 1000),
      username: 'DevOps Command',
      name: 'DevOps Command',
      email: 'devops.command@luzmo.com',
      suborganization: 'Demo Application',
      role: 'designer',
      access: {
        collections: [
          {
            id: config.luzmo.collectionId,
            inheritRights: 'use'
          }
        ]
      },
      iq: {
        context: `
        You are a smart assistant that is working in a futuristic DevOps command center.
        Your responses will be rendered in a terminal. Ensure your tone of voice matches this vibe.
        `
      }
    });

    return { code: 200, response: response };
  } catch (error) {
    console.error('Error generating embed token:', error);
    return { code: 500, error: 'Failed to generate embed token.' };
  }
};

exports.handler = async event => {
  const body = JSON.parse(event.body);

  if (event.rawPath === "/api/embed") {
    const { code, response, error } = await embed(body);
    return {
      statusCode: code,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response || error),
    };
  }
  else {
    console.log("Not Found");
    return {
      statusCode: 404,
      body: "Not Found",
    };
  }
}

const PORT = 3101;

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/embed", async (req, res) => {
  const { code, response, error } = await embed(req.body);
  res.status(code).json(response || error);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
