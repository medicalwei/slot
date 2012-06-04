WHEEL_HEIGHT = 100

PADDING_H = 20
PADDING_V = 10

FONT = "Ubuntu"
FONT_HEIGHT = WHEEL_HEIGHT-PADDING_V*2
NUMBER_WIDTH = 80

VELOCITY_MAX = 7.5
ACCELERATION_BASE = 0.01
ACCELERATION_RANDOM = 0.01
STOP_DELAY= 200

DUMMY_IMAGES = 2

#
# offset should be relative to wheel height
#

WINDOW_HEIGHT = 768
WINDOW_WIDTH = 1024

mod = (a, b) ->
    r = a % b
    r += b if r < 0
    return r

class Wheel
  constructor: (ctx) ->
    @ctx = ctx
    @position = 0
    @targetPosition = 0
    @velocity = 0
    @acceleration = Math.random() * ACCELERATION_RANDOM + ACCELERATION_BASE
    @rotating = false
    @stopped = false
    @width = PADDING_H
    # tagNames

  drawInner: ->
    number = Math.round @position
    offset = (@position - number) * WHEEL_HEIGHT
    @ctx.save()
    @ctx.translate 0, offset
    @drawTag @tagImageWhite[mod(number, @tagImageWhite.length)]
    @ctx.save()
    @ctx.translate 0, -WHEEL_HEIGHT
    @drawTag @tagImageWhite[mod(number+1, @tagImageWhite.length)]
    @ctx.restore()
    @ctx.save()
    @ctx.translate 0, WHEEL_HEIGHT
    @drawTag @tagImageWhite[mod(number-1, @tagImageWhite.length)]
    @ctx.restore()
    @ctx.restore()

  drawOuter: ->
    number = Math.round @position
    offset = (@position - number) * WHEEL_HEIGHT
    displayTagsCount = Math.ceil(((WINDOW_HEIGHT/WHEEL_HEIGHT)-1)/2)+1
    @ctx.save()
    @ctx.translate 0, offset
    @drawTag @tagImage[mod(number, @tagImageWhite.length)]
    @ctx.save()
    for i in [1..displayTagsCount]
      @ctx.translate 0, -WHEEL_HEIGHT
      @drawTag @tagImage[mod(number+i, @tagImageWhite.length)]
    @ctx.restore()
    @ctx.save()
    for i in [1..displayTagsCount]
      @ctx.translate 0, WHEEL_HEIGHT
      @drawTag @tagImage[mod(number-i, @tagImageWhite.length)]
    @ctx.restore()
    @ctx.restore()

  drawTag: (image) ->
    @ctx.save()
    @ctx.drawImage image, 0, -WHEEL_HEIGHT/2
    @ctx.restore()

  tick: ->
    if @rotating
      @position += @velocity
      @velocity += @acceleration if @velocity <= VELOCITY_MAX
    else
      @position += (@targetPosition - @position) * 1.8 # elastically stopped
      @velocity = 0

    if @stopped and @rotating and Math.round(@position) >= @targetPosition
      @rotating = false
      if @parent
        @parent.childRotateStopped()

  start: ->
    @stopped = false
    @rotating = true

  setTarget: (@targetPosition) ->

  setParent: (@parent) ->

  stop: (@rotating = true) ->
    @targetPosition = (@targetPosition % @tagImage.length) + Math.ceil(@position / @tagImage.length) * @tagImage.length
    @stopped = true

  makeCache: ->
    @tagImage = []
    @tagImageWhite = []
    for key, tagName of @tagNames
      c = document.createElement('canvas');
      c.width = @width
      c.height = WHEEL_HEIGHT
      cctx = c.getContext '2d'
      cctx.save()
      cctx.font = "#{FONT_HEIGHT}px #{FONT}"
      cctx.textBaseline = "middle"
      cctx.textAlign = "left"
      cctx.fillStyle = "#000"
      cctx.fillText tagName, 0, WHEEL_HEIGHT/2
      cctx.restore()
      @tagImage[key] = c

      c = document.createElement('canvas');
      c.width = @width
      c.height = WHEEL_HEIGHT
      cctx = c.getContext '2d'
      cctx.save()
      cctx.font = "#{FONT_HEIGHT}px #{FONT}"
      cctx.textBaseline = "middle"
      cctx.textAlign = "left"
      cctx.fillStyle = "#fff"
      cctx.fillText tagName, 0, WHEEL_HEIGHT/2
      cctx.restore()
      @tagImageWhite[key] = c

class NumberWheel extends Wheel
  constructor: (ctx) ->
    super ctx
    @tagNames = [0..9]
    @ctx.font = "#{FONT_HEIGHT}px sans-serif"
    @width = @ctx.measureText("0").width
    @makeCache()

class AvatarWheel extends Wheel
  constructor: (ctx, @tagImage) ->
    super ctx
    @width += FONT_HEIGHT
    @tagImageWhite = @tagImage


  drawTag: (image) ->
    @ctx.save()
    @ctx.drawImage image, 0, -FONT_HEIGHT/2, FONT_HEIGHT, FONT_HEIGHT
    @ctx.restore()

class TextWheel extends Wheel
  constructor: (ctx, @tagNames, width) ->
    super ctx
    @ctx.font = "#{FONT_HEIGHT}px sans-serif"
    @width += width
    @makeCache()

