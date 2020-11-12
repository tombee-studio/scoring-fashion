var flag = true;
var isInPeapleFlag = false;
var poseNetFlag = true;
var imageScaleFactor = 1.0;
var outputStride = 16;
var flipHorizontal = false;
var isVideoLoaded = false;
var isAnchorLoaded = false;

function updateList(jsonData) {
    $('#player-score').text(jsonData['score']);
    var i = 0;
    
    console.log(jsonData);
 
    var timer = setInterval(function() {
        var data = jsonData['result'][i];
        var li = $('<li>');
        var wrapper = $('<div>').attr({
            "class": "card-wrapper"
        }).appendTo(li);

        $('<img>').attr({ 
            "class": "card-left parent",
            "src": "data:image/jpeg;base64," + data["base64"]
        }).appendTo(wrapper);
        var cardRight = $('<div>').attr({ "class": "card-right parent" });
        cardRight.appendTo(wrapper);
        cardRight.delay(500).queue(function(){
            $(this).addClass('show');
        });

        $('#result').prepend(li);

        i++;
        if(i == jsonData['result'].length) clearInterval(timer);
    }, 1000);
}

window.onload = function() {

    var tenFlag = 0;
    var posenetInstance = posenet.load();

    const anchor = new Image();
    anchor.src = "/static/img/human_icon.png";
    anchor.onload = function() {
        isAnchorLoaded = true;
    };
    
    const cameraSize = { w: 500, h: 700 };
    const canvasSize = { w: 500, h: 667 };
    const resolution = { w: 500, h: 700 };
    const area = {x: 30, y: 30, w: 440, h:500 }
    let video;
    let media;
    let canvas;
    let canvasCtx;

    video          = document.createElement('video');
    video.id       = 'video';
    video.width    = cameraSize.w;
    video.height   = cameraSize.h;
    video.autoplay = true;
    document.getElementById('videoPreview').appendChild(video);

    media = navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            width: { ideal: resolution.w },
            height: { ideal: resolution.h }
        }
    }).then(function(stream) {
        video.srcObject = stream;
    });

    canvas        = document.createElement('canvas');
    canvas.id     = 'canvas';
    canvas.width  = canvasSize.w;
    canvas.height = canvasSize.h;
    document.getElementById('canvasPreview').appendChild(canvas);

    video.addEventListener('loadeddata', function (_) {
        isVideoLoaded = true;
    });

    canvasCtx = canvas.getContext('2d');
    _canvasUpdate();
    video.addEventListener('loadeddata', function () {
        isVideoLoaded = true;
    });

    var offset = 0;
    function check(pose) {
        f = pose.keypoints.reduce(function(prev, value) {
            let position = value.position;
            return prev + (area.x <= position.x 
                && area.x + area.w >= position.x 
                && area.y <= position.y
                && area.y + area.h >= position.y? 1: 0);
        }, 0);
        return f;
    }

    function _canvasUpdate() {
        if(flag && isAnchorLoaded) {
            canvasCtx.drawImage(video, 0, 0, 500, 667, 0, 0, canvasSize.w, canvasSize.h);

            canvasCtx.beginPath();
            canvasCtx.setLineDash([4, 2]);
            if(tenFlag > 0) {
                canvasCtx.strokeStyle = "rgba(0,0,255,1.0)";
            } else {
                canvasCtx.strokeStyle = "rgba(255,0,0,1.0)";
            }
            canvasCtx.lineDashOffset = -offset;
            canvasCtx.lineWidth = 7;
            canvasCtx.rect(area.x, area.y, area.w, area.h);
            canvasCtx.stroke();

            offset += 0.5;
            if(offset > 16) {
                offset = 0;
            }

            if(poseNetFlag && isVideoLoaded) {
                posenetInstance.then(function(net){
                    poseNetFlag = false;
                    return net.estimateSinglePose(video, imageScaleFactor, flipHorizontal, outputStride)
                }).then(function(pose){
                    poseNetFlag = true;
                    if(check(pose) > 13) {
                        tenFlag++;
                    } else {
                        if(tenFlag > 0) {
                            tenFlag--;
                        }
                    }
                    console.log(tenFlag);
                });
            }

            if(tenFlag >= 100) {
                flag = false;
                $('#player').toggleClass('show');
                var image_data = canvas.toDataURL("image/png");
                image_data = image_data.replace(/^.*,/, '');
                var request = new XMLHttpRequest();
                request.onreadystatechange = function () {
                    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) 
                        updateList(JSON.parse(this.responseText));
                }
                var data = JSON.stringify({ "buffer": image_data });
                request.open('POST', '/score', true);
                request.setRequestHeader( 'Content-Type', 'application/json' );
                request.send(data);
            }
        }
        requestAnimationFrame(_canvasUpdate);
    };
}
