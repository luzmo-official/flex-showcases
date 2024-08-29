# ai-showcases
A demo of an embedded AI chart generator using the Luzmo API and composability.

## Usage
To use this project, follow these steps:

1. Clone the repository to your local machine.
2. Create an `.env` file in the `backend` folder containing a the following info: <br>
  LUZMO_API_KEY=`<the luzmo api key>`<br>
  LUZMO_API_TOKEN=`<the luzmo api token>`<br>
3. Install the dependencies in frontend & backend folder by running `npm install`.
4. Create a local config file: `backend/config/local.cjs`
```
module.exports = {
  local: true,
  port: 4000,
  luzmo: {
      apiToken: '<your api token>',
      apiKey: '<your api key>',
  },
};
```
4. Run the backend `cd backend && node index.js`
5. Run the frontend `cd frontend && ng serve`
