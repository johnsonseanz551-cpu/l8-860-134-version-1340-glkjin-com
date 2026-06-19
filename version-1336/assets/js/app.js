(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-dot]'));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5500);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-dot')) || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function initPageFilter() {
    var input = document.querySelector('[data-page-filter]');
    var list = document.querySelector('[data-card-list]');
    if (!input || !list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty-state]');

    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category')
        ].join(' ').toLowerCase();
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.hidden = !matched;
        if (matched) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.hidden = visibleCount !== 0;
      }
    });
  }

  function createOption(value) {
    var option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    return option;
  }

  function movieCardHtml(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card" data-card>',
      '  <a class="card-media" href="' + escapeHtml(movie.href) + '" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="media-gradient"></span>',
      '    <span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '    <span class="card-year">' + escapeHtml(movie.year) + '</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <h3><a href="' + escapeHtml(movie.href) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="card-meta">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.genreMain) + '</span>',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '    </div>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function initSearchPage() {
    var results = document.querySelector('[data-search-results]');
    if (!results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var input = document.querySelector('[data-search-input]');
    var genreSelect = document.querySelector('[data-search-genre]');
    var regionSelect = document.querySelector('[data-search-region]');
    var yearSelect = document.querySelector('[data-search-year]');
    var count = document.querySelector('[data-result-count]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    var movies = window.MOVIE_SEARCH_INDEX;
    var genres = Array.from(new Set(movies.map(function (movie) { return movie.genreMain; }).filter(Boolean))).sort();
    var regions = Array.from(new Set(movies.map(function (movie) { return movie.region; }).filter(Boolean))).sort();
    var years = Array.from(new Set(movies.map(function (movie) { return movie.year; }).filter(Boolean))).sort().reverse();

    genres.forEach(function (genre) {
      genreSelect.appendChild(createOption(genre));
    });
    regions.forEach(function (region) {
      regionSelect.appendChild(createOption(region));
    });
    years.forEach(function (year) {
      yearSelect.appendChild(createOption(year));
    });

    function render() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var genre = genreSelect.value;
      var region = regionSelect.value;
      var year = yearSelect.value;
      var filtered = movies.filter(function (movie) {
        var keywordMatched = !keyword || movie.searchText.indexOf(keyword) !== -1;
        var genreMatched = !genre || movie.genreMain === genre;
        var regionMatched = !region || movie.region === region;
        var yearMatched = !year || movie.year === year;
        return keywordMatched && genreMatched && regionMatched && yearMatched;
      }).slice(0, 240);

      results.innerHTML = filtered.map(movieCardHtml).join('');
      if (count) {
        count.textContent = '当前显示 ' + filtered.length + ' 条结果';
      }
    }

    [input, genreSelect, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', render);
        control.addEventListener('change', render);
      }
    });

    render();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.player-start');
      var source = shell.getAttribute('data-src');
      var hls = null;
      var initialized = false;

      if (!video || !button || !source) {
        return;
      }

      function attachSource() {
        if (initialized) {
          return;
        }

        initialized = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      button.addEventListener('click', function () {
        attachSource();
        button.classList.add('is-hidden');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      });

      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initPageFilter();
    initSearchPage();
    initPlayers();
  });
})();
