<?php
/////////////////////////////////////////////////////////////////////////
//           Part 1: Subscribe a leadgen endpoint to webhook           //
/////////////////////////////////////////////////////////////////////////
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  // A token that Facebook will echo back to you as part of callback URL verification.
  $VERIFY_TOKEN = 'YOUR_SECURE_VERIFY_TOKEN';
  // Extract a verify token we set in the webhook subscription and a challenge to echo back.
  $verify_token = $_GET['hub_verify_token'];
  $challenge = $_GET['hub_challenge'];

  if (!$verify_token || !$challenge) {
    echo 'Missing hub.verify_token and hub.challenge params';
    exit();
  }

  if ($verify_token !== $VERIFY_TOKEN) {
    echo 'Verify token does not match';
    exit();
  }
  // We echo the received challenge back to Facebook to finish the verification process.
  echo $challenge;
}

/////////////////////////////////////////////////////////////////////////
//                  Part 2: Retrieving realtime leads                  //
/////////////////////////////////////////////////////////////////////////
// Graph API endpoint
$GRAPH_API_VERSION = 'v2.12';
$GRAPH_API_ENDPOINT = 'https://graph.facebook.com/'.$GRAPH_API_VERSION;
// Your system user access token file path.
// Note: Your system user needs to be an admin of the subscribed page.
$ACCESS_TOKEN_PATH = '..'.DIRECTORY_SEPARATOR.'token'.DIRECTORY_SEPARATOR.'access_token.txt';

function console_log($string) {
  file_put_contents('php://stdout', $string.PHP_EOL);
}

// Facebook will post realtime leads to this endpoint if we've already subscribed to the webhook in part 1.
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // Read access token for calling graph API
  if (!file_exists($ACCESS_TOKEN_PATH)) {
    console_log('Access token file does not exist');
    exit();
  }
  $access_token = file_get_contents($ACCESS_TOKEN_PATH);
  // Get value from request body
  $body = json_decode(file_get_contents('php://input'), true);
  foreach ($body['entry'] as $page) {
    foreach ($page['changes'] as $change) {
      // We get page, form, and lead IDs from the change here.
      // We need the lead gen ID to get the lead data.
      // The form ID and page ID are optional. You may want to record them into your CRM system.
      $page_id = $change['value']['page_id'];
      $form_id = $change['value']['form_id'];
      $leadgen_id = $change['value']['leadgen_id'];
      console_log('Page ID '.$page_id.', Form ID '.$form_id.', Lead gen ID '.$leadgen_id);

      // Call graph API to request lead info with the lead ID and access token.
      $leadgen_uri = $GRAPH_API_ENDPOINT.'/'.$leadgen_id.'?access_token='.$access_token;
      $response = json_decode(file_get_contents($leadgen_uri));
      $id = $response->id;
      $created_time = $response->created_time;
      $field_data = $response->field_data;

      // Handle lead answer here (insert data into your CRM system)
      console_log('Lead ID '.$id);
      console_log('Created time '.$created_time);
      foreach ($field_data as $field) {
        $question = $field->name;
        $answers = $field->values;
        console_log('Question '.$question);
        console_log('Answers '.print_r($answers, true));
      }
    }
  }
  http_response_code(200);
}
