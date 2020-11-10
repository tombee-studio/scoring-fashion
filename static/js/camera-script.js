var flag = true;
var isInPeapleFlag = false;
var poseNetFlag = true;
var imageScaleFactor = 1.0;
var outputStride = 16;
var flipHorizontal = false;
var isVideoLoaded = false;
var isAnchorLoaded = false;

window.onload = function() {    // タグ内にjavascriptコードを直接記述します。

    var tenFlag = 0;
    var posenetInstance = posenet.load();

    const anchor = new Image();
    anchor.src = "/static/img/human_icon.png";
    anchor.onload = function() {
        isAnchorLoaded = true;
    };
    
    const cameraSize = { w: 500, h: 700 };//カメラのサイズ
    const canvasSize = { w: 400, h: 560 };
    const resolution = { w: 500, h: 700 };
    const area = {x: 30, y: 30, w: 340, h:500 }
    let video;
    let media;
    let canvas;
    let canvasCtx;

    // video要素をつくる
    video          = document.createElement('video');
    video.id       = 'video';
    video.width    = cameraSize.w;
    video.height   = cameraSize.h;
    video.autoplay = true;
    document.getElementById('videoPreview').appendChild(video);

    // video要素にWebカメラの映像を表示させる
    media = navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            width: { ideal: resolution.w },
            height: { ideal: resolution.h }
        }
    }).then(function(stream) {
        video.srcObject = stream;
    });

    // canvas要素をつくる
    canvas        = document.createElement('canvas');
    canvas.id     = 'canvas';
    canvas.width  = canvasSize.w;
    canvas.height = canvasSize.h;
    document.getElementById('canvasPreview').appendChild(canvas);

    // コンテキストを取得する
    canvasCtx = canvas.getContext('2d');

    // video要素の映像をcanvasに描画する

    _canvasUpdate();
    setTimeout(function() {
        isVideoLoaded = true;
    }, 1000);

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
            canvasCtx.drawImage(video, 0, 0, 500, 700, 0, 0, canvasSize.w, canvasSize.h);

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
            }
        }
        requestAnimationFrame(_canvasUpdate);
    };
}
