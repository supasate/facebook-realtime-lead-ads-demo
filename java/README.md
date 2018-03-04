# Facebook Realtime Lead Ads Demo (Java)

A Java demo based on [Javalin](https://github.com/tipsy/javalin) for retrieving realtime leads from Facebook lead ads

# Prerequisites

1. HTTPS domain and HTTPS endpoint must be accessible from Facebook
2. A page admin's access token with `manage_pages` permission

# Getting Started

1. Copy the file `token/access_token.txt.template` to `token/access_token.txt` and change its content to your system user access token.

Note: Your system user needs to be a page admin and grant `manage_pages` permission.

2. Build with gradle

```base
./gradlew build
```

3. Run

```bash
./gradlew run
```

# How to test with your local machine

If you don't have a HTTPS domain, you can test it with your local machine by using ngrok (or other https tunneling service).

1. Install ngrok.

```bash
npm install -g ngrok
```

2. Start ngrok tunneling to forward http(s) traffic to port 3000 (or your preferred port).

```bash
ngrok http 3000
```

3. It will print its status with a line like the following:

```bash
Forwarding                    https://7f05e4bb.ngrok.io -> localhost:3000
```

Copy this https URL. We will use it to set up a webhook.
