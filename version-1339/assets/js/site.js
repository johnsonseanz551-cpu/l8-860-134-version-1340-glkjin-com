(function () {
  var navButton = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");

  if (navButton && nav) {
    navButton.addEventListener("click", function () {
      var expanded = navButton.getAttribute("aria-expanded") === "true";
      navButton.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("is-open", !expanded);
    });
  }

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
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
        showSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    showSlide(0);
    start();
  });

  document.querySelectorAll("[data-filter-form]").forEach(function (form) {
    var scope = form.closest(".content-section") || document;
    var input = form.querySelector("[data-search]");
    var buttons = Array.prototype.slice.call(form.querySelectorAll("[data-filter-value]"));
    var list = scope.querySelector("[data-card-list]") || document.querySelector("[data-card-list]");
    var empty = scope.querySelector("[data-empty]");
    var active = "all";

    function applyFilter() {
      if (!list) {
        return;
      }

      var query = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;
      list.querySelectorAll("[data-card]").forEach(function (card) {
        var haystack = (card.getAttribute("data-haystack") || "").toLowerCase();
        var type = (card.getAttribute("data-type") || "").toLowerCase();
        var genre = (card.getAttribute("data-genre") || "").toLowerCase();
        var matchesText = !query || haystack.indexOf(query) !== -1;
        var token = active.toLowerCase();
        var matchesType = active === "all" || type.indexOf(token) !== -1 || genre.indexOf(token) !== -1 || haystack.indexOf(token) !== -1;
        var matches = matchesText && matchesType;
        card.hidden = !matches;
        if (matches) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        active = button.getAttribute("data-filter-value") || "all";
        buttons.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        applyFilter();
      });
    });

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    applyFilter();
  });
})();
