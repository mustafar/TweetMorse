exports.index = function (req, res) {
  var NConf = require('nconf'),
      Twit = require('twit');
  NConf.use ('file', {file: 'secrets.json' });
  NConf.load ();

  var twitClient = new Twit({
        consumer_key:         NConf.get("twitter-consumer-key"),
        consumer_secret:      NConf.get("twitter-consumer-secret"),
        access_token:         NConf.get("twitter-access-token"),
        access_token_secret:  NConf.get("twitter-access-token-secret")
      }),
      twitterHandle = NConf.get("twitter-handle"); 

  NConf.use ('file', {file: 'config.json' });
  NConf.load ();
  var twitTag =  NConf.get("twitter-hashtag") || 'TweetMorse',
      decodingErrText =  NConf.get("decoding-error-placeholder") || '[derp]';

  var tweets = [];
  query = '#' + twitTag + ' from:' + twitterHandle;
  twitClient.get('search/tweets', { q: query, count: 100 }, function(err, reply) {
    if (!err) {
      for (var i=0; i<reply.statuses.length; i++) {
        var tweet = reply.statuses[i],
            tweetTextCleaned = tweet.text.replace(/[^ .-]/g, '').replace(/^\s+|\s+$/g, ''),
            parts = tweetTextCleaned.split(' '); 

        // decode
        for(var j=parts.length; j>0; j--) {
          var charCoded = parts[j-1],
              charDecoded = morseToText[charCoded] || decodingErrText;
          parts[j-1] = charDecoded; 
        }
        tweets.push({
          "id": tweet.id_str,
          "link": "http://twitter.com/" + 
                  twitterHandle + 
                  "/status/" + 
                  tweet.id_str,
          "text": tweetTextCleaned,
          "textDecoded": parts.join(''),
          "time": tweet.created_at
        });
      }
      res.render ('page', {
        'title': 'TweetMorse',
        'tweets': tweets
      });
    } else {
      res.json({status: "FAILURE"});
    }
  })
};

exports.send = function (req, res) {
  var msg = req.query.msg;
  msg = msg.replace(/[^ .-]/g, '');
  if(msg) { 

    var NConf = require('nconf'),
        Twit = require('twit');
    NConf.use ('file', {file: 'secrets.json' });
    NConf.load ();

    var twitClient = new Twit({
          consumer_key:         NConf.get("twitter-consumer-key"),
          consumer_secret:      NConf.get("twitter-consumer-secret"),
          access_token:         NConf.get("twitter-access-token"),
          access_token_secret:  NConf.get("twitter-access-token-secret")
        }); 

    NConf.use ('file', {file: 'config.json' });
    NConf.load ();
    var twitTag =  NConf.get("twitter-hashtag") || 'TweetMorse';
    msg = '#' + twitTag + ' ' + msg;

    twitClient.post('statuses/update', { status: msg }, function(err, reply) {
      res.json({status: "OK"});
    });
  } else {
    res.json({status: "OK"});
  }
};

exports.listen = function (req, res) {

  var NConf = require('nconf'),
      arduino = require('duino'),
      boardControl = require('./boardcontrol.js');

  // nconf setup
  NConf.use ('file', {file: 'config.json' });
  NConf.load ();

  // setup params
  var ledPin = NConf.get("led-pin") || 13;
  var buttonPin = NConf.get("button-pin") || 2;
  var debugMode = NConf.get("debug-mode");

  var board = new arduino.Board({
    debug: debugMode
  });

  board.on('ready', function() {
    var led = new arduino.Led({
      board: board,
      pin: ledPin
    });
    var button = new arduino.Button({
      board: board,
      pin: buttonPin
    });
    
    boardControl.init(button, led);
    boardControl.listen();

  });

  res.write("listening...");
};


var textToMorse = {
  "a": ".-",    "b": "-...",  "c": "-.-.",  "d": "-..",
  "e": ".",     "f": "..-.",  "g": "--.",   "h": "....",
  "i": "..",    "j": ".---",  "k": "-.-",   "l": ".-..",
  "m": "--",    "n": "-.",    "o": "---",   "p": ".--.",
  "q": "--.-",  "r": ".-.",   "s": "...",   "t": "-",
  "u": "..-",   "v": "...-",  "w": ".--",   "x": "-..-",
  "y": "-.--",  "z": "--..",  " ": " ",

  "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....",
  "6": "-....", "7": "--...", "8": "---..", "9": "----.", "0": "-----"
};

var morseToText = {
  ".-"  : "a",  "-...": "b",  "-.-.": "c",  "-..": "d",
  "."   : "e",  "..-.": "f",  "--." : "g",  "....": "h",
  ".."  : "i",  ".---": "j",  "-.-" : "k",  ".-..": "l",
  "--"  : "m",  "-."  : "n",  "---" : "o",  ".--.": "p",
  "--.-": "q",  ".-." : "r",  "..." : "s",  "-": "t",
  "..-" : "u",  "...-": "v",  ".--" : "w",  "-..-": "x",
  "-.--": "y",  "--..": "z",  " "   : " ",

  ".----": "1", "..---": "2", "...--": "3", "....-": "4", ".....": "5",
  "-....": "6", "--...": "7", "---..": "8", "----.": "9", "-----": "0",
};
