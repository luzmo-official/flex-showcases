const express = require('express');
const cors = require('cors');
const config = require('config');
const Luzmo = require('@luzmo/nodejs-sdk');

const client = new Luzmo({
  api_key: config.get("luzmo.apiKey"),
  api_token: config.get("luzmo.apiToken"),
  host: config.get("luzmo.apiUrl"),
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
            id: config.get('luzmo.collectionId'),
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

if (config.has("port")) {
  const PORT = config.get("port");

  // Middleware
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Luzmo embed endpoint
  app.post("/api/embed", async (req, res) => {
    const { code, response, error } = await embed(req.body);
    res.status(code).json(response || error);
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
