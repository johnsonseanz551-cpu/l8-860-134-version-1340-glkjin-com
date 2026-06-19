(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var players = document.querySelectorAll("[data-player]");

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-player-start]");
      var status = player.querySelector("[data-player-status]");
      var source = player.getAttribute("data-m3u8");
      var hlsInstance = null;

      if (!video || !button || !source) {
        if (status) {
          status.textContent = "播放源未绑定";
        }
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function attachSource() {
        if (video.getAttribute("data-source-ready") === "1") {
          return;
        }

        video.setAttribute("data-source-ready", "1");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          setStatus("正在使用浏览器原生 HLS 播放");
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("播放源已就绪");
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("播放连接异常，请刷新后重试");
              hlsInstance.destroy();
              hlsInstance = null;
            }
          });
          return;
        }

        video.src = source;
        setStatus("当前浏览器可能不支持 HLS 播放");
      }

      button.addEventListener("click", function () {
        attachSource();
        player.classList.add("is-playing");
        video.controls = true;
        video.play().catch(function () {
          setStatus("请再次点击播放器开始播放");
        });
      });

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
