(function() {
  var video = document.getElementById("moviePlayer");
  var startButton = document.querySelector("[data-play-button]");
  var attached = false;

  function attach() {
    if (!video || attached) {
      return;
    }

    var stream = video.getAttribute("data-stream");

    if (!stream) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      attached = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(stream);
      hls.attachMedia(video);
      attached = true;
      return;
    }

    video.src = stream;
    attached = true;
  }

  function playMovie() {
    attach();

    if (!video) {
      return;
    }

    if (startButton) {
      startButton.hidden = true;
    }

    var played = video.play();

    if (played && typeof played.catch === "function") {
      played.catch(function() {
        if (startButton) {
          startButton.hidden = false;
        }
      });
    }
  }

  if (startButton) {
    startButton.addEventListener("click", playMovie);
  }

  if (video) {
    video.addEventListener("click", function() {
      if (video.paused) {
        playMovie();
      }
    });

    video.addEventListener("play", function() {
      if (startButton) {
        startButton.hidden = true;
      }
    });

    attach();
  }
})();
