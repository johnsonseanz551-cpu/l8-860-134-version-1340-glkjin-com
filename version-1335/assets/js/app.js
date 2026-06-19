(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        var showSlide = function (index) {
            current = index;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        };

        var start = function () {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 5000);
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                start();
            });
        });

        if (slides.length > 1) {
            start();
        }
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function (panel) {
        var container = document.querySelector('[data-card-list]');
        if (!container) {
            return;
        }
        var cards = Array.prototype.slice.call(container.querySelectorAll('.movie-card'));
        var keywordInput = panel.querySelector('[data-filter-keyword]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        var y = params.get('year') || '';
        var t = params.get('type') || '';

        if (keywordInput && q) {
            keywordInput.value = q;
        }
        if (yearSelect && y) {
            yearSelect.value = y;
        }
        if (typeSelect && t) {
            typeSelect.value = t;
        }

        var apply = function () {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : '';
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.textContent
                ].join(' ').toLowerCase();
                var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var okYear = !year || card.getAttribute('data-year') === year;
                var okType = !type || card.getAttribute('data-type') === type;
                card.classList.toggle('hidden-by-filter', !(okKeyword && okYear && okType));
            });
        };

        [keywordInput, yearSelect, typeSelect].forEach(function (input) {
            if (!input) {
                return;
            }
            input.addEventListener('input', apply);
            input.addEventListener('change', apply);
        });

        apply();
    });

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
        var video = player.querySelector('video');
        var overlay = player.querySelector('.player-overlay');
        var button = player.querySelector('.player-button');
        var stream = player.getAttribute('data-play');
        var hlsInstance = null;

        if (!video || !stream) {
            return;
        }

        var hideOverlay = function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        };

        var playNative = function () {
            if (video.getAttribute('src') !== stream) {
                video.setAttribute('src', stream);
            }
            video.play().catch(function () {});
        };

        var playWithHls = function () {
            if (!hlsInstance) {
                hlsInstance = new Hls({ enableWorker: true });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
            } else {
                video.play().catch(function () {});
            }
        };

        var launch = function (event) {
            if (event) {
                event.preventDefault();
            }
            hideOverlay();
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                playNative();
            } else if (window.Hls && Hls.isSupported()) {
                playWithHls();
            } else {
                playNative();
            }
        };

        if (button) {
            button.addEventListener('click', launch);
        }
        if (overlay) {
            overlay.addEventListener('click', launch);
            overlay.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    launch(event);
                }
            });
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                launch();
            } else {
                video.pause();
            }
        });
    });
})();
