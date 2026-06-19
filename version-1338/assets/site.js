(function () {
  function textOf(card) {
    return [
      card.getAttribute("data-title"),
      card.getAttribute("data-region"),
      card.getAttribute("data-type"),
      card.getAttribute("data-year"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-tags")
    ].join(" ").toLowerCase();
  }

  function getQuery(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilter() {
    var keywordInputs = document.querySelectorAll("[data-search-input]");
    var activeFilter = document.querySelector(".filter-chip.active");
    var filterValue = activeFilter ? activeFilter.getAttribute("data-filter-value") : "all";
    var terms = [];

    keywordInputs.forEach(function (input) {
      var value = normalize(input.value);
      if (value) {
        terms.push(value);
      }
    });

    document.querySelectorAll(".movie-card").forEach(function (card) {
      var haystack = textOf(card);
      var matchesTerms = terms.every(function (term) {
        return haystack.indexOf(term) !== -1;
      });
      var matchesFilter = filterValue === "all" || haystack.indexOf(normalize(filterValue)) !== -1 || (filterValue === "2024" && /2024|2025|2026/.test(haystack));
      card.classList.toggle("is-hidden", !(matchesTerms && matchesFilter));
    });
  }

  function setupNavigation() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function setupFilters() {
    var query = getQuery("q");
    document.querySelectorAll("[data-search-input]").forEach(function (input) {
      if (query && !input.value) {
        input.value = query;
      }
      input.addEventListener("input", applyFilter);
    });

    document.querySelectorAll(".filter-chip").forEach(function (button) {
      button.addEventListener("click", function () {
        var group = button.closest("[data-filter-group]") || document;
        group.querySelectorAll(".filter-chip").forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        applyFilter();
      });
    });

    if (query) {
      applyFilter();
    }
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  window.startMoviePlayer = function (streamUrl) {
    var video = document.getElementById("moviePlayer");
    var startButton = document.querySelector(".player-start");
    if (!video || !streamUrl) {
      return;
    }
    var loaded = false;
    var hlsInstance = null;

    function bind() {
      if (loaded) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      loaded = true;
    }

    function play() {
      bind();
      if (startButton) {
        startButton.classList.add("is-hidden");
      }
      video.play().catch(function () {});
    }

    if (startButton) {
      startButton.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (!loaded) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (startButton) {
        startButton.classList.add("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupNavigation();
    setupFilters();
    setupHero();
  });
})();
