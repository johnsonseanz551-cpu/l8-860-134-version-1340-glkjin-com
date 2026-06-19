(function () {
  const areas = Array.from(document.querySelectorAll('[data-player]'));

  areas.forEach(function (area) {
    const video = area.querySelector('video');
    const layer = area.querySelector('[data-play-layer]');

    if (!video) {
      return;
    }

    const stream = video.getAttribute('data-stream');
    let attached = false;
    let hls = null;

    function attachStream() {
      if (attached || !stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      attached = true;
    }

    function startPlayback() {
      attachStream();

      if (layer) {
        layer.classList.add('is-hidden');
      }

      video.controls = true;
      const playAction = video.play();

      if (playAction && typeof playAction.catch === 'function') {
        playAction.catch(function () {
          if (layer) {
            layer.classList.remove('is-hidden');
          }
        });
      }
    }

    if (layer) {
      layer.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayback();
      });
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      if (layer) {
        layer.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && layer) {
        layer.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();
