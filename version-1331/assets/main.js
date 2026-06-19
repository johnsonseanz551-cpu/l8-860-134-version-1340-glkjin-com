(function() {
  var toggle = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");

  if (toggle && panel) {
    toggle.addEventListener("click", function() {
      panel.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        show(Number(dot.getAttribute("data-hero-dot")));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  var filterInput = document.querySelector("[data-page-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".search-card"));
  var empty = document.querySelector("[data-empty-result]");

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function applyFilter(value) {
    var keyword = normalize(value);
    var visible = 0;

    cards.forEach(function(card) {
      var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-meta"));
      var matched = !keyword || haystack.indexOf(keyword) !== -1;
      card.style.display = matched ? "" : "none";

      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  if (filterInput && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";

    if (initial) {
      filterInput.value = initial;
    }

    applyFilter(filterInput.value);

    filterInput.addEventListener("input", function() {
      applyFilter(filterInput.value);
    });
  }
})();
