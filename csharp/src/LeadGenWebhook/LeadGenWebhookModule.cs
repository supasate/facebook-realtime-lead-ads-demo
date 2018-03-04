using Nancy;
using Nancy.Extensions;
using Newtonsoft.Json;
using System;
using System.IO;
using System.Net;

namespace LeadGenWebhook
{
    public class LeadGenWebhookModule : NancyModule
    {
        public LeadGenWebhookModule()
        {
            ///////////////////////////////////////////////////////////////////
            //        Part 1: Subscribe a leadgen endpoint to webhook        //
            ///////////////////////////////////////////////////////////////////
            // A token that Facebook will echo back to you as part of callback URL verification.
            const string VERIFY_TOKEN = "YOUR_SECURE_VERIFY_TOKEN";
            // Endpoint for verifying webhook subscripton
            Get("/leadgen", parameters => {
                // Extract a verify token we set in the webhook subscription and a challenge to echo back.
                var verifyToken = this.Request.Query["hub.verify_token"];
                var challenge = this.Request.Query["hub.challenge"];

                if (verifyToken == null || challenge == null) {
                    return "Missing hub.verify_token and hub.challenge params";
                }

                if (verifyToken != VERIFY_TOKEN) {
                    return "Verify token does not match";
                }
                // We echo the received challenge back to Facebook to finish the verification process.
                return challenge;
            });

            string ACCESS_TOKEN_PATH = Path.Combine(
                Directory.GetCurrentDirectory(),
                "token/access_token.txt"
            );
            string GRAPH_API_VERSION = "v2.12";
            string GRAPH_API_ENDPOINT = $"https://graph.facebook.com/{GRAPH_API_VERSION}";

            Post("/leadgen", async parameters => {
                // Read access token for calling graph API.
                if (!File.Exists(ACCESS_TOKEN_PATH)) {
                    Console.WriteLine("The access token file does not exist.");
                    return 500;
                }
                string accessToken = File.ReadAllText(ACCESS_TOKEN_PATH);

                // Get value from POST request body
                dynamic body = JsonConvert.DeserializeObject(this.Request.Body.AsString());

                foreach (dynamic page in body.entry) {
                    foreach (dynamic change in page.changes) {
                        // We get page, form, and lead IDs from the change here.
                        // We need the lead gen ID to get the lead data.
                        // The form ID and page ID are optional. You may want to record them into your CRM system.
                        string pageID = change.value.page_id;
                        string formID = change.value.form_id;
                        string leadgenID = change.value.leadgen_id;
                        Console.WriteLine($"Page ID {pageID}, Form ID {formID}, Leadgen ID {leadgenID}");

                        // Call graph API to request lead info with the lead ID and access token.\
                        string leadgenUri = $"{GRAPH_API_ENDPOINT}/{leadgenID}?access_token={accessToken}";
                        HttpWebRequest request = (HttpWebRequest)WebRequest.Create(leadgenUri);
                        using(HttpWebResponse response = (HttpWebResponse)await request.GetResponseAsync())
                        using(Stream stream = response.GetResponseStream())
                        using(StreamReader reader = new StreamReader(stream))
                        {
                            dynamic jsonResponse = JsonConvert.DeserializeObject(await reader.ReadToEndAsync());
                            string createdTime = jsonResponse.created_time;
                            dynamic fieldData = jsonResponse.field_data;

                            // Handle lead answer here (insert data into your CRM system)
                            Console.WriteLine($"Created time {createdTime}");
                            foreach (dynamic field in fieldData) {
                                string question = field.name;
                                string answers = String.Join(",", field.values);
                                Console.WriteLine($"Question {question}");
                                Console.WriteLine($"Answers {answers}");
                            }
                        }
                    }
                }
                // Send HTTP 200 OK status to indicate we've received the update.
                return 200;
            });
        }
    }
}
