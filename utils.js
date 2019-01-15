// log interval in seconds
var LAST_LOG = 0;
var LOG_INTERVAL = 1000;

function get(id) {
	return document.getElementById(id);
}

function val(id) {
	let e = get(id);
	return e.innerHTML || e.value;
}

function float(id) {
	return parseFloat(val(id));
}

function int(id) {
	return parseInt(val(id));
}

function query(selector) {
	return document.querySelector(selector);
}

function queryAll(selector) {
	return document.querySelectorAll(selector);
}

/**
 * console.log(scale(5, 0, 10, -50, 50)); // 0
 * console.log(scale(5, -20, 0, -100, 100)); // 150
 */
const scale = (num, input, out) => {
	return (num - input.min) * (out.max - out.min) / (input.max - input.min) + out.min;
}

function now() {
	return new Date().getTime();
}

// logs at most every LOG_INTERVAL
function log() {
	let n = now();
	if (n - LAST_LOG > LOG_INTERVAL) {
		console.log(arguments);
		LAST_LOG = n;
	}
}