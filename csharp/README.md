# Facebook Realtime Lead Ads Demo (C#)

A C# demo based on [Nancy](https://github.com/NancyFx/Nancy) for retrieving realtime leads from Facebook lead ads

# Prerequisites

1. HTTPS domain and HTTPS endpoint must be accessible from Facebook
2. A page admin's access token with `manage_pages` permission

# Getting Started
1. Install [.NET Core SDK 1.1.7](https://github.com/dotnet/core/blob/master/release-notes/download-archives/1.1.6-download.md) (It doesn't work on .NET Core 2.0)

2. Install packages

```bash
dotnet restore
```

3. Copy the file `token/access_token.txt.template` to `token/access_token.txt` and change its content to your system user access token.

Note: Your system user needs to be a page admin and grant `manage_pages` permission.

4. Start

```bash
dotnet run
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
