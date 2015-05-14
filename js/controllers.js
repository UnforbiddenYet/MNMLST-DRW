'use strict';

/* Controllers */
var canvas, ctx, currentDrawingMethod;
var oldPoint = {};
var drawingMethods = {};
var params = {};


function setUp(){

	canvas = document.getElementsByTagName("canvas")[0];
	ctx = canvas.getContext("2d");

	document.body.addEventListener('touchmove', function(event) {
		event.preventDefault();
	}, false);

	// resize the canvas to fill browser window dynamically
	window.addEventListener('resize', resizeCanvas, false);

	drawingMethods.line = drawLine;
	drawingMethods.arc = drawArc;
	// drawingMethods.pie = drawPie;
	drawingMethods.default = drawLine;

	params.lineWidth = 0.1;
	params.color = {};
	params.color.canvasBackground = "#F6F6F6";
	params.color.line = "#3C3C3C";
}

function resizeCanvas(canvas){
	canvas.width = document.body.clientWidth; //document.width is obsolete
	canvas.height = document.body.clientHeight; //document.height is obsolete
}

function init(){
	resizeCanvas(canvas);

	ctx.beginPath();
	ctx.fillStyle = params.color.canvasBackground;

	//draw background / rect on entire canvas
	ctx.fillRect(0,0,document.body.clientWidth, document.body.clientHeight);
	ctx.fill();
	ctx.stroke();
}

function addListeners(){
	canvas.addEventListener("touchstart", touchStart, false);
	canvas.addEventListener("touchmove", touchMove, false);
	// canvas.addEventListener("touchend", touchEnd, false);

	function getCoordinates(e, el){
		var x = e.offsetX;
		var y = e.offsetY;

		if(x === undefined) {
			var totalOffsetX = 0;
			var totalOffsetY = 0;
			var curElement = el;

			do{
				totalOffsetX += curElement.offsetLeft;
				totalOffsetY += curElement.offsetTop;
			} while(curElement = curElement.offsetParent)
			x = e.pageX - el.offsetLeft;
			y = e.pageY - el.offsetTop;
		}

		return {
			x: x,
			y: y
		}
	}

	function getDrawingMethod(){
		var method = drawingMethods[currentDrawingMethod];
		return method == null ? drawingMethods.default : method;
	}

	function touchStart(evt){
		var touches = evt.changedTouches;

		for (var i=0; i < touches.length; i++) {
			var coords = getCoordinates(touches[i], canvas)
			oldPoint = coords;
			console.log(oldPoint)
			getDrawingMethod()(ctx, coords);
		}
	}

	function touchMove(evt) {;
		var touches = evt.changedTouches;

		for (var i=0; i < touches.length; i++) {
			var coords = getCoordinates(touches[i], canvas)
			getDrawingMethod()(ctx, coords, i);
		}
	}
}

function drawLine(ctx, data){
	ctx.beginPath();
	ctx.moveTo(oldPoint.x, oldPoint.y);
	oldPoint = data;
	ctx.lineTo(data.x, data.y);
	ctx.lineWidth = params.lineWidth;
	ctx.strokeStyle = params.color.line;
	ctx.stroke();
}

function drawArc(ctx, data){
	var radius = data.x - data.y;
	if(radius < 0){
		radius = radius*-1;
	}
	var startAngle = data.x/100 * Math.PI;
	var endAngle = data.y/100 * Math.PI;
	var counterClockwise = false;

	ctx.beginPath();
	oldPoint = data;
	ctx.arc(data.x, data.y, radius, startAngle, endAngle, counterClockwise);
	ctx.lineWidth = params.lineWidth;
	ctx.strokeStyle = params.color.line;
	ctx.stroke();
}

// Converts canvas to an image
function covertToImage () {
	var image = new Image();
	image.src = canvas.toDataURL("image/png");
	return image;
}

MNMLSTApp.controller('XDrawer', ['$scope', function($scope) {

	// canvas
	setUp();
	init();
	addListeners();

	// scope
	$scope.menuHidden = true;

	$scope.drawingMethods = [
		{title: "Line", drawingFunction: "line"},
		{title: "Arc", drawingFunction: "arc"}
	// {title: "Pie", drawingFunction: "pie"}
	];

	$scope.clear = function(){
		$scope.menuHidden = true;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	$scope.setDrawingMethod = function(title){
		$scope.menuHidden = true;
		currentDrawingMethod = title;
	}

	$scope.toImage = function(){
		window.open(canvas.toDataURL("image/png"), "_blank");
	}

}]);
