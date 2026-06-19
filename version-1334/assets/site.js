(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initNavigation();
    initHeroCarousel();
    initLocalFilters();
    initGlobalSearch();
    initImageFallbacks();
  });

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initLocalFilters() {
    var panels = document.querySelectorAll(".filter-panel");

    panels.forEach(function (panel) {
      var root = panel.parentElement;
      var list = root ? root.querySelector("[data-filter-list]") : null;

      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .rank-item"));
      var search = panel.querySelector("[data-filter-search]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");

      function apply() {
        var query = valueOf(search);
        var regionQuery = valueOf(region);
        var typeQuery = valueOf(type);

        cards.forEach(function (card) {
          var text = getFilterText(card);
          var ok = true;

          if (query && text.indexOf(query) === -1) {
            ok = false;
          }

          if (regionQuery && text.indexOf(regionQuery) === -1) {
            ok = false;
          }

          if (typeQuery && text.indexOf(typeQuery) === -1) {
            ok = false;
          }

          card.classList.toggle("is-hidden", !ok);
        });
      }

      [search, region, type].forEach(function (input) {
        if (input) {
          input.addEventListener("input", apply);
        }
      });
    });
  }

  function valueOf(input) {
    return input ? String(input.value || "").trim().toLowerCase() : "";
  }

  function getFilterText(element) {
    var dataText = [
      element.getAttribute("data-title"),
      element.getAttribute("data-region"),
      element.getAttribute("data-type"),
      element.getAttribute("data-year"),
      element.getAttribute("data-tags"),
      element.textContent
    ].join(" ");

    return dataText.toLowerCase();
  }

  function initGlobalSearch() {
    var input = document.querySelector("[data-global-search]");
    var button = document.querySelector("[data-global-search-button]");
    var results = document.querySelector("[data-search-results]");

    if (!input || !results || !window.MOVIES_DATA) {
      return;
    }

    function render() {
      var query = String(input.value || "").trim().toLowerCase();
      var movies = window.MOVIES_DATA;

      if (query) {
        movies = movies.filter(function (movie) {
          return [
            movie.title,
            movie.region,
            movie.type,
            movie.year,
            movie.genreRaw,
            movie.oneLine,
            (movie.tags || []).join(" ")
          ].join(" ").toLowerCase().indexOf(query) !== -1;
        });
      }

      movies = movies.slice(0, 120);

      if (!movies.length) {
        results.innerHTML = '<div class="search-empty">没有找到匹配内容，请尝试更换关键词。</div>';
        return;
      }

      results.innerHTML = movies.map(function (movie) {
        return [
          '<article class="movie-card">',
          '  <a class="movie-card-link" href="movie/' + escapeAttr(movie.id) + '.html">',
          '    <span class="poster-frame">',
          '      <img src="' + escapeAttr(movie.cover) + '" alt="' + escapeAttr(movie.title) + '" loading="lazy">',
          '      <span class="poster-shade"></span>',
          '      <span class="poster-play">▶</span>',
          '    </span>',
          '    <span class="movie-info">',
          '      <strong>' + escapeHtml(movie.title) + '</strong>',
          '      <span>' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</span>',
          '    </span>',
          '  </a>',
          '</article>'
        ].join("");
      }).join("");
    }

    input.addEventListener("input", render);

    if (button) {
      button.addEventListener("click", render);
    }

    render();
  }

  function initImageFallbacks() {
    var images = document.querySelectorAll("img");

    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.style.opacity = "0";
      }, { once: true });
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }
})();
