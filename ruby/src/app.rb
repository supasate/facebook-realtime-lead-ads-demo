require 'sinatra'
require 'net/http'

set :port, 3000

###################################################################
#         Part 1: Subscribe a leadgen endpoint to webhook         #
###################################################################
# A token that Facebook will echo back to you as part of
# callback URL verification.
VERIFY_TOKEN = 'YOUR_SECURE_VERIFY_TOKEN'
# Endpoint for verifying webhook subscripton
get '/leadgen' do
  # Extract a verify token we set in the webhook subscription
  # and a challenge to echo back.
  verify_token = params['hub.verify_token']
  challenge = params['hub.challenge']

  if verify_token.nil? || challenge.nil?
    return 'Missing hub.verify_token and hub.challenge params'
  end

  if verify_token != VERIFY_TOKEN
    return 'Verify token does not match'
  end
  # We echo the received challenge back to Facebook to finish
  # the verification process.
  return challenge
end

###################################################################
#               Part 2: Retrieving realtime leads                 #
###################################################################
# Your system user access token file path.
# Note: Your system user needs to be an admin of the subscribed page.
ACCESS_TOKEN_PATH = File.join(File.dirname(__FILE__), '..', 'token', 'access_token.txt')
# Graph API endpoint
GRAPH_API_VERSION = 'v2.12'
GRAPH_API_ENDPOINT = "https://graph.facebook.com/#{GRAPH_API_VERSION}"

# Facebook will post realtime leads to this endpoint
# if we've already subscribed to the webhook in part 1.
post '/leadgen' do
  if !File.file?(ACCESS_TOKEN_PATH)
    puts 'Access token file does not exsist'
    return 500
  end

  access_token = File.read(ACCESS_TOKEN_PATH)

  # Get value from POST request body
  body = JSON.parse request.body.read
  body['entry'].each { |page|
    page['changes'].each { |change|
      # We get page, form, and lead IDs from the change here.
      # We need the lead gen ID to get the lead data.
      # The form ID and page ID are optional.
      # You may want to record them into your CRM system.
      page_id = change['value']['page_id']
      form_id = change['value']['form_id']
      leadgen_id = change['value']['leadgen_id']
      puts "Page ID #{page_id}, Form ID #{form_id}, Leadgen ID #{leadgen_id}"
      # Call graph API to request lead info with the lead ID
      # and access token.
      leadgen_uri = "#{GRAPH_API_ENDPOINT}/#{leadgen_id}?access_token=#{access_token}"
      response = JSON.parse Net::HTTP.get(URI.parse(leadgen_uri))
      created_time = response['created_time']
      field_data = response['field_data']

      # Handle lead answer here (insert data into your CRM system)
      puts "Created time #{created_time}"
      field_data.each { |field|
        question = field['name']
        answers = field['values'].join(',')
        puts "Question #{question}"
        puts "Answer #{answers}"
      }
    }
  }
  # Send HTTP 200 OK status to indicate we've received the update.
  return 200
end
