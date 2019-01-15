// shim layer with setTimeout fallback
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

function stop() {
	//window.cancelAnimationFrame(rafID);
	if (capturer) {
		console.log("stopping capture");
		capturer.stop();
		capturer.save();
	}
}

var rafID;
var myOscilloscope = null;
var scopeCanvas = null;
var freqCanvas = null;

var freqdata = {
	min: 999,
	max: -1,
	avg: -1,
	relmin: null,
	relmax: null,
	relavg: null,
	relativity: 30,
	relstamp: null
};

function drawFreqBars(analyser, context) {
  var SPACING = 3;
  var BAR_WIDTH = 1;
  var canvasWidth = 1024;
  var canvasHeight = 256;
  var numBars = Math.round(canvasWidth / SPACING);
  
  var freqByteData = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(freqByteData); 

  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.lineCap = 'round';
  var multiplier = analyser.frequencyBinCount / numBars;

  // Draw rectangle for each frequency bin.
  for (var i = 0; i < numBars; ++i) {
    var magnitude = 0;
    var offset = Math.floor(i * multiplier);
    // gotta sum/average the block, or we miss narrow-bandwidth spikes
    for (var j = 0; j < multiplier; j++) {
    	magnitude += freqByteData[offset + j];
    }
    magnitude = magnitude / multiplier;
    var magnitude2 = freqByteData[i * multiplier];
    context.fillStyle = "hsl(" + Math.round((i*360)/numBars) + ", 100%, 50%)";
    context.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
  }
}

function setupCanvases(container) {
  scopeCanvas = document.createElement('canvas');
  scopeCanvas.width = 512; 
  scopeCanvas.height = 256; 
  scopeCanvas.id = "scope";
  scopeCanvas.myContext = scopeCanvas.getContext('2d');

  if (container)
    container.appendChild(scopeCanvas);
  else
    document.body.appendChild(scopeCanvas);

  freqCanvas = document.createElement('canvas');
  freqCanvas.width = 1024; 
  freqCanvas.height = 256; 
  freqCanvas.id = "freqbars";
  freqCanvas.context = freqCanvas.getContext('2d');

  if (container)
    container.appendChild(freqCanvas);
  else
    document.body.appendChild(freqCanvas);
}

function init3d() {
	var fov = 75, aspect_ratio = 16/9;
	var resolution = {x:1280, y:720};

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(fov, aspect_ratio);
	renderer = new THREE.WebGLRenderer({antialias: true});
	
	renderer.setSize(resolution.x, resolution.y);

	WEBGL.display();

	geometry = new THREE.BoxGeometry(1, 1, 1);
	material = new THREE.MeshLambertMaterial({color: 0x10a315});
	cube = new THREE.Mesh(geometry, material);
	light = new THREE.PointLight(0xFFFF00);
	
	light.position.set(25, 25, 25);

	scene.add(cube);
	scene.add(light);

	cube.position.z = -5;
}

function loop3d(analyser) {
	var freqByteData = new Uint8Array(analyser.frequencyBinCount);
	analyser.getByteFrequencyData(freqByteData);
	
	let currfreq = freqByteData[0];
	
	if (freqdata.min > currfreq) freqdata.min = currfreq;
	if (freqdata.max < currfreq) freqdata.max = currfreq;
	
	if (freqdata.avg == -1) freqdata.avg = currfreq;
	else {freqdata.avg += currfreq; freqdata.avg /= 2;}

	let diff = scale(currfreq, {min:0, max:(freqdata.max+10)}, {min:-0.01, max:0.2});
	
	cube.rotation.x += diff;
	renderer.render(scene, camera);

	log("13 diff: "+diff+", curr: "+currfreq+", max: "+freqdata.max+", min: "+freqdata.min+", avg: "+freqdata.avg);
}

function init() {
	setupCanvases();
	setupAudio(scopeCanvas);
	init3d();
  
	// capturer = new CCapture( { format: 'webm' } );
	// capturer.start();
	
	draw();
}

function draw() {  
	if (myOscilloscope) {
		myOscilloscope.draw(scopeCanvas.myContext);
	
		if (freqCanvas) {
			drawFreqBars(myOscilloscope.analyser, freqCanvas.context);
			loop3d(myOscilloscope.analyser);
		}
	}

	rafID = requestAnimationFrame(draw);
	// WEBGL.render(capturer);
}

function play() {
	if (!audioContext || !audioSource) return;
	
	audioSource.start();
	// audioContext.resume();}
}