class WheelGroup
  constructor: (ctx) ->
    @ctx = ctx
    @width = 0
    @wheels = []
    @stopped = true
    @rotating = false

  add: (wheel) ->
    @width += wheel.width
    wheel.setParent this
    @wheels.push wheel

  start: ->
    wheel.start() for wheel in @wheels
    @stopped = false
    @rotating = true
    @stopCount = 0

  tick: ->
    wheel.tick() for wheel in @wheels

  drawInner: ->
    @ctx.save()
    for wheel in @wheels
      wheel.drawInner()
      @ctx.translate wheel.width, 0
    @ctx.restore()

  drawOuter: ->
    @ctx.save()
    for wheel in @wheels
      wheel.drawOuter()
      @ctx.translate wheel.width, 0
    @ctx.restore()

  stop: (@rotating = true)->
    if @rotating
      @wheels[0].stop()
    else
      wheel.stop(false) for wheel in @wheels
    @stopped = true

  setParent: (@parent) ->

  childRotateStopped: ->
    @stopCount += 1
    if @stopCount >= @wheels.length
      @rotating = false
      if @parent
        @parent.childRotateStopped()
    else
      stopWheel = @wheels[@stopCount]
      setTimeout ->
        stopWheel.stop()
      , STOP_DELAY

class NumberWheelGroup extends WheelGroup
  constructor: (ctx, digits) ->
    super ctx

    for i in [1..digits]
      newWheel = new NumberWheel @ctx
      @add newWheel

    @width += PADDING_H

  setTarget: (number) ->
    for i in [@wheels.length-1..0]
      wheel = @wheels[i]
      wheel.setTarget number%10
      number = Math.floor(number / 10)

digits = 0
count = 0
imageLoadCount = 0
lists = []

window.lists = lists

window.loadSlot = (data) ->
  # begin parsing things
  count = data.length
  lists.avatar = []
  lists.id = []
  lists.name = []
  lists.email = []
  for entry, datum of data
    digits = datum.id.length if datum.id.length > digits
    for key, value of datum
      lists[key][entry] = value
    avatar = new Image
    avatar.onload = imageLoaded
    avatar.onerror = imageError
    avatar.src = "http://www.gravatar.com/avatar/#{datum.email}?s=#{FONT_HEIGHT}&d=404"
    lists.avatar[entry] = avatar

imageErrorCount = 0
imageError = ->
  @src = "./dummy/#{imageErrorCount % DUMMY_IMAGES}.png"
  imageErrorCount += 1

imageLoaded = ->
  imageLoadCount += 1
  console.log "avatar loading: #{imageLoadCount}/#{count}"
  if imageLoadCount == count
    allImagesLoaded()

allImagesLoaded = ->
  canvas = document.getElementById("c")
  requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  if not requestAnimationFrame
    requestAnimationFrame = (fn) ->
      setTimeout(fn, 33)

  window.onresize = ->
    WINDOW_WIDTH = canvas.width = window.innerWidth
    WINDOW_HEIGHT = canvas.height = window.innerHeight

  WINDOW_WIDTH = canvas.width = window.innerWidth
  WINDOW_HEIGHT = canvas.height = window.innerHeight


  if canvas.getContext
    ctx = canvas.getContext "2d"
    wheelGroup = new WheelGroup ctx
    numberWheelGroup = new NumberWheelGroup ctx, digits
    avatarWheel = new AvatarWheel ctx, lists.avatar
    textWheel = new TextWheel ctx, lists.name, 1000
    wheelGroup.add numberWheelGroup
    wheelGroup.add avatarWheel
    wheelGroup.add textWheel

    picks = [0..count-1]

    pick = ->
      if picks.length > 0
        choice = Math.floor(Math.random()*picks.length)
        picked = picks[choice]
        picks.splice(choice, 1)
        numberWheelGroup.setTarget parseInt(lists.id[picked])
        avatarWheel.setTarget picked
        textWheel.setTarget picked
      else
        window.alert "All people are selected out"

    pickAndStop = ->
      pick()
      wheelGroup.stop()

    redraw = ->
      wheelGroup.tick()
      ctx.clearRect 0, 0, WINDOW_WIDTH, WINDOW_HEIGHT
      ctx.save()
      ctx.translate 0, WINDOW_HEIGHT/2
      ctx.fillStyle = "rgb(127, 63, 63)"
      ctx.fillRect -5, -WHEEL_HEIGHT/2, WINDOW_WIDTH+10, WHEEL_HEIGHT
      ctx.translate PADDING_H, 0
      ctx.globalCompositeOperation = "source-atop"
      wheelGroup.drawInner()
      ctx.globalCompositeOperation = "destination-over"
      wheelGroup.drawOuter()
      ctx.globalCompositeOperation = "source-over"
      ctx.restore()
      requestAnimationFrame redraw

    delay = 0

    canvas.onclick = ->
      if wheelGroup.stopped and not wheelGroup.rotating
        wheelGroup.start()
        delay = setTimeout pickAndStop, 3000
      else if not wheelGroup.stopped and wheelGroup.rotating
        clearTimeout delay
        pick()
        wheelGroup.stop(false)

    requestAnimationFrame redraw
