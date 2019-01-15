function get(id) {
	return document.getElementById(id);
}

function val(id) {
	let e = get(id);
	return e.innerHTML || e.value;
}

function query(selector) {
	return document.querySelector(selector);
}

function queryAll(selector) {
	return document.querySelectorAll(selector);
}