// Setting screen size for mobile and computers
var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (isMobile) {
    $('#paint').css({'width': '60%'});
    $('#number').css({'width': '30%', 'font-size': '240px'});
} else {
    $('#paint').css({'width': '313px'});
    $('#number').css({'width': '150px', 'font-size': '120px'});
}

var cw = $('#paint').width();
$('#paint').css({'height': cw + 'px'});
cw = $('#number').width();
$('#number').css({'height': cw + 'px'});

var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');

var compuetedStyle = getComputedStyle(document.getElementById('paint'));
canvas.width = parseInt(compuetedStyle.getPropertyValue('width'));
canvas.height = parseInt(compuetedStyle.getPropertyValue('height'));

var mouse = {x: 0, y: 0};

canvas.addEventListener('mousemove', function(e) {
    mouse.x = e.pageX - this.offsetLeft;
    mouse.y = e.pageY - this.offsetTop;
}, false);

context.lineWidth = isMobile ? 60 : 25;
context.lineJoin = 'round';
context.lineCap = 'round';
context.strokeStyle = '#0000FF';

canvas.addEventListener('mousedown', function(e) {
context.moveTo(mouse.x, mouse.y);
context.beginPath();
canvas.addEventListener('mousemove', onPaint, false);
}, false);

canvas.addEventListener('mouseup', function() {
$('#number').html('<img id="spinner" src="spinner.gif"/>');
canvas.removeEventListener('mousemove', onPaint, false);
var img = new Image();
img.onload = function() {
    context.drawImage(img, 0, 0, 28, 28);
    data = context.getImageData(0, 0, 28, 28).data;
    var input = [];
    for(var i = 0; i < data.length; i += 4) {
        input.push(data[i + 2] / 255);
    }
    predict(input);
    };
    img.src = canvas.toDataURL('image/png');
    }, false);

var onPaint = function() {
context.lineTo(mouse.x, mouse.y);
context.stroke();
};

// Loading Models
tf.loadLayersModel('./model/model.json').then(function(model) {
    window.model = model;
});

canvas.addEventListener('touchstart', function (e) {
    var touch = e.touches[0];
    canvas.dispatchEvent(new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    }));
}, false);

canvas.addEventListener('touchend', function (e) {
canvas.dispatchEvent(new MouseEvent('mouseup', {}));
}, false);

canvas.addEventListener('touchmove', function (e) {
var touch = e.touches[0];
canvas.dispatchEvent(new MouseEvent('mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY
}));
}, false);

var predict = function(input) {
if (window.model) {
    window.model.predict([tf.tensor(input).reshape([1, 28, 28, 1])]).array().then(function(scores){
    scores = scores[0];
    predicted = scores.indexOf(Math.max(...scores));
    $('#number').html(predicted);
    });
} else {
    // The model takes a bit to load, if we are too fast, wait
    setTimeout(function(){predict(input)}, 50);
}
}

$('#clear').click(function(){
    context.clearRect(0, 0, canvas.width, canvas.height);
    $('#number').html('');
});