# TweetMorse    
Send morse-coded tweets from your Arduino.                                                                    
                                                                                                              
## Dependencies
* Read package.json to see all the packages required.                                                           
* You will also need an Arduino UNO (or better).
* Set up a twitter app for this and set secrets in the .env file.
* Run the app with Foreman to set all env variables.

## Setup
There are 2 main configuration files.
### config.json
This has all the application constants.
```javascript
{
  "led-pin": 13,
  "button-pin": 2,
  "button-push-to-make": false,
  "debug-mode": false,
  "dot-dash-time-threshold": 500,
  "twitter-hashtag": "TweetMorse",
  "decoding-error-placeholder": "[derp]"
}
```
### .env
This includes all env key=value pairs. Please set these correctle before running the app.
```text
TWITTER_HANDLE=<your_twitter_handle>
TWITTER_CONSUMER_KEY=<twitter_app_consumer_key>
TWITTER_CONSUMER_SECRET=<twitter_app_consumer_secret>
TWITTER_ACCESS_TOKEN=<twitter_app_access_token>
TWITTER_ACCESS_TOKEN_SECRET=<twitter_app_access_token_secrey>
```

