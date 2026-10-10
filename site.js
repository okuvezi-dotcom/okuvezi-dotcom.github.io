// The film slot and the install cards. Works with or without the promo films uploaded:
// each .film tries its MP4 cuts in order and keeps the screenshot poster if none exists.
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var portraitPhone = window.matchMedia('(max-width: 700px) and (orientation: portrait)').matches;

  function setupFilm(fig) {
    var video = fig.querySelector('video');
    if (!video) return;
    var name = fig.getAttribute('data-film');
    var order = (fig.getAttribute(portraitPhone ? 'data-phone' : 'data-wide') || '16x9,9x16').split(',');
    var i = 0;
    var sound = fig.querySelector('.film__sound');
    var tap = fig.querySelector('.film__play');

    // The <source> is there for browsers without this script; from here the script chooses.
    Array.prototype.forEach.call(video.querySelectorAll('source'), function (s) { s.remove(); });
    video.muted = true;
    video.removeAttribute('controls');
    // A portrait phone gets a portrait poster where the page has one, in a portrait frame.
    var phonePoster = fig.getAttribute('data-poster-phone');
    if (portraitPhone && phonePoster) {
      video.poster = phonePoster;
      fig.classList.add('is-portrait');
    }

    function next() {
      if (i >= order.length) {
        video.removeAttribute('src');
        fig.classList.add('is-still');
        return;
      }
      video.src = name + '-' + order[i++] + '.mp4';
      video.load();
    }
    video.addEventListener('error', next);
    video.addEventListener('loadedmetadata', function () {
      fig.classList.toggle('is-portrait', video.videoHeight > video.videoWidth);
      fig.classList.add('has-film');
      if (reduced) fig.classList.add('wants-tap');
      else play();
    });
    function play() {
      var p = video.play();
      if (p && p.catch) p.catch(function () { fig.classList.add('wants-tap'); });
    }
    video.addEventListener('playing', function () { fig.classList.add('is-playing'); fig.classList.remove('wants-tap'); });
    if (tap) tap.addEventListener('click', play);
    if (sound) sound.addEventListener('click', function () {
      video.muted = !video.muted;
      sound.setAttribute('aria-pressed', String(!video.muted));
      sound.lastChild.textContent = video.muted ? ' Sound off' : ' Sound on';
    });
    // Only spend data and battery on the film when it is on screen.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!fig.classList.contains('has-film')) return;
          if (e.isIntersecting && !reduced) play(); else video.pause();
        });
      }, { threshold: 0.2 }).observe(fig);
    }
    next();
  }
  Array.prototype.forEach.call(document.querySelectorAll('.film[data-film]'), setupFilm);

  // Put the visitor's own phone first in the install steps.
  var ua = navigator.userAgent;
  var ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var android = /Android/.test(ua);
  var mine = ios ? 'ios' : android ? 'android' : null;
  if (mine) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-platform="' + mine + '"]'), function (el) {
      el.classList.add('is-yours');
      if (el.parentNode && el.parentNode.firstElementChild !== el) el.parentNode.insertBefore(el, el.parentNode.firstElementChild);
    });
  }
})();
