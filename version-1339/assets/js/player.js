(function () {
  function initPlayer(box) {
    var video = box.querySelector("video");
    var button = box.querySelector(".play-overlay");
    var src = box.getAttribute("data-stream");
    var hls = null;
    var loaded = false;

    function attach() {
      if (!video || !src || loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function start() {
      attach();

      if (button) {
        button.hidden = true;
      }

      if (video) {
        video.controls = true;
        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("play", function () {
        if (button) {
          button.hidden = true;
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll("[data-player]").forEach(initPlayer);
})();
