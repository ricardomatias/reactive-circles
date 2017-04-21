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

var PRESET_1 = 'birds';

var presets = new PresetsManager();

function setup() {
	var idx = 0,
	agent;

	createCanvas(windowWidth, windowHeight);
	// SETUP MIC
	mic = new p5.AudioIn();
	mic.start();

	// SETUP FFT ANALYSIS
	fft = new p5.FFT(0.9, SAMPLE_AMOUNT);

	fft.setInput(mic);

	// PRESETS
	presets.register(PRESET_1, {
		agentsNumber: SAMPLE_AMOUNT * 0.5,
		speed: 100,
		friction: 0.9,
		micLevelMax: 0.35,
		spectrumWeight: 0.05,
		minForce: 2,
		maxForce: 5
	});

	// presets.register('energy-layers', {
	// 	agentsNumber: SAMPLE_AMOUNT,
	// 	speed: 1,
	// 	friction: 0.8,
	// 	spectrumWeight: 0.1,
	// 	minForce: 1,
	// 	maxForce: 10
	// });

	presets.register('circles-one', {
		agentsNumber: SAMPLE_AMOUNT / 2,
		spectrumWeight: 0.8
	});

	// presets.register('circles-two', {
	// 	agentsNumber: SAMPLE_AMOUNT,
	// 	spectrumWeight: 0.5
	// });

	// DEFAULTS
	function setupDefaults(defaults) {
		angle = TWO_PI / defaults.agentsNumber;

		for (idx = 0; idx < defaults.agentsNumber; idx++) {
			agent = new Agent(windowWidth / 2, windowHeight / 2, defaults.speed, angle * idx, { friction: defaults.friction });

			agents.push(agent);
		}
	}

	presets.setup(PRESET_1, function(defaults) {
		agents = [];

		setupDefaults(defaults);
	});

	presets.setup('energy-layers', function(defaults) {
		agents = [];

		for (var i = 0; i < 5; i++) {
			setupDefaults(defaults);
		}
	});

	presets.setup([ 'circles-one', 'circles-two' ], function(defaults) {
		angle = TWO_PI / defaults.agentsNumber;
	});

	presets.select(PRESET_1);


	setNewColorScheme();

	// SHORTCUTS
	registerShortcuts([{
			key: 'w',
			action: function() {
				redraw();

				presets.selectPrevious();
			}
		},
		{
			key: 's',
			action: function() {
				redraw();

				presets.selectNext();
			}
		},
		{
			key: 'h',
			action: function() {
				toggleHide();
			}
		},
		{
			key: 'Space',
			action: function() {
				setNewColorScheme();
			}
		},
		{
			key: 'Enter',
			action: function() {
				takeScreenshot(presets.getActiveName());
			}
	}]);
}

function draw() {
	var spectrum = fft.analyze();

	noStroke();
	background(backgroundColor);
	fill(fillColor);

	presets.draw('energy-layers', function(defaults) {
		var energyTypes = [ 'bass', 'lowMid', 'mid', 'highMid', 'treble' ];

		for (var i = 1; i <= 5; i++) {
			var energy = fft.getEnergy(energyTypes[i - 1]);

			for (var idx = 0; idx < SAMPLE_AMOUNT; idx++) {
				drawElement(idx, energy, spectrum[idx], defaults.spectrumWeight, i * 300);
			}
		}
	});

	presets.draw(PRESET_1, function(defaults) {
		var micLevel = mic.getLevel(),
		energy = map(micLevel, 0, defaults.micLevelMax, 0, 255);

		for (var idx = 16; idx < 80; idx++) {
			drawElement(idx - 16, energy, spectrum[idx - 16], defaults.spectrumWeight, 400);
		}
	});

	presets.draw('circles-one', function(defaults) {
		var energyTypes = [ 'bass', 'mid', 'highMid', 'treble' ];

		for (var j = 32; j < 96; j++) {
			for (var i = 0; i < 32; i++) {
				drawElement(j, fft.getEnergy(energyTypes[i % 4]), spectrum[j], defaults.spectrumWeight, 30 * i);
			}
		}
	});

	presets.draw('circles-two', function(defaults) {
		var energyTypes = [ 'bass', 'lowMid', 'mid', 'highMid', 'treble' ];

		for (var j = 0; j < 12; j++) {
			for (var idx = 0; idx < SAMPLE_AMOUNT; idx++) {
				drawElement(idx, fft.getEnergy(energyTypes[j % 4]), spectrum[floor(idx % (SAMPLE_AMOUNT / (j + 1)))], defaults.spectrumWeight, 50 * j);
			}
		}
	});
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
			center = { x: halfWidth, y: halfHeight },
			offset, x, y;

	offset = map(energy + spectrumWeight * spectrum, 0, 255 + spectrumWeight * 255, 0, distance);

	x = halfWidth + offset * cos(angle * idx);
	y = halfHeight + offset * sin(angle * idx);

	presets.draw([ PRESET_1, 'energy-layers' ], function(defaults) {
		var distCenter = agent.getSpeed(center);

		var size = map(distCenter, 0, distance, 5, distance / 5);

		agent.accelerateTo(x, y, map(offset, 0, distance, defaults.minForce, defaults.maxForce));

		agent.update();

		ellipse(agent.x, agent.y, size);
	});

	presets.draw([ 'circles-one', 'circles-two' ], function() {
		var dx = (halfWidth) - x,
				dy = (halfHeight) - y;

		var distCenter = sqrt(dx * dx + dy * dy);

		var size = map(distCenter, 0, distance, 1, distance / 8);

		ellipse(x, y, size);
	});
}
