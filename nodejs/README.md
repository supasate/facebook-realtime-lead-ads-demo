Facebook Realtime Lead Ads Demo (Node.js)
=========================================
A Node.js demo for retrieving realtime leads from Facebook lead ads

Prerequisites
=============
3. HTTPS domain
4. HTTPS endpoint must be accessible from Facebook

How to test with your local machine
===================================
If you don't have a HTTPS domain, you can test it with your local machine by using ngrok (or other https tunneling service).

1. Install ngrok.
```bash
npm install -g ngrok
```
2. Start ngrok tunneling on port 3000.
```bash
ngrok http 3000
```
Note: you can use your preferred port number (depending on what port your web server listens). 
The example code in this repo uses port 3000.

3. It will print its status with a line like the following:
```bash
Forwarding                    https://7f05e4bb.ngrok.io -> localhost:3000
```
Copy this https URL. We will use it to set up a webhook.

Getting Started
===============
1. Install required packages.
```bash
npm install
```
or
```bash
yarn
```
2. Start the server
```bash
npm start
```
