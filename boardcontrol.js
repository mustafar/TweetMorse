var that= this,
    lastTime = null,
    timeThreshold = null,
    isListening = false,
    button = null,
    buttonPushToMakeMode = null,
    led = null,
    msg = null;

that.init = function (button, led) {
  that.button = button;
  that.led = led;

  // read params from nconf
  var NConf = require('nconf');
  NConf.use ('file', {file: 'config.json' });
  NConf.load ();
  that.timeThreshold = NConf.get("dot-dash-time-threshold") || 500;
  that.buttonPushToMakeMode = NConf.get("button-push-to-make");
};

that.listen = function () {
  that.isListening = true;
  that.msg = '';

  var downEventName = 'down',
      upEventName= 'up';
  if (!that.buttonPushToMakeMode) {
    upEventName = 'down';
    downEventName = 'up';
  }
  that.button.on(upEventName, this.recordUp);
  that.button.on(downEventName, this.recordDown);
};

that.ignore = function() {
  that.isListening = false;
};
that.unignore = function() {
  that.isListening = true;
};

that.recordUp = function() {
  if (!that.isListening) {
    that.log("Waiting...");
    return;
  }
  console.log("Button Up.");
  var time = that.timeNow();
  if (that.lastTime != null) {
    var pushLength = that.timeDiff(that.lastTime, time);
    // it's a dot
    if (pushLength <= that.timeThreshold) {
      that.msg += '.';
    // it's a dash
    } else {
      that.msg += '-';
    }
    console.log(pushLength);
  }
  that.lastTime = time;
};

that.recordDown = function() {
  if (!that.isListening) {
    that.log("Waiting...");
    return;
  }
  console.log("Button Down.");
  var time = that.timeNow();
  if (that.lastTime != null) {
    var silenceLength = that.timeDiff(that.lastTime, time); 
    // it's a space
    if (silenceLength <= 3 * that.timeThreshold) {
      that.msg += ' ';
    // it's the end of the message
    } else {
      that.sendMessage();
    }
    console.log(silenceLength);
  }
  that.lastTime = time;
};

that.sendMessage = function() {
  console.log("Sending...");
  var $ = require ('jquery'),
      url = "http://localhost:2345/send?msg=" + encodeURI(that.msg);
  that.ignore();
  $.getJSON (url, function (response){
    var status = response.status == 'OK';
    console.log(status);
    that.unignore();
  });
};

that.log = function(msg) {
  console.log(msg);
};

that.timeNow = function() {
  return new Date().getTime();
};

that.timeDiff = function(start, end) {
  return (end - start);
}


// expose stuff
module.exports.init = that.init;
module.exports.listen = that.listen;
