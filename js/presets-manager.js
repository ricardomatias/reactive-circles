'use strict';

function PresetsManager() {
  this._active = null;
  this._defaults = {};
  this._presets = [];
  this._setups = {};
}

PresetsManager.prototype._runSetup = function() {
  var preset = this._active,
      defaults = this._defaults[preset];

  if (this._setups[preset]) {
    this._setups[preset](defaults);
  }
};

PresetsManager.prototype.getActiveName = function() {
  return this._active;
};

PresetsManager.prototype.register = function(name, defaults) {
  this._presets.push(name);

  this._defaults[name] = defaults;
};

PresetsManager.prototype.selectNext = function() {
  var presets = this._presets;

  var curr = presets.indexOf(this._active),
      index = curr + 1;

  if (index > presets.length - 1) {
    index = 0;
  }

  this.select(presets[index]);

  this._runSetup();
};

PresetsManager.prototype.selectPrevious = function() {
  var presets = this._presets;

  var curr = presets.indexOf(this._active),
      index = curr - 1;

  if (index < 0) {
    index = presets.length - 1;
  }

  this.select(presets[index]);

  this._runSetup();
};

PresetsManager.prototype.select = function(name) {
  this._active = name;

  this._runSetup();

  /* eslint "no-console": 0 */
  console.log('RUNNING PRESET: ' + name);
};

PresetsManager.prototype.setup = function(presets, fn) {
  var self = this;

  if (!Array.isArray(presets)) {
    presets = [ presets ];
  }

  presets.forEach(function(preset) {
    self._setups[preset] = fn;
  });
};

/**
 * Two ways of running:
 * - specific presets -> different implementation
 * - preset-agnostic -> same implementation, different values
 */
PresetsManager.prototype.draw = function(name, fn) {
  var presets;

  if (Array.isArray(name)) {
    presets = name;
    name = this._active;

    if (presets.indexOf(name) !== -1) {
      return fn(this._defaults[name]);
    }
  } else if (name === this._active) {
    return fn(this._defaults[name]);
  }

  if (typeof name === 'function' && this._active) {
    fn = name;

    return fn(this._defaults[this._active]);
  }
};
