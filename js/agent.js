'use strict';

function Agent(x, y, speed, direction, forces) {
	this.x = x;
	this.y = y;
	this.vx = Math.cos(direction) * speed;
	this.vy = Math.sin(direction) * speed;
	this._grav = { x: 0, y: 0 };
	this._friction = forces.friction || 1;
	this._springs = [];
	this._gravitations = [];

	if (forces.gravity) {
		this._grav.x = forces.gravity.x;
		this._grav.y = forces.gravity.y;
	}
}

Agent.prototype.accelerate = function(ax, ay) {
	this.vx += ax;
	this.vy += ay;
};

Agent.prototype.accelerateTo = function(x, y, force) {
	var center = { x: x, y: y },
			acc = { x: 0, y: 0 },
			dist = this.getSpeed(center),
			delta = this.deltaTo(center);

	if (delta.x === 0 && delta.y === 0) {
		return;
	}

	acc.x = (delta.x / dist) * force;
	acc.y = (delta.y / dist) * force;

	this.vx += acc.x;
	this.vy += acc.y;
};

Agent.prototype.angleTo = function(v2) {
	return atan2(v2.y - this.y, v2.x - this.x);
};

Agent.prototype.deltaTo = function(v2) {
	return {
		x: v2.x - this.x,
		y: v2.y - this.y
	};
};

Agent.prototype.getSpeed = function(v2) {
	var delta = this.deltaTo(v2);

	return sqrt(delta.x * delta.x + delta.y * delta.y);
};

Agent.prototype.setSpeed = function(speed) {
	var heading = this.getHeading();

	this.vx = Math.cos(heading) * speed;
	this.vy = Math.sin(heading) * speed;
};

Agent.prototype.getHeading = function() {
		return Math.atan2(this.vx, this.vy);
};

Agent.prototype.setHeading = function(heading) {
	var speed = this.getSpeed();

	this.vx = Math.cos(heading) * speed;
	this.vy = Math.sin(heading) * speed;
};

Agent.prototype.gravitateTo = function(x, y, mass) {
	var center = { x: x, y: y },
			grav = { x: 0, y: 0 },
			dist = this.getSpeed(center),
			delta = this.deltaTo(center);

	var gravity = mass / (dist * dist);

	if (gravity === Infinity) {
		gravity = 0;
	}

	grav.x = (delta.x / dist) * gravity;
	grav.y = (delta.y / dist) * gravity;

	this.vx += grav.x;
	this.vy += grav.y;
};


Agent.prototype.addGravitation= function(x, y, mass) {
	this.removeGravitation(p);

	this._gravitations.push({
		x: x,
		y: y,
		mass: mass || 1
	});
};

Agent.prototype.removeGravitation = function() {
	for(var idx = 0; idx < this._gravitations.length; idx += 1) {
		if(x === this._gravitations[idx].x && y === this._gravitations[idx].y) {
			this._gravitations.splice(idx, 1);
			break;
		}
	}
};

Agent.prototype.handleGravitations = function() {
	for (var idx = 0, len = this._gravitations.length; idx < len; idx++) {
		var gravitation = this._gravitations[idx];

		this.gravitateTo(gravitation.x, gravitation.y, gravitation.mass);
	}
};

Agent.prototype.springTo = function(x, y, stiffness, length) {
	var center = { x: x, y: y },
			spring = { x: 0, y: 0 },
			delta = this.deltaTo(center),
			dist = this.getSpeed(),
			springForce = (dist - length || 0) * stiffness;

	if (delta.x === 0 && delta.y === 0) {
		return;
	}

	spring.x = (delta.x / dist) * springForce;
	spring.y = (delta.y / dist) * springForce;

	this.vx += spring.x;
	this.vy += spring.y;
};

Agent.prototype.addSpring = function(x, y, stiffness, length) {
	this.removeSpring(x, y);

	this._springs.push({
		x: x,
		y: y,
		stiffness: stiffness,
		length: length || 0
	});
};

Agent.prototype.removeSpring = function(x, y) {
	for (var idx = 0, len = this._springs.length; idx < len; idx++) {
		if (x === this._springs[idx].x && y === this._springs[idx].y) {
			this._springs.splice(idx, 1);
			break;
		}
	}
};

Agent.prototype.handleSprings = function() {
	for (var idx = 0, len = this._springs.length; idx < len; idx++) {
		var spring = this._springs[idx];

		this.springTo(spring.x, spring.y, spring.stiffness, spring.length);
	}
};

Agent.prototype.update = function() {
	this.handleSprings();
	this.handleGravitations();

	this.vx *= this._friction;
	this.vy *= this._friction;

	this.vx += this._grav.x;
	this.vy += this._grav.y;

	this.x += this.vx;
	this.y += this.vy;
};
