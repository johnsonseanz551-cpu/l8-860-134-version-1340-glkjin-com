(function () {
  function qs(selector, context) {
    return (context || document).querySelector(selector);
  }

  function qsa(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  qsa('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-missing');
    });
  });

  var menuButton = qs('.mobile-menu-button');
  var mobileNav = qs('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isHidden = mobileNav.hasAttribute('hidden');
      if (isHidden) {
        mobileNav.removeAttribute('hidden');
      } else {
        mobileNav.setAttribute('hidden', 'hidden');
      }
      menuButton.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    });
  }

  var hero = qs('[data-hero]');
  if (hero) {
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    function startHero() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5000);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        if (timer) {
          window.clearInterval(timer);
          timer = null;
          startHero();
        }
      });
    });

    showSlide(0);
    startHero();
  }

  function filterList(term, inputTerm) {
    var keyword = normalize(inputTerm || '');
    var filter = normalize(term || '全部');
    qsa('[data-movie-list] .movie-item').forEach(function (item) {
      var haystack = normalize([
        item.getAttribute('data-title'),
        item.getAttribute('data-category'),
        item.textContent
      ].join(' '));
      var filterMatched = filter === '全部' || haystack.indexOf(filter) !== -1;
      var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
      item.classList.toggle('is-hidden', !(filterMatched && keywordMatched));
    });
  }

  var filterPanel = qs('[data-filter-panel]');
  if (filterPanel) {
    var buttons = qsa('[data-filter]', filterPanel);
    var localSearch = qs('[data-local-search]');
    var params = new URLSearchParams(window.location.search);
    var selected = params.get('c') || '全部';

    function applySelected(value) {
      selected = value || '全部';
      buttons.forEach(function (button) {
        button.classList.toggle('is-active', button.getAttribute('data-filter') === selected);
      });
      filterList(selected, localSearch ? localSearch.value : '');
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        applySelected(button.getAttribute('data-filter'));
      });
    });

    if (localSearch) {
      localSearch.addEventListener('input', function () {
        filterList(selected, localSearch.value);
      });
    }

    var exists = buttons.some(function (button) {
      return button.getAttribute('data-filter') === selected;
    });
    applySelected(exists ? selected : '全部');
  }

  qsa('[data-local-search]').forEach(function (input) {
    if (!filterPanel) {
      input.addEventListener('input', function () {
        filterList('全部', input.value);
      });
    }
  });

  var searchInput = qs('[data-search-page-input]');
  if (searchInput) {
    var searchParams = new URLSearchParams(window.location.search);
    var query = searchParams.get('q') || '';
    searchInput.value = query;
    filterList('全部', query);
    searchInput.addEventListener('input', function () {
      filterList('全部', searchInput.value);
    });
  }

  function playVideo(player) {
    var video = qs('video', player);
    if (!video) {
      return;
    }
    var source = video.getAttribute('data-src');
    if (!source) {
      return;
    }

    player.classList.add('is-playing');
    video.setAttribute('controls', 'controls');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', source);
      }
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      if (video._hlsInstance) {
        video._hlsInstance.destroy();
      }
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      video._hlsInstance = hls;
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
      return;
    }

    if (!video.getAttribute('src')) {
      video.setAttribute('src', source);
    }
    video.play().catch(function () {});
  }

  qsa('[data-player]').forEach(function (player) {
    var overlay = qs('.play-overlay', player);
    var video = qs('video', player);
    if (overlay) {
      overlay.addEventListener('click', function () {
        playVideo(player);
      });
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!player.classList.contains('is-playing')) {
          playVideo(player);
        }
      });
    }
  });
})();
