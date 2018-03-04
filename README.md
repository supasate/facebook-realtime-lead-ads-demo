# Facebook Realtime Lead Ads Demo

Demos for retrieving realtime leads from Facebook lead ads.

## What web frameworks we use to build the demos

To make our demo applications can run as stand alone applications without additional web servers, we've built them based on micro web frameworks as follows:

* Java - based on [Javalin](https://github.com/tipsy/javalin)
* Node.js (JavaScript) - based on [express](https://github.com/expressjs/express)
* PHP - vanilla PHP with built-in web server
* Python - based on [Flask](https://github.com/pallets/flask)
* Ruby - based on [Sinatra](https://github.com/sinatra/sinatra)

## Prerequisites

1. Have access to your [Facebook App](httsp://developers.facebook.com/apps).
2. Have access to your [Business Manager](https://business.facebook.com/select/).
3. Have access to your Facebook Page associated with a lead ads campaign.
4. Add the Facebook app and page to your Business Manager. (in Business Manager -> Business Settings -> Apps -> Add)
5. Create a `System User`. (in Business Manager left column menu (need to have at least 1 app in Business Manager to see the System User menu))
6. Assign your page to the system user as `Page Admin`. (in Business Manager -> Business Settings -> System Users -> Assign Assets)
7. Assign the system user to your facebook app as developer (in App dashboard -> Roles).
8. Subscribe your App to your Page by [calling Graph API](https://developers.facebook.com/docs/graph-api/reference/page/subscribed_apps) (Note: you can use [Graph API Explorer](https://developers.facebook.com/tools/explorer/). Select your App and get page access token for your page and make a POST request to `/<your_page_id>/subscribed_apps`)
9. Generate system user access token with `manage_pages` permission. (in Business Manager -> Business Settings -> System Users -> Generate New Token)

## Note

We've simplified the demo applications to make them concise for a crash-course workshop and intentionally ignored handling some edge cases.
