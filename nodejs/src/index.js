const axios = require('axios');
const bodyParser = require('body-parser');
const express = require('express');
const fs = require('fs');
const path = require('path');

const SERVER_PORT = 3000;
const app = express();
app.use(bodyParser.json());

/////////////////////////////////////////////////////////////////////////
//           Part 1: Subscribe a leadgen endpoint to webhook           //
/////////////////////////////////////////////////////////////////////////

// A token that Facebook will echo back to you as part of callback URL verification.
const VERIFY_TOKEN = 'YOUR_SECURE_VERIFY_TOKEN';

// Endpoint for verifying webhook subscripton
app.get('/leadgen', (req, res) => {
  if (!req.query) {
    res.send({success: false, reason: 'Empty request params'});
    return;
  }
  // Extract a verify token we set in the webhook subscription and a challenge to echo back.
  const verifyToken = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (!verifyToken || !challenge) {
    res.send({
      success: false,
      reason: 'Missing hub.verify_token and hub.challenge params',
    });
    return;
  }

  if (verifyToken !== VERIFY_TOKEN) {
    res.send({success: false, reason: 'Verify token does not match'});
    return;
  }
  // We echo the received challenge back to Facebook to finish the verification process.
  res.send(challenge);
});

/////////////////////////////////////////////////////////////////////////
//                  Part 2: Retrieving realtime leads                  //
/////////////////////////////////////////////////////////////////////////

// Graph API endpoint
const GRAPH_API_VERSION = 'v2.12';
const GRAPH_API_ENDPOINT = `https://graph.facebook.com/${GRAPH_API_VERSION}`;
// Your system user access token file path.
// Note: Your system user needs to be an admin of the subscribed page.
const ACCESS_TOKEN_PATH = path.join(
  __dirname,
  '..',
  'token',
  'access_token.txt'
);

// Read access token for calling graph API.
if (!fs.existsSync(ACCESS_TOKEN_PATH)) {
  console.log(`The file ${ACCESS_TOKEN_PATH} does not exist.`);
  process.exit(1);
}
const accessToken = fs.readFileSync(ACCESS_TOKEN_PATH, 'utf-8');
// Facebook will post realtime leads to this endpoint if we've already subscribed to the webhook in part 1.
app.post('/leadgen', (req, res) => {
  const entry = req.body.entry;

  entry.forEach(page => {
    page.changes.forEach(change => {
      // We get page, form, and lead IDs from the change here.
      // We need the lead gen ID to get the lead data.
      // The form ID and page ID are optional. You may want to record them into your CRM system.
      const {page_id, form_id, leadgen_id} = change.value;
      console.log(
        `Page ID ${page_id}, Form ID ${form_id}, Lead gen ID ${leadgen_id}`
      );

      // Call graph API to request lead info with the lead ID and access token.
      const leadgenURI = `${GRAPH_API_ENDPOINT}/${leadgen_id}?access_token=${accessToken}`;

      axios(leadgenURI)
        .then(response => {
          const {created_time, id, field_data} = response.data;

          // Handle lead answer here (insert data into your CRM system)
          console.log('Lead id', id);
          console.log('Created time', created_time);
          field_data.forEach(field => {
            console.log('Question ', field.name);
            console.log('Answers ', field.values);
          });
        })
        .catch(error => {
          // Handle error here
          console.log(error);
        });
    });
  });
  res.sendStatus(200);
});

// Start web server
app.listen(SERVER_PORT, () =>
  console.log(`Server is listening at localhost:${SERVER_PORT}`)
);
