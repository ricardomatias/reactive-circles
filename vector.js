'use strict';

function Vector(x, y) {
  this.x = x;
  this.y = y;
}

Vector.prototype.add = function(v2) {
  this.x += v2.x;
  this.y += v2.y;
};

Vector.prototype.sub = function(v2) {
  this.x -= v2.x;
  this.y -= v2.y;
};

Vector.prototype.multiplyBy = function(value) {
  this.x *= value;
  this.y *= value;
};

Vector.prototype.getMagnitude = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};

Vector.prototype.setMagnitude = function(length) {
  var angle = this.getAngle();

  this.x = Math.cos(angle) * length;
  this.y = Math.sin(angle) * length;
};

Vector.prototype.getAngle = function() {
  return Math.atan2(this.y, this.x);
};

Vector.prototype.setAngle = function(angle) {
  var length = this.getMagnitude();

  this.x = Math.cos(angle) * length;
  this.y = Math.sin(angle) * length;
};
