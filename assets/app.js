(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  const prev = document.querySelector('[data-hero-prev]');
  const next = document.querySelector('[data-hero-next]');
  let heroIndex = 0;
  let heroTimer = null;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === heroIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === heroIndex);
    });
  }

  function restartHero() {
    if (heroTimer) {
      window.clearInterval(heroTimer);
    }

    if (slides.length > 1) {
      heroTimer = window.setInterval(function () {
        showHero(heroIndex + 1);
      }, 5200);
    }
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        const index = Number(dot.getAttribute('data-hero-dot')) || 0;
        showHero(index);
        restartHero();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showHero(heroIndex - 1);
        restartHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showHero(heroIndex + 1);
        restartHero();
      });
    }

    restartHero();
  }

  document.querySelectorAll('[data-filter-root]').forEach(function (root) {
    const queryInput = root.querySelector('[data-filter-query]');
    const categorySelect = root.querySelector('[data-filter-category]');
    const regionSelect = root.querySelector('[data-filter-region]');
    const cards = Array.from(root.querySelectorAll('[data-movie-card]'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function updateCards() {
      const query = normalize(queryInput ? queryInput.value : '');
      const category = categorySelect ? categorySelect.value : 'all';
      const region = regionSelect ? regionSelect.value : 'all';

      cards.forEach(function (card) {
        const text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region')
        ].join(' '));
        const cardCategory = card.getAttribute('data-category') || '';
        const cardRegion = card.getAttribute('data-region') || '';
        const regionGroup = cardRegion.includes('中国') || cardRegion.includes('大陆') || cardRegion.includes('香港') || cardRegion.includes('台湾') ? '国产' : (cardRegion.includes('日本') || cardRegion.includes('韩国') ? '日韩' : (cardRegion.includes('美国') || cardRegion.includes('英国') || cardRegion.includes('法国') || cardRegion.includes('德国') || cardRegion.includes('西班牙') || cardRegion.includes('意大利') ? '欧美' : '海外'));
        const matchesQuery = !query || text.includes(query);
        const matchesCategory = category === 'all' || cardCategory === category;
        const matchesRegion = region === 'all' || regionGroup === region;
        card.hidden = !(matchesQuery && matchesCategory && matchesRegion);
      });
    }

    [queryInput, categorySelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', updateCards);
        control.addEventListener('change', updateCards);
      }
    });
  });
})();
