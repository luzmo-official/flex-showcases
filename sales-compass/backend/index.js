const express = require('express');
const cors = require('cors');
const config = require('config');
const Luzmo = require('@luzmo/nodejs-sdk');

const DATASET_ID = "24eb6480-451b-4e2c-9f01-5409742bdba0";
const SALES_MANAGER_COLUMN_ID = "be63a7ec-ce05-4422-9ada-fb8301aa3e27";
const SUBREGION_COLUMN_ID = "c44f0e21-e498-48b1-a83a-99b1c997dfd1";

const client = new Luzmo({
  api_key: config.get("luzmo.apiKey"),
  api_token: config.get("luzmo.apiToken"),
  host: config.get("luzmo.apiUrl"),
});

// Luzmo embed endpoint
const embed = async (body) => {
  const theme = body.theme;
  const user = body.user;
  const locale_id = body.locale_id;
  const currency_id = locale_id === 'en' ? 'USD' : 'EUR';

  try {
    const response = await client.create('authorization', {
      type: 'embed',
      username: 'Demo Application User',
      name: 'Demo Application User',
      email: 'demo@salescompass.ai',
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
      parameter_overrides: {
        created_date: new Date().toISOString(),
        sales_manager: user.name
      },
      iq: {
        context: `
        You are a smart assistant that helps sales managers to analyze their pipeline and revenue. You are given a question and you need to answer it based on the "Deals dataset" available to you. Each row in the dataset represents a deal, which can be in different stages (open or already won/lost). 

        Some pointers:
        - When asked about revenue or deal size, you need to use the "Amount" column.
        - When asked about closed deals in a certain time period, you need to use the "Closed date" column.
        - The "Deal stage" column has the following values:
          - "Prospecting"
          - "Qualification"
          - "Negotiation"
          - "Proposal"
          - "Closed Lost"
          - "Closed Won"
        - When asked about won deals, you need to filter on "Closed Won" stage.
        - When asked about lost deals, you need to filter on "Closed Lost" stage.
        - When asked about open deals, you need to filter on "Prospecting", "Qualification", "Negotiation" or "Proposal" stages.
        - When asked about weighted revenue or weighted value, you need to use the "Expected close date" column.
          - For "won" or "lost" deals, this column contains the date of the close.
          - For "open" deals, this column contains the date of the expected close.

        The current logged in user is ${user.name} he is ${user.title}.
        `
      },
      theme: theme,
      css: '.luzmo-viz-item--evolution-number .title { font-weight: 400 !important; } .widget-tooltip { line-height: 24px !important; }',
      currency_id: currency_id,
      locale_id: locale_id,
      feature_overrides: [
        '!flag_tour',
        '!flag_commenting',
        '!flag_private_sharing',
        '!flag_create_datasets',
        '!flag_css_inject',
        '!flag_theming',
        '!flag_version_history',
        'flag_add_ai_items'
      ]
    });

    return { code: 200, response: response };
  } catch (error) {
    console.error('Error generating embed token:', error);
    return { code: 500, error: 'Failed to generate embed token.' };
  }
};

// Get dashboards
const dashboards = async (body) => {
  const dashboardIds = body.dashboardIds;
  try {
    const response = await client.get('securable', {
      attributes: ['id', 'name', 'contents'],
      where: { id: { in: dashboardIds } }
    });
    return { code: 200, response: response };
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    return { code: 500, error: 'Failed to fetch dashboards' };
  }
};

// Generate AI chart
const aichart = async (body) => {
  const { datasetId, description } = body;
  try {
    const response = await client.create('aichart',
      {
        type: 'generate-chart',
        dataset_id: datasetId,
        question: description,
        model_preference: 'performance'
      }
    );
    return { code: 200, response: response };
  } catch (error) {
    console.error('Error generating AI chart:', error);
    return { code: 500, error: 'Failed to generate AI chart' };
  }
}

// Generate AI chart suggestions
const aichartSuggestions = async (body) => {
  const { datasetId } = body;
  try {
    const response = await client.create('aichart', { 
      type: 'generate-example-questions',
      dataset_id: datasetId,
      model_preference: 'performance'
    });
    return { code: 200, response: response };
  } catch (error) {
    console.error('Error generating AI chart suggestions:', error);
    return { code: 500, error: 'Failed to generate AI chart suggestions' };
  }
}

// Query subregions
const querySubregions = async (body) => {
  const user = body.user;
  try {
    const response = await client.query({
      queries: [{
        dimensions: [
          {
            column_id: SUBREGION_COLUMN_ID,
            dataset_id: DATASET_ID
          }
        ],
        where: [
          {
            expression: "? = ?",
            parameters: [
              {
                column_id: SALES_MANAGER_COLUMN_ID,
                dataset_id: DATASET_ID
              },
              user.name
            ]
          }
        ],
        order: [
          {
            column_id: SUBREGION_COLUMN_ID,
            dataset_id: DATASET_ID,
            order: 'asc'
          }
        ]
      }]
    });

    return { code: 200, response: response };
  } catch (error) {
    console.error('Error querying subregions:', error);
    return { code: 500, error: 'Failed to query subregions data' };
  }
}

// Load custom chart
const loadCustomChart = async (body) => {
  const { type } = body;

  try {
    const response = await client.get('customchart', {
      attributes: ['id', 'name', 'type', 'slots_config'],
      where: {
        type: type
      }
    });
    return { code: 200, response: response };
  }
  catch (error) {
    console.error('Error loading custom chart:', error);
    return { code: 500, error: 'Failed to load custom chart' };
  }
}

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
  } else if (event.rawPath === "/api/datasets") {
    const { code, response, error } = await datasets(body);
    return {
      statusCode: code,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response || error),
    };
  } else if (event.rawPath === "/api/dashboards") {
    const { code, response, error } = await dashboards(body);
    return {
      statusCode: code,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response || error),
    };
  } else if (event.rawPath === "/api/aichart") {
    const { code, response, error } = await aichart(body);
    return {
      statusCode: code,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response || error),
    };
  } else if (event.rawPath === "/api/aichart-suggestions") {
    const { code, response, error } = await aichartSuggestions(body);
    return {
      statusCode: code,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response || error),
    };
  } else if (event.rawPath === "/api/query-subregions") {
    const { code, response, error } = await querySubregions(body);
    return {
      statusCode: code,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response || error),
    };
  } else if (event.rawPath === "/api/customchart") {
    const { code, response, error } = await loadCustomChart(body);
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

  // Get dashboards
  app.post("/api/dashboards", async (req, res) => {
    const { code, response, error } = await dashboards(req.body);
    res.status(code).json(response || error);
  });

  app.post("/api/aichart", async (req, res) => {
    const { code, response, error } = await aichart(req.body);
    res.status(code).json(response || error);
  });

  app.post("/api/aichart-suggestions", async (req, res) => {
    const { code, response, error } = await aichartSuggestions(req.body);
    res.status(code).json(response || error);
  });

  app.post("/api/query-subregions", async (req, res) => {
    const { code, response, error } = await querySubregions(req.body);
    res.status(code).json(response || error);
  });

  app.post("/api/customchart", async (req, res) => {
    const { code, response, error } = await loadCustomChart(req.body);
    res.status(code).json(response || error);
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
