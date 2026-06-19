(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initHeader() {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".menu-toggle");
    if (!header || !toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      header.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector(".hero-section");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length === 0) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = next;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show((index + 1) % slides.length);
      }, 5000);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(i);
        start();
      });
    });
    show(0);
    start();
  }

  function initFilters() {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector(".filter-input");
      var selects = Array.prototype.slice.call(scope.querySelectorAll(".filter-select"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card-item"));
      var empty = scope.querySelector(".no-results");
      if (input && initialQuery) {
        input.value = initialQuery;
      }
      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-text") || "").toLowerCase();
          var title = (card.getAttribute("data-title") || "").toLowerCase();
          var matchText = !query || text.indexOf(query) !== -1 || title.indexOf(query) !== -1;
          var matchSelects = selects.every(function (select) {
            var key = select.getAttribute("data-filter");
            var value = select.value;
            if (!value) {
              return true;
            }
            return (card.getAttribute("data-" + key) || "") === value;
          });
          var showCard = matchText && matchSelects;
          card.classList.toggle("hidden-by-filter", !showCard);
          if (showCard) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      selects.forEach(function (select) {
        select.addEventListener("change", apply);
      });
      apply();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var mask = player.querySelector(".player-mask");
      if (!video) {
        return;
      }
      var stream = video.getAttribute("data-play");
      var attached = false;
      var hls = null;
      function attach() {
        if (attached || !stream) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else {
          video.src = stream;
        }
      }
      function play() {
        attach();
        if (mask) {
          mask.classList.add("is-hidden");
        }
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }
      if (mask) {
        mask.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (mask) {
          mask.classList.add("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initHeader();
    initHero();
    initFilters();
    initPlayers();
  });
})();
