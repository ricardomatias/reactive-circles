'use strict';

/* exported setup draw mouseClicked windowResized */

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

var mic, fft, angle, backgroundColor, fillColor,
		paletteIndex = 0;

var agents = [];

var SAMPLE_AMOUNT = 128;

var presets = new PresetsManager();

function setup() {
	var idx = 0,
	agent;

	createCanvas(windowWidth, windowWidth);

	// SETUP MIC
	mic = new p5.AudioIn();
	mic.start();

	// SETUP FFT ANALYSIS
	fft = new p5.FFT(0.9, SAMPLE_AMOUNT);

	fft.setInput(mic);

	// PRESETS
	presets.select('circles-one');

	presets.defaults('one-group', {
		agentsNumber: SAMPLE_AMOUNT * 0.5,
		speed: 1,
		friction: 0.9,
		micLevelMax: 0.35,
		spectrumWeight: 0.05,
		minForce: 2,
		maxForce: 5
	});

	presets.defaults('energy-layers', {
		agentsNumber: SAMPLE_AMOUNT,
		speed: 1,
		friction: 0.8,
		spectrumWeight: 0.1,
		minForce: 1,
		maxForce: 10
	});

	presets.defaults('circles-one', {
		agentsNumber: SAMPLE_AMOUNT / 2,
		spectrumWeight: 0.6
	});

	presets.defaults('circles-two', {
		agentsNumber: SAMPLE_AMOUNT,
		spectrumWeight: 0.5
	});

	// DEFAULTS
	function setupDefaults(defaults) {
		angle = TWO_PI / defaults.agentsNumber;

		for (idx = 0; idx < defaults.agentsNumber; idx++) {
			agent = new Agent(windowWidth / 2, windowHeight / 2, defaults.speed, angle * idx, defaults.friction);

			agents.push(agent);
		}
	}

	presets.run('one-group', function(defaults) {
		setupDefaults(defaults);
	});

	presets.run('energy-layers', function(defaults) {
		for (var i = 0; i < 5; i++) {
			setupDefaults(defaults);
		}
	});

	presets.run([ 'circles-one', 'circles-two' ], function(defaults) {
		angle = TWO_PI / defaults.agentsNumber;
	});


	setNewColorScheme();
}

function draw() {
	var spectrum = fft.analyze();

	noStroke();
	background(backgroundColor);
	fill(fillColor);

	presets.run('energy-layers', function(defaults) {
		var energyTypes = [ 'bass', 'lowMid', 'mid', 'highMid', 'treble' ];

		for (var i = 1; i <= 5; i++) {
			var energy = fft.getEnergy(energyTypes[i - 1]);

			for (var idx = 0; idx < SAMPLE_AMOUNT; idx++) {
				drawElement(idx, energy, spectrum[idx], defaults.spectrumWeight, i * 300);
			}
		}
	});

	presets.run('one-group', function(defaults) {
		var micLevel = mic.getLevel(),
		energy = map(micLevel, 0, defaults.micLevelMax, 0, 255);

		for (var idx = 16; idx < 80; idx++) {
			drawElement(idx - 16, energy, spectrum[idx - 16], defaults.spectrumWeight, 400);
		}
	});

	presets.run('circles-one', function(defaults) {
		var energyTypes = [ 'bass', 'lowMid', 'mid', 'highMid', 'treble' ];

		for (var j = 32; j < 96; j++) {
			for (var i = 0; i < 32; i++) {
				drawElement(j, fft.getEnergy(energyTypes[i % 5]), spectrum[j], defaults.spectrumWeight, 20 * i);
			}
		}
	});

	presets.run('circles-two', function(defaults) {
		var energyTypes = [ 'bass', 'lowMid', 'mid', 'highMid', 'treble' ];

		for (var j = 0; j < 12; j++) {
			for (var idx = 0; idx < SAMPLE_AMOUNT; idx++) {
				drawElement(idx, fft.getEnergy(energyTypes[j % 4]), spectrum[floor(idx % (SAMPLE_AMOUNT / (j + 1)))], defaults.spectrumWeight, 50 * j);
			}
		}
	});
}

function mouseClicked() {
	setNewColorScheme();
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}

function setNewColorScheme() {
	backgroundColor = toRgb(colorsPalette[paletteIndex][0], 60);
	fillColor = toRgb(colorsPalette[paletteIndex][1], 80);

	paletteIndex++;

	if (paletteIndex > colorsPalette.length - 1) {
		paletteIndex = 0;
	}
}

function drawElement(idx, energy, spectrum, spectrumWeight, distance) {
	var agent = agents[idx],
	halfWidth = windowWidth / 2,
	halfHeight = windowHeight / 2,
	center = new Vector(halfWidth, halfHeight),
	offset, x, y;

	offset = map(energy + spectrumWeight * spectrum, 0, 255 + spectrumWeight * 255, 0, distance);

	x = halfWidth + offset * cos(angle * idx);
	y = halfHeight + offset * sin(angle * idx);

	presets.run([ 'one-group', 'energy-layers' ], function(defaults) {
		var distCenter = agent.distanceTo(center);

		var size = map(distCenter, 0, distance, 5, distance / 5);

		agent.accelerateTo(x, y, map(offset, 0, distance, defaults.minForce, defaults.maxForce));

		agent.update();

		ellipse(agent.getX(), agent.getY(), size);
	});

	presets.run([ 'circles-one', 'circles-two' ], function() {
		var dx = (halfWidth) - x,
		dy = (halfHeight) - y;

		var distCenter = sqrt(dx * dx + dy * dy);

		var size = map(distCenter, 0, distance, 5, distance / 8);

		ellipse(x, y, size);
	});
}
