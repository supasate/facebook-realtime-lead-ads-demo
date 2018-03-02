import io.javalin.Javalin;
import java.io.File;
import java.io.FileNotFoundException;
import java.net.URL;
import java.util.Scanner;
import org.json.JSONArray;
import org.json.JSONObject;


public class LeadGenWebhook {
    public static final int SERVER_PORT = 3000;

    public static void main(String[] args) {
        Javalin app = Javalin.start(SERVER_PORT);
        /////////////////////////////////////////////////////////////////////////
        //           Part 1: Subscribe a leadgen endpoint to webhook           //
        /////////////////////////////////////////////////////////////////////////
        // A token that Facebook will echo back to you as part of callback URL verification.
        String VERIFY_TOKEN = "YOUR_SECURE_VERIFY_TOKEN";
        // Endpoint for verifying webhook subscripton
        app.get("/leadgen", ctx -> {
            if (ctx.anyQueryParamNull("hub.verify_token", "hub.challenge")) {
              ctx.result("Missing hub.verify_token and hub.challenge params");
              return;
            }
            // Extract a verify token we set in the webhook subscription and a challenge to echo back.
            String verifyToken = ctx.queryParam("hub.verify_token");
            String challenge = ctx.queryParam("hub.challenge");

            if (!verifyToken.equals(VERIFY_TOKEN)) {
                ctx.result("Verify token does not match");
                return;
            }
            // We echo the received challenge back to Facebook to finish the verification process.
            ctx.result(challenge);
        });

        /////////////////////////////////////////////////////////////////////////
        //                  Part 2: Retrieving realtime leads                  //
        /////////////////////////////////////////////////////////////////////////
        // Graph API endpoint
        String GRAPH_API_VERSION = "v2.12";
        String GRAPH_API_ENDPOINT = "https://graph.facebook.com/" + GRAPH_API_VERSION;
        // Your system user access token file path.
        // Note: Your system user needs to be an admin of the subscribed page.
        String ACCESS_TOKEN_PATH = System.getProperty("user.dir") + "/token/access_token.txt";
        // Read access token for calling graph API.
        String accessTokenBuffer = null;
        try {
            Scanner sc = new Scanner(new File(ACCESS_TOKEN_PATH));
            accessTokenBuffer = sc.next();
        } catch (FileNotFoundException error) {
            System.out.println("The access token file does not exist. " + ACCESS_TOKEN_PATH);
            System.exit(0);
        }
        final String accessToken = accessTokenBuffer;
        // Facebook will post realtime leads to this endpoint if we've already subscribed to the webhook in part 1.
        app.post("/leadgen", ctx -> {
            JSONObject body = new JSONObject(ctx.body());
            JSONArray entry = body.getJSONArray("entry");

            for (int i = 0; i < entry.length(); i++) {
                JSONArray changes = entry.getJSONObject(i).getJSONArray("changes");
                for (int j = 0; j < changes.length(); j++) {
                    JSONObject change = changes.getJSONObject(j).getJSONObject("value");
                    // We get page, form, and lead IDs from the change here.
                    // We need the lead gen ID to get the lead data.
                    // The form ID and page ID are optional. You may want to record them into your CRM system.
                    String pageID = change.getString("page_id");
                    String formID = change.getString("form_id");
                    String leadgenID = change.getString("leadgen_id");
                    System.out.println("Page ID " + pageID + ", Form ID " + formID + ", Lead gen ID " + leadgenID);

                    // Call graph API to request lead info with the lead ID and access token.
                    String leadgenURI = GRAPH_API_ENDPOINT + "/" + leadgenID + "?access_token=" + accessToken;
                    Scanner urlScanner = new Scanner(new URL(leadgenURI).openStream());
                    // “\A” is a regex for the beginning of the input.
                    // next() will return from the beginning all the way to the end.
                    JSONObject response = new JSONObject(urlScanner.useDelimiter("\\A").next());

                    String createdTime = response.getString("created_time");
                    String id = response.getString("id");
                    JSONArray fields = response.getJSONArray("field_data");

                    // Handle lead answer here (insert data into your CRM system)
                    System.out.println("Lead ID " + id);
                    System.out.println("Created time " + createdTime);
                    for (int k = 0; k < fields.length(); k++) {
                      JSONObject field = fields.getJSONObject(k);
                      String question = field.getString("name");
                      JSONArray answers = field.getJSONArray("values");

                      System.out.println("Question " + question);
                      System.out.println("Answers " + answers.join(","));
                    }
                }
            }
            ctx.status(200);
        });
    }
}
