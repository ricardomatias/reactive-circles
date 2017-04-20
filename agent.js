'use strict';

function Agent(x, y, speed, direction, friction) {
	this._pos = new Vector(x, y);
	this._vel = new Vector(0, 0);
	this._acc = new Vector(0, 0);
	this._grav = new Vector(0, 0);

	this._friction = friction || 1;

	this._vel.setMagnitude(speed);
	this._vel.setAngle(direction);
}

Agent.prototype.gravitateTo = function(x, y, mass) {
	var center = new Vector(x, y),
			grav = new Vector(0, 0),
			dist = this.distanceTo(center);

	var gravity = mass / (dist * dist);

	if (gravity === Infinity) {
		gravity = 0;
	}

	grav.setMagnitude(gravity);
	grav.setAngle(this.angleTo(this._pos, center));

	this._vel.add(grav);
};

Agent.prototype.accelerateTo = function(x, y, force) {
	var target = new Vector(x, y),
			acc = new Vector(0, 0);

	acc.setMagnitude(force);
	acc.setAngle(this.angleTo(target));

	this._vel.add(acc);
};

Agent.prototype.angleTo = function(v2) {
	return atan2(v2.y - this._pos.y, v2.x - this._pos.x);
};

Agent.prototype.distanceTo = function(v2) {
	var dx = v2.x - this._pos.x,
			dy = v2.y - this._pos.y;

	return sqrt(dx * dx + dy * dy);
};

Agent.prototype.getX = function() {
	return this._pos.x;
};

Agent.prototype.getY = function() {
	return this._pos.y;
};

Agent.prototype.accelerate = function(x, y) {
	this._vel.add(new Vector(x, y));
};

Agent.prototype.update = function() {
	this._vel.multiplyBy(this._friction);
	this._vel.add(this._grav);
	this._pos.add(this._vel);
};
