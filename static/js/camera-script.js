var flag = true;
var isInPeapleFlag = false;
var poseNetFlag = true;
var imageScaleFactor = 1.0;
var outputStride = 16;
var flipHorizontal = false;
var isVideoLoaded = false;
var isAnchorLoaded = false;

function updateList(jsonData) {
    $('#player-score').html('<h1>' + jsonData['score'] + '</h1>');
    $('#plusyou').fadeIn("slow");
    
    function updateResult(jsonData) {
        var position = $('#plusyou').offset().top;
        
        var i = 0;

        var result = jsonData['result'].sort(function(first, second) {
            return Number(first['score']) - Number(second['score']);
        });
        
        var timer = setInterval(function() {
            var data = result[i];
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
            var score = $('<div class="socre child circle"><h1>' + data['score'] + '</h1></div>').appendTo(cardRight);
            $("html, body").animate({scrollTop: position}, 400, "swing");

            $('#more').prepend(li);

            i++;
            if(i == jsonData['result'].length) clearInterval(timer);
        }, 1000);
    }
    setTimeout(function() {
        updateResult(jsonData);
    }, 1000);
}

window.onload = function() {
    
    $('#gender').on('click', function(ev) {
        if(gender == 'mens') {
            gender = 'womens';
        } else {
            gender = 'mens';
        }
        $(this).toggleClass('mens');
        $(this).toggleClass('womens');
        $(this).text(gender.toUpperCase());
    });

    var tenFlag = 0;
    var posenetInstance = posenet.load();

    const anchor = new Image();
    anchor.src = "/static/img/human_icon.png";
    anchor.onload = function() {
        isAnchorLoaded = true;
    };
    
    const cameraSize = { w: 500, h: 667 };
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
    document.getElementById('canvasPreview').prepend(canvas);

    video.addEventListener('loadeddata', function (_) {
        isVideoLoaded = true;
        _canvasUpdate();
    });

    canvasCtx = canvas.getContext('2d');
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
        const MAX_WIDTH = 30;
        const start = 'Please don\'t move';
        const middle = 'A little more...';
        const ALERT = 'Be inside the area';
        
        if(flag && isAnchorLoaded) {
            var fontSize = 24;
            canvasCtx.drawImage(video, 0, 0, 500, 667, 0, 0, canvasSize.w, canvasSize.h);
            var image_data = canvas.toDataURL("image/png");
            if(MAX_WIDTH > tenFlag) {
                canvasCtx.beginPath();
                canvasCtx.setLineDash([4, 2]);
                if(tenFlag > 0 && tenFlag < MAX_WIDTH - 20) {
                    canvasCtx.strokeStyle = "rgba(200,200,255,1.0)";
                    var textWidth = canvasCtx.measureText(start).width;
                    canvasCtx.fillText(start, 250 - textWidth / 2, 333 - 12);
                } else if(tenFlag >= MAX_WIDTH - 20) {
                    canvasCtx.strokeStyle = "rgba(100,100,255,1.0)";
                    var textWidth = canvasCtx.measureText(middle).width;
                    canvasCtx.fillText(middle, 250 - textWidth / 2, 333 - 12);
                } else {
                    canvasCtx.font = "bold " + fontSize + "px Arial, meiryo, sans-serif" ;
                    canvasCtx.strokeStyle = "rgba(255,200,200,1.0)";
                    var textWidth = canvasCtx.measureText(ALERT).width;
                    canvasCtx.fillText(ALERT, 250 - textWidth / 2, 333 - 12);
                }
                canvasCtx.stroke();

                canvasCtx.beginPath();
                canvasCtx.strokeStyle = "rgba(255,255,255,1.0)";
                canvasCtx.fillStyle = "rgba(255,255,255,1.0)";
                canvasCtx.lineWidth = 1;
                canvasCtx.setLineDash([]);
                canvasCtx.fillRect(100, 330, 300 * tenFlag / MAX_WIDTH, 10);
                canvasCtx.fill();

                if(tenFlag < MAX_WIDTH) {
                    canvasCtx.lineDashOffset = -offset;
                    canvasCtx.lineWidth = 7;
                    canvasCtx.rect(area.x, area.y, area.w, area.h);
                    canvasCtx.stroke();
                }

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
            } else {
                flag = false;
                $('#player').toggleClass('show');
                image_data = image_data.replace(/^.*,/, '');
                var request = new XMLHttpRequest();
                request.onreadystatechange = function () {
                    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) 
                        updateList(JSON.parse(this.responseText));
                }
                var data = JSON.stringify({ "buffer": image_data, "gender": gender });
                request.open('POST', '/score', true);
                request.setRequestHeader( 'Content-Type', 'application/json' );
                request.send(data);
            }
        }
        requestAnimationFrame(_canvasUpdate);
    };
}
