'use strict';

/* exported toggleOverlay registerShortcuts, takeScreenshot */

function toggleOverlay() {
  var overlay = Array.from(document.getElementsByClassName('overlay'))[0];

  overlay.classList.toggle('hidden');
}

function genUID() {
  var str = '';

  for (var idx = 0; idx < 6; idx++) {
    if (idx % 2 === 0) {
      str += String.fromCharCode(Math.floor(Math.random() * 25) + 97);
    } else {
      str += Math.floor(Math.random() * 10);
    }
  }

  return str;
}

function takeScreenshot(preset) {
  var screenshot = canvas.toDataURL('image/png').replace(/^data:image\/[^;]/, 'data:application/octet-stream');

  var element = document.createElement('a');

  element.setAttribute('href', screenshot);
  element.setAttribute('download', 'screenshot-' + preset + '-' + genUID() + '.png');
  element.setAttribute('target', '_blank');

  element.style.display = 'none';

  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function registerShortcuts(shortcuts) {
  shortcuts.forEach(function(shortcut) {
    var key = shortcut.key;

    if (key.length === 1) {
      key = 'Key' + key.toUpperCase();
    }

    document.addEventListener('keyup', function(event) {
      if (key === event.code) {
        shortcut.action();
      }

      event.stopPropagation();
      event.preventDefault();
    });
  });
}
