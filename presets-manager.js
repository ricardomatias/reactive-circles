'use strict';

function PresetsManager() {
  this._active = null;
  this._defaults = {};
}

PresetsManager.prototype.select = function(name) {
  this._active = name;

  /* eslint "no-console": 0 */
  console.log('RUNNING PRESET:' + name);
};

PresetsManager.prototype.defaults = function(name, defaults) {
  this._defaults[name] = defaults;
};

/**
 * Two ways of running:
 * - specific presets -> different implementation
 * - preset-agnostic -> same implementation, different values
 */
PresetsManager.prototype.run = function(name, fn) {
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
