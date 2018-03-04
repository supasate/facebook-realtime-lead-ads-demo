from flask import Flask, request, make_response, jsonify
from os import path
import json
import requests

app = Flask(__name__)


@app.route('/leadgen', methods=['GET', 'POST'])
def leadgen():
    if request.method == 'GET':
        ###################################################################
        #         Part 1: Subscribe a leadgen endpoint to webhook         #
        ###################################################################
        # A token that Facebook will echo back to you as part of
        # callback URL verification.
        VERIFY_TOKEN = 'YOUR_SECURE_VERIFY_TOKEN'
        # Extract a verify token we set in the webhook subscription
        # and a challenge to echo back.
        verify_token = request.args.get('hub.verify_token')
        challenge = request.args.get('hub.challenge')

        if (not verify_token or not challenge):
            return 'Missing hub.verify_token and hub.challenge params'

        if (verify_token != VERIFY_TOKEN):
            return 'Verify token does not match'
        # We echo the received challenge back to Facebook to finish
        # the verification process.
        return challenge
    elif request.method == 'POST':
        ###################################################################
        #               Part 2: Retrieving realtime leads                 #
        ###################################################################
        # Facebook will post realtime leads to this endpoint
        # if we've already subscribed to the webhook in part 1.

        # Graph API endpoint
        GRAPH_API_VERSION = 'v2.12'
        GRAPH_API_ENDPOINT = 'https://graph.facebook.com/' + GRAPH_API_VERSION
        # Your system user access token file path.
        # Note: Your system user needs to be an admin of the subscribed page.
        current_dir = path.dirname(path.realpath(__file__))
        ACCESS_TOKEN_PATH = path.join(
            current_dir, '..', 'token', 'access_token.txt'
        )
        if not path.isfile(ACCESS_TOKEN_PATH):
            error_message = 'Access token file does not exsist'
            app.logger.error(error_message)
            return make_response(
                jsonify(success=False, message=error_message),
                500
            )

        f = open(ACCESS_TOKEN_PATH, 'r')
        access_token = f.read()
        # Get value from POST request body
        body = request.get_json()
        for page in body.get('entry'):
            for change in page.get('changes'):
                # We get page, form, and lead IDs from the change here.
                # We need the lead gen ID to get the lead data.
                # The form ID and page ID are optional.
                # You may want to record them into your CRM system.
                value = change.get('value')
                page_id = value.get('page_id')
                form_id = value.get('form_id')
                leadgen_id = value.get('leadgen_id')
                print('Page ID {}, Form ID {}, Lead ID {}'.format(
                    page_id, form_id, leadgen_id
                ))

                # Call graph API to request lead info with the lead ID
                # and access token.
                leadgen_uri = (GRAPH_API_ENDPOINT + '/' + leadgen_id +
                               '?access_token=' + access_token)
                response = json.loads(requests.get(leadgen_uri).text)
                created_time = response.get('created_time')
                field_data = response.get('field_data')

                # Handle lead answer here (insert data into your CRM system)
                print('Created time ', created_time)
                for field in field_data:
                    question = field.get('name')
                    answers = field.get('values')
                    print('Question ', question)
                    print('Answers ', ','.join(answers))

        return make_response(jsonify(success=True), 200)


PORT = 3000

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT)
