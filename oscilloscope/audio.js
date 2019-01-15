var audioContext = null;
var audioSource = null;

function setupAudio( obj ) {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	audioContext = new AudioContext();
	audioSource = audioContext.createBufferSource();

	obj.analyser = audioContext.createAnalyser();
	obj.analyser.fftSize = 2048;

	myOscilloscope = new Oscilloscope(obj.analyser, 512, 256);

	// fetch the file from the server and return a response object to the next .then()
	fetch("../bin/sample.wav")
    .then(response => response.arrayBuffer())
    .then(buffer => {
    	console.log("decoding audio data...");
        // decode the ArrayBuffer as an AudioBuffer
        audioContext.decodeAudioData(buffer, decoded => {
            // store  the resulting AudioBuffer
            audioSource.buffer = decoded;
            
            audioSource.connect(audioContext.destination);
            audioSource.connect(obj.analyser);
            audioSource.start();
            console.log("wav sample loaded");
        });
    });
}