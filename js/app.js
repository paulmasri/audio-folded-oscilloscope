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

	audioBuffer = new Uint8Array(audioAnalyser.fftSize);
	audioBufferLength = Math.min(audioBuffer.length, canvas.width); // TEMP
	
	audioSource.connect(audioAnalyser);
}

function draw() {
	canvasDrawHandle = requestAnimationFrame(draw);

	if (!audioAnalyser || !audioBuffer) {
		console.log('Attempting draw before audio is ready');
		return;
	}

	audioAnalyser.getByteTimeDomainData(audioBuffer);
	
  var x0 = canvas.width / 2;
  var y0 = canvas.height / 2;
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  canvasContext.lineWidth = 1;

	switch (scopeType) {
		case 'standard':
			canvasContext.strokeStyle = '#399';
			canvasContext.beginPath();
			canvasContext.moveTo(0, y0);

			for(var i = 0; i < audioBufferLength; i++) {
				canvasContext.lineTo(i, y0-audioBuffer[i]+128);
      }

      canvasContext.stroke();
			break;
		
		case 'folded':
			var offset = 30;
			canvasContext.strokeStyle = '#399';
			canvasContext.beginPath();
			canvasContext.moveTo(x0 + audioBuffer[0] - 128, y0 - audioBuffer[offset] + 128);

			for(var i = 1; i < audioBufferLength-offset; i++) {
				canvasContext.lineTo(x0 + audioBuffer[i] - 128, y0 - audioBuffer[i+offset] + 128);
      }

      canvasContext.stroke();
			break;
	} 
}

function doStandard () {
	window.cancelAnimationFrame(canvasDrawHandle);
	scopeType = 'standard';
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
  canvas.setAttribute('width',600);
  canvas.setAttribute('height',600);
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