const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const GRAPH_API_VERSION = 'v2.12';
const GRAPH_API_ENDPOINT = `https://graph.facebook.com/${GRAPH_API_VERSION}`;
// Your system user access token. Your system user needs to be an admin of the subscribed page.
// (it's better if you read if from a file that is not tracked by version control).
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN';

const app = express();
app.use(bodyParser.json());

// Token that Facebook will echo back to you as part of callback URL verification.
const VERIFY_TOKEN = 'YOUR_SECURE_VERIFY_TOKEN';

// Endpoint for verifying webhook subscripton
app.get('/leadgen', (req, res) => {
  if (!req.query) {
    res.send({success: false, reason: 'Empty request params'});
    return;
  }

  if (!req.query['hub.verify_token'] || !req.query['hub.challenge']) {
    res.send({success: false, reason: 'Missing hub.verify_token and hub.challenge params'});
    return;
  }

  if (req.query['hub.verify_token'] !== VERIFY_TOKEN) {
    res.send({success: false, reason: 'Verify token does not match'});
    return;
  }

  res.send(req.query['hub.challenge']);
});

// Facebook will post realtime leads to this endpoint.
app.post('/leadgen', (req, res) => {
  const entry = req.body.entry;

  entry.forEach(page => {
    console.log(`Page ID: ${page.id}`);
    console.log(`Page Changes: ${JSON.stringify(page.changes)}`);
    page.changes.forEach(change => {
      // We get page, form, and lead IDs from the change here.
      const {page_id, form_id, leadgen_id} = change.value;
      console.log('Page ID', page_id);
      console.log('Form ID', form_id);
      console.log('Lead Gen ID', leadgen_id);

      // Call graph API to Request lead info with the lead ID and access token.
      const leadgenURI = `${GRAPH_API_ENDPOINT}/${leadgen_id}?access_token=${ACCESS_TOKEN}`;
      axios(leadgenURI)
        .then(response => {
          const {created_time, id, field_data} = response.data;

          // Handle lead answer here (insert data into your CRM system)
          console.log('created time', created_time);
          console.log('lead id', id);
          console.log('answers', field_data);
        })
        .catch(error => {
          // Handle error here
          console.log(error);
        }); 
    });
  });

  res.sendStatus(200);
});

app.listen(3000, () => console.log('Server is listening at localhost:3000'));
