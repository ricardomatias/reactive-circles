'use strict';

var colorsPalette = [
	[ '#152B3C', '#E32D40' ],
	[ '#11644D', '#F2C94E' ],
	[ '#C02942', '#ECD078' ],
	[ '#FAFCD9', '#FC4416' ]
];

function toRgb(hex, alpha) {
	var clr = [ hex[1] + hex[2], hex[3] + hex[4], hex[5] + hex[6] ];

	return color.apply(p5, unhex(clr).concat(alpha));
}

/**
 * 50 circles
 *
 * @method setup
 *
 * @return {[type]} [description]
 */

var mic, fft, angle, backgroundColor, fillColor,
		paletteIndex = 0;

function setup() {
	createCanvas(windowWidth, windowWidth);

	background('#C02942');

	// SETUP MIC
	mic = new p5.AudioIn();
	mic.start();

	// SETUP FFT ANALYSIS
	fft = new p5.FFT(0.8, 128);

	fft.setInput(mic);

	// DEFAULTS
	angle = TWO_PI / 64;

	setNewColorScheme();
}

function draw() {
	var micLevel = mic.getLevel();
	var spectrum = fft.analyze();

	noStroke();
	background(backgroundColor);
	fill(fillColor);

	var energyTypes = [ 'bass', 'mid', 'highMid', 'treble' ];

	// var energy = fft.getEnergy('lowMid'),
	var energy = map(micLevel, 0, 0.35, 0, 255),
			spectrumWeight = 0.8;

	for (var j = 32; j < 96; j++) {
		for (var i = 0; i < 30; i++) {
			drawCircle(j, fft.getEnergy(energyTypes[i % 4]), spectrum, spectrumWeight, 30 * i);
		}
	}
}

function mouseClicked() {
	setNewColorScheme();
}

function setNewColorScheme() {
	backgroundColor = toRgb(colorsPalette[paletteIndex][0], 40);
	fillColor = toRgb(colorsPalette[paletteIndex][1], 80);

	paletteIndex++;

	if (paletteIndex > colorsPalette.length - 1) {
		paletteIndex = 0;
	}
}

function drawCircle(idx, energy, spectrum, spectrumWeight, distance) {
	var halfWidth = windowWidth / 2,
			halfHeight = windowHeight / 2;

	var offset = map(energy + spectrumWeight * spectrum[idx], 0, 255 + spectrumWeight * 255, 0, distance);

	var x = halfWidth + offset * cos(angle * idx),
			y = halfHeight + offset * sin(angle * idx);

	var dx = (halfWidth) - x,
			dy = (halfHeight) - y;

	var distCenter = sqrt(dx * dx + dy * dy);

	var size = map(distCenter, 0, distance, 1, distance / 8);

	ellipse(x, y, size);
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
