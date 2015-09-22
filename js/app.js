navigator.getUserMedia = navigator.getUserMedia ||
	navigator.webkitGetUserMedia ||
	navigator.mozGetUserMedia ||
	navigator.msGetUserMedia;
window.requestAnimationFrame = window.requestAnimationFrame  ||
  window.webkitRequestAnimationFrame;
window.AudioContext = AudioContext ||
	window.webkitAudioContext;

var canvas = null;
var canvasContext = null;
var canvasDrawHandle = null;
var audioContext = null;
var audioSource = null;
var audioStream = null;
var audioAnalyser = null;
var audioBuffer = null;
var audioBufferLength = 0;
var scopeType = null;

function setupAudio (stream) {
	audioStream = stream;

	audioContext = new window.AudioContext();
	console.log('Sample rate: ' + audioContext.sampleRate);

	audioSource = audioContext.createMediaStreamSource(audioStream);

	audioAnalyser = audioContext.createAnalyser();
	audioAnalyser.fftSize = 2048;
	// audioAnalyser.minDecibels = -90;
	// audioAnalyser.maxDecibels = -10;
	// audioAnalyser.smoothingTimeConstant = 0.85;

	audioBuffer = new Uint8Array(audioAnalyser.fftSize);
	audioBufferLength = audioBuffer.length;

	audioSource.connect(audioAnalyser);
}

function draw() {
	canvasDrawHandle = requestAnimationFrame(draw);

	if (!audioAnalyser || !audioBuffer) {
		console.log('Attempting draw before audio is ready');
		return;
	}

	audioAnalyser.getByteTimeDomainData(audioBuffer);
	console.log(audioBuffer.length);

  console.log('Drawing stuff - ' + scopeType);
  var y0 = canvas.height / 2;
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  canvasContext.lineWidth = 1;

	switch (scopeType) {
		case 'standard':
			canvasContext.strokeStyle = '#6aa';
			canvasContext.beginPath();
			canvasContext.moveTo(0, y0);

			for(var i = 0; i < audioBufferLength; i++) {
				canvasContext.lineTo(i, y0+audioBuffer[i]);
      }

      canvasContext.stroke();
			break;
		case 'freeze':
			break;
		case 'folded':
			break;
	}
  canvas.strokeStyle = "#0088ff";
  canvas.lineWidth = 1;  
}

function doStandard () {
	window.cancelAnimationFrame(canvasDrawHandle);
	scopeType = 'standard';
	draw();
}

function doFreeze () {
	window.cancelAnimationFrame(canvasDrawHandle);
	scopeType = 'freeze';
	draw();
}

function doFolded () {
	window.cancelAnimationFrame(canvasDrawHandle);
	scopeType = 'folded';
	draw();
}

window.onload = function() {
  // Set up canvas
  canvas = document.querySelector('.visualizer');
  // TODO Check canvas exists
	canvasContext = canvas.getContext("2d");


	// Set up audio
	if (navigator.getUserMedia) {
		console.log('getUserMedia exists');
		navigator.getUserMedia (
      // constraints - only audio needed for this app
      {
         audio: true
      },

      // Success callback
      function(stream) {
      	console.log('stream initialised');
      	setupAudio(stream);
      },

      // Error callback
      function(err) {
         console.log('The following gUM error occured: ' + err);
      }
    );
	} else {
		console.log('getUserMedia not supported on your browser!');
	}

  draw();
}