(function() {
  var ACCELERATION_BASE, ACCELERATION_RANDOM, AvatarWheel, DUMMY_IMAGES, FONT, FONT_HEIGHT, NUMBER_WIDTH, NumberWheel, NumberWheelGroup, PADDING_H, PADDING_V, STOP_DELAY, TextWheel, VELOCITY_MAX, WHEEL_HEIGHT, WINDOW_HEIGHT, WINDOW_WIDTH, Wheel, WheelGroup, allImagesLoaded, count, digits, imageError, imageErrorCount, imageLoadCount, imageLoaded, lists, mod,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  WHEEL_HEIGHT = 100;

  PADDING_H = 20;

  PADDING_V = 10;

  FONT = "Ubuntu";

  FONT_HEIGHT = WHEEL_HEIGHT - PADDING_V * 2;

  NUMBER_WIDTH = 80;

  VELOCITY_MAX = 7.5;

  ACCELERATION_BASE = 0.01;

  ACCELERATION_RANDOM = 0.01;

  STOP_DELAY = 200;

  DUMMY_IMAGES = 4;

  WINDOW_HEIGHT = 768;

  WINDOW_WIDTH = 1024;

  mod = function(a, b) {
    var r;
    r = a % b;
    if (r < 0) r += b;
    return r;
  };

  Wheel = (function() {

    function Wheel(ctx) {
      this.ctx = ctx;
      this.position = 0;
      this.targetPosition = 0;
      this.velocity = 0;
      this.acceleration = Math.random() * ACCELERATION_RANDOM + ACCELERATION_BASE;
      this.rotating = false;
      this.stopped = false;
      this.width = PADDING_H;
    }

    Wheel.prototype.drawInner = function() {
      var number, offset;
      number = Math.round(this.position);
      offset = (this.position - number) * WHEEL_HEIGHT;
      this.ctx.save();
      this.ctx.translate(0, offset);
      this.drawTag(this.tagImageWhite[mod(number, this.tagImageWhite.length)]);
      this.ctx.save();
      this.ctx.translate(0, -WHEEL_HEIGHT);
      this.drawTag(this.tagImageWhite[mod(number + 1, this.tagImageWhite.length)]);
      this.ctx.restore();
      this.ctx.save();
      this.ctx.translate(0, WHEEL_HEIGHT);
      this.drawTag(this.tagImageWhite[mod(number + 1, this.tagImageWhite.length)]);
      this.ctx.restore();
      return this.ctx.restore();
    };

    Wheel.prototype.drawOuter = function() {
      var displayTagsCount, i, number, offset;
      number = Math.round(this.position);
      offset = (this.position - number) * WHEEL_HEIGHT;
      displayTagsCount = Math.ceil(((WINDOW_HEIGHT / WHEEL_HEIGHT) - 1) / 2) + 1;
      this.ctx.save();
      this.ctx.translate(0, offset);
      this.drawTag(this.tagImage[mod(number, this.tagImageWhite.length)]);
      this.ctx.save();
      for (i = 1; 1 <= displayTagsCount ? i <= displayTagsCount : i >= displayTagsCount; 1 <= displayTagsCount ? i++ : i--) {
        this.ctx.translate(0, -WHEEL_HEIGHT);
        this.drawTag(this.tagImage[mod(number + i, this.tagImageWhite.length)]);
      }
      this.ctx.restore();
      this.ctx.save();
      for (i = 1; 1 <= displayTagsCount ? i <= displayTagsCount : i >= displayTagsCount; 1 <= displayTagsCount ? i++ : i--) {
        this.ctx.translate(0, WHEEL_HEIGHT);
        this.drawTag(this.tagImage[mod(number - i, this.tagImageWhite.length)]);
      }
      this.ctx.restore();
      return this.ctx.restore();
    };

    Wheel.prototype.drawTag = function(image) {
      this.ctx.save();
      this.ctx.drawImage(image, 0, -WHEEL_HEIGHT / 2);
      return this.ctx.restore();
    };

    Wheel.prototype.tick = function() {
      if (this.rotating) {
        this.position += this.velocity;
        if (this.velocity <= VELOCITY_MAX) this.velocity += this.acceleration;
      } else {
        this.position += (this.targetPosition - this.position) * 1.8;
        this.velocity = 0;
      }
      if (this.stopped && this.rotating && Math.round(this.position) >= this.targetPosition) {
        this.rotating = false;
        if (this.parent) return this.parent.childRotateStopped();
      }
    };

    Wheel.prototype.start = function() {
      this.stopped = false;
      return this.rotating = true;
    };

    Wheel.prototype.setTarget = function(targetPosition) {
      this.targetPosition = targetPosition;
    };

    Wheel.prototype.setParent = function(parent) {
      this.parent = parent;
    };

    Wheel.prototype.stop = function(rotating) {
      this.rotating = rotating != null ? rotating : true;
      this.targetPosition = (this.targetPosition % this.tagImage.length) + Math.ceil(this.position / this.tagImage.length) * this.tagImage.length;
      return this.stopped = true;
    };

    Wheel.prototype.makeCache = function() {
      var c, cctx, key, tagName, _ref, _results;
      this.tagImage = [];
      this.tagImageWhite = [];
      _ref = this.tagNames;
      _results = [];
      for (key in _ref) {
        tagName = _ref[key];
        c = document.createElement('canvas');
        c.width = this.width;
        c.height = WHEEL_HEIGHT;
        cctx = c.getContext('2d');
        cctx.save();
        cctx.font = "" + FONT_HEIGHT + "px " + FONT;
        cctx.textBaseline = "middle";
        cctx.textAlign = "left";
        cctx.fillStyle = "#000";
        cctx.fillText(tagName, 0, WHEEL_HEIGHT / 2);
        cctx.restore();
        this.tagImage[key] = c;
        c = document.createElement('canvas');
        c.width = this.width;
        c.height = WHEEL_HEIGHT;
        cctx = c.getContext('2d');
        cctx.save();
        cctx.font = "" + FONT_HEIGHT + "px " + FONT;
        cctx.textBaseline = "middle";
        cctx.textAlign = "left";
        cctx.fillStyle = "#fff";
        cctx.fillText(tagName, 0, WHEEL_HEIGHT / 2);
        cctx.restore();
        _results.push(this.tagImageWhite[key] = c);
      }
      return _results;
    };

    return Wheel;

  })();

  NumberWheel = (function(_super) {

    __extends(NumberWheel, _super);

    function NumberWheel(ctx) {
      NumberWheel.__super__.constructor.call(this, ctx);
      this.tagNames = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      this.ctx.font = "" + FONT_HEIGHT + "px sans-serif";
      this.width = this.ctx.measureText("0").width;
      this.makeCache();
    }

    return NumberWheel;

  })(Wheel);

  AvatarWheel = (function(_super) {

    __extends(AvatarWheel, _super);

    function AvatarWheel(ctx, tagImage) {
      this.tagImage = tagImage;
      AvatarWheel.__super__.constructor.call(this, ctx);
      this.width += FONT_HEIGHT;
      this.tagImageWhite = this.tagImage;
    }

    AvatarWheel.prototype.drawTag = function(image) {
      this.ctx.save();
      this.ctx.drawImage(image, 0, -FONT_HEIGHT / 2, FONT_HEIGHT, FONT_HEIGHT);
      return this.ctx.restore();
    };

    return AvatarWheel;

  })(Wheel);

  TextWheel = (function(_super) {

    __extends(TextWheel, _super);

    function TextWheel(ctx, tagNames, width) {
      this.tagNames = tagNames;
      TextWheel.__super__.constructor.call(this, ctx);
      this.ctx.font = "" + FONT_HEIGHT + "px sans-serif";
      this.width += width;
      this.makeCache();
    }

    return TextWheel;

  })(Wheel);

  WheelGroup = (function() {

    function WheelGroup(ctx) {
      this.ctx = ctx;
      this.width = 0;
      this.wheels = [];
      this.stopped = true;
      this.rotating = false;
    }

    WheelGroup.prototype.add = function(wheel) {
      this.width += wheel.width;
      wheel.setParent(this);
      return this.wheels.push(wheel);
    };

    WheelGroup.prototype.start = function() {
      var wheel, _i, _len, _ref;
      _ref = this.wheels;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        wheel = _ref[_i];
        wheel.start();
      }
      this.stopped = false;
      this.rotating = true;
      return this.stopCount = 0;
    };

    WheelGroup.prototype.tick = function() {
      var wheel, _i, _len, _ref, _results;
      _ref = this.wheels;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        wheel = _ref[_i];
        _results.push(wheel.tick());
      }
      return _results;
    };

    WheelGroup.prototype.drawInner = function() {
      var wheel, _i, _len, _ref;
      this.ctx.save();
      _ref = this.wheels;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        wheel = _ref[_i];
        wheel.drawInner();
        this.ctx.translate(wheel.width, 0);
      }
      return this.ctx.restore();
    };

    WheelGroup.prototype.drawOuter = function() {
      var wheel, _i, _len, _ref;
      this.ctx.save();
      _ref = this.wheels;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        wheel = _ref[_i];
        wheel.drawOuter();
        this.ctx.translate(wheel.width, 0);
      }
      return this.ctx.restore();
    };

    WheelGroup.prototype.stop = function(rotating) {
      var wheel, _i, _len, _ref;
      this.rotating = rotating != null ? rotating : true;
      if (this.rotating) {
        this.wheels[0].stop();
      } else {
        _ref = this.wheels;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          wheel = _ref[_i];
          wheel.stop(false);
        }
      }
      return this.stopped = true;
    };

    WheelGroup.prototype.setParent = function(parent) {
      this.parent = parent;
    };

    WheelGroup.prototype.childRotateStopped = function() {
      var stopWheel;
      this.stopCount += 1;
      if (this.stopCount >= this.wheels.length) {
        this.rotating = false;
        if (this.parent) return this.parent.childRotateStopped();
      } else {
        stopWheel = this.wheels[this.stopCount];
        return setTimeout(function() {
          return stopWheel.stop();
        }, STOP_DELAY);
      }
    };

    return WheelGroup;

  })();

  NumberWheelGroup = (function(_super) {

    __extends(NumberWheelGroup, _super);

    function NumberWheelGroup(ctx, digits) {
      var i, newWheel;
      NumberWheelGroup.__super__.constructor.call(this, ctx);
      for (i = 1; 1 <= digits ? i <= digits : i >= digits; 1 <= digits ? i++ : i--) {
        newWheel = new NumberWheel(this.ctx);
        this.add(newWheel);
      }
      this.width += PADDING_H;
    }

    NumberWheelGroup.prototype.setTarget = function(number) {
      var i, wheel, _ref, _results;
      _results = [];
      for (i = _ref = this.wheels.length - 1; _ref <= 0 ? i <= 0 : i >= 0; _ref <= 0 ? i++ : i--) {
        wheel = this.wheels[i];
        wheel.setTarget(number % 10);
        _results.push(number = Math.floor(number / 10));
      }
      return _results;
    };

    return NumberWheelGroup;

  })(WheelGroup);

  digits = 0;

  count = 0;

  imageLoadCount = 0;

  lists = [];

  window.lists = lists;

  window.loadSlot = function(data) {
    var avatar, datum, entry, key, value, _results;
    count = data.length;
    lists.avatar = [];
    lists.id = [];
    lists.name = [];
    lists.email = [];
    _results = [];
    for (entry in data) {
      datum = data[entry];
      if (datum.id.length > digits) digits = datum.id.length;
      for (key in datum) {
        value = datum[key];
        lists[key][entry] = value;
      }
      avatar = new Image;
      avatar.onload = imageLoaded;
      avatar.onerror = imageError;
      avatar.src = "http://www.gravatar.com/avatar/" + datum.email + "?s=" + FONT_HEIGHT + "&d=404";
      _results.push(lists.avatar[entry] = avatar);
    }
    return _results;
  };

  imageErrorCount = 0;

  imageError = function() {
    this.src = "./dummy/" + (imageErrorCount % DUMMY_IMAGES) + ".png";
    return imageErrorCount += 1;
  };

  imageLoaded = function() {
    imageLoadCount += 1;
    console.log("avatar loading: " + imageLoadCount + "/" + count);
    if (imageLoadCount === count) return allImagesLoaded();
  };

  allImagesLoaded = function() {
    var avatarWheel, canvas, ctx, delay, numberWheelGroup, pick, pickAndStop, picks, redraw, requestAnimationFrame, textWheel, wheelGroup, _i, _ref, _results;
    canvas = document.getElementById("c");
    requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    if (!requestAnimationFrame) {
      requestAnimationFrame = function(fn) {
        return setTimeout(fn, 33);
      };
    }
    window.onresize = function() {
      WINDOW_WIDTH = canvas.width = window.innerWidth;
      return WINDOW_HEIGHT = canvas.height = window.innerHeight;
    };
    WINDOW_WIDTH = canvas.width = window.innerWidth;
    WINDOW_HEIGHT = canvas.height = window.innerHeight;
    if (canvas.getContext) {
      ctx = canvas.getContext("2d");
      wheelGroup = new WheelGroup(ctx);
      numberWheelGroup = new NumberWheelGroup(ctx, digits);
      avatarWheel = new AvatarWheel(ctx, lists.avatar);
      textWheel = new TextWheel(ctx, lists.name, 1000);
      wheelGroup.add(numberWheelGroup);
      wheelGroup.add(avatarWheel);
      wheelGroup.add(textWheel);
      picks = (function() {
        _results = [];
        for (var _i = 0, _ref = count - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this);
      pick = function() {
        var choice, picked;
        if (picks.length > 0) {
          choice = Math.floor(Math.random() * picks.length);
          picked = picks[choice];
          picks.splice(choice, 1);
          numberWheelGroup.setTarget(parseInt(lists.id[picked]));
          avatarWheel.setTarget(picked);
          return textWheel.setTarget(picked);
        } else {
          return window.alert("All people are selected out");
        }
      };
      pickAndStop = function() {
        pick();
        return wheelGroup.stop();
      };
      redraw = function() {
        wheelGroup.tick();
        ctx.clearRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
        ctx.save();
        ctx.translate(0, WINDOW_HEIGHT / 2);
        ctx.fillStyle = "rgb(127, 63, 63)";
        ctx.fillRect(-5, -WHEEL_HEIGHT / 2, WINDOW_WIDTH + 10, WHEEL_HEIGHT);
        ctx.translate(PADDING_H, 0);
        ctx.globalCompositeOperation = "source-atop";
        wheelGroup.drawInner();
        ctx.globalCompositeOperation = "destination-over";
        wheelGroup.drawOuter();
        ctx.globalCompositeOperation = "source-over";
        ctx.restore();
        return requestAnimationFrame(redraw);
      };
      delay = 0;
      canvas.onclick = function() {
        if (wheelGroup.stopped && !wheelGroup.rotating) {
          wheelGroup.start();
          return delay = setTimeout(pickAndStop, 3000);
        } else if (!wheelGroup.stopped && wheelGroup.rotating) {
          clearTimeout(delay);
          pick();
          return wheelGroup.stop(false);
        }
      };
      return requestAnimationFrame(redraw);
    }
  };

}).call(this);
