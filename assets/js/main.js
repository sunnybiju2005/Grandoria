/**
* Template Name: Gaurikeerthana
* Template URL: https://bootstrapmade.com/grandoria-bootstrap-hotel-template/
* Updated: Jul 29 2025 with Bootstrap v5.3.7
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle - SIMPLIFIED AND ROBUST
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');
  const body = document.body;
  const overlay = document.querySelector('.mobile-nav-overlay');

  function mobileNavToogle() {
    const isActive = body.classList.contains('mobile-nav-active');
    
    if (isActive) {
      // Closing - add closing animation class
      body.classList.remove('mobile-nav-active');
      if (mobileNavToggleBtn) {
        mobileNavToggleBtn.classList.remove('bi-x');
        mobileNavToggleBtn.classList.add('bi-list');
      }
    } else {
      // Opening
      body.classList.add('mobile-nav-active');
      if (mobileNavToggleBtn) {
        mobileNavToggleBtn.classList.remove('bi-list');
        mobileNavToggleBtn.classList.add('bi-x');
      }
    }
  }
  
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();
      mobileNavToogle();
    });
    
    // Also handle touch events
    mobileNavToggleBtn.addEventListener('touchend', function(e) {
      e.stopPropagation();
      e.preventDefault();
      mobileNavToogle();
    });
  }
  
  // Close menu when clicking overlay
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (body.classList.contains('mobile-nav-active')) {
        mobileNavToogle();
      }
    });
    
    overlay.addEventListener('touchend', function(e) {
      if (body.classList.contains('mobile-nav-active')) {
        e.preventDefault();
        mobileNavToogle();
      }
    });
  }

  /**
   * Setup navigation links - SIMPLIFIED APPROACH
   */
  function setupNavigationLinks() {
    const navLinks = document.querySelectorAll('#navmenu a');
    
    navLinks.forEach(link => {
      // Remove old listeners by cloning
      const newLink = link.cloneNode(true);
      link.parentNode.replaceChild(newLink, link);
      
      // Click handler
      newLink.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        const isDropdown = this.closest('.dropdown') && href === '#';
        
        // Don't prevent default for dropdown toggles
        if (isDropdown) {
          return; // Let dropdown handler manage this
        }
        
        // For regular links, close menu after navigation
        if (body.classList.contains('mobile-nav-active')) {
          if (href && href !== '#' && !href.startsWith('javascript:')) {
            // Close menu after a short delay to allow navigation
            setTimeout(() => {
              if (body.classList.contains('mobile-nav-active')) {
                mobileNavToogle();
              }
            }, 200);
          } else {
            // Same page anchor - close immediately
            mobileNavToogle();
          }
        }
      }, true); // Capture phase
      
      // Touch handler for better mobile support
      newLink.addEventListener('touchend', function(e) {
        // Only handle if it's a regular link (not dropdown)
        const href = this.getAttribute('href');
        if (href && href !== '#') {
          e.stopPropagation();
          // Trigger click
          this.click();
        }
      }, { passive: true });
    });
  }
  
  // Setup on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupNavigationLinks);
  } else {
    setupNavigationLinks();
  }

  /**
   * Close mobile nav when clicking outside - SIMPLIFIED
   */
  document.addEventListener('click', (e) => {
    if (!body.classList.contains('mobile-nav-active')) return;
    
    const navmenu = document.querySelector('#navmenu');
    const toggleBtn = document.querySelector('.mobile-nav-toggle');
    const clickedInsideNav = navmenu && navmenu.contains(e.target);
    const clickedToggle = toggleBtn && toggleBtn.contains(e.target);
    
    // Close if clicking outside menu and toggle button
    if (!clickedInsideNav && !clickedToggle) {
      mobileNavToogle();
    }
  }, true); // Use capture phase

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .dropdown > a').forEach(dropdownLink => {
    dropdownLink.addEventListener('click', function(e) {
      // Only prevent default on mobile
      if (window.innerWidth < 1200) {
        e.preventDefault();
        const dropdown = this.parentNode;
        const dropdownMenu = dropdown.querySelector('ul');
        
        dropdown.classList.toggle('active');
        if (dropdownMenu) {
          dropdownMenu.classList.toggle('dropdown-active');
        }
        e.stopImmediatePropagation();
      }
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Countdown timer
   */
  function updateCountDown(countDownItem) {
    const timeleft = new Date(countDownItem.getAttribute('data-count')).getTime() - new Date().getTime();

    const days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeleft % (1000 * 60)) / 1000);

    const daysElement = countDownItem.querySelector('.count-days');
    const hoursElement = countDownItem.querySelector('.count-hours');
    const minutesElement = countDownItem.querySelector('.count-minutes');
    const secondsElement = countDownItem.querySelector('.count-seconds');

    if (daysElement) daysElement.innerHTML = days;
    if (hoursElement) hoursElement.innerHTML = hours;
    if (minutesElement) minutesElement.innerHTML = minutes;
    if (secondsElement) secondsElement.innerHTML = seconds;

  }

  document.querySelectorAll('.countdown').forEach(function(countDownItem) {
    updateCountDown(countDownItem);
    setInterval(function() {
      updateCountDown(countDownItem);
    }, 1000);
  });

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

})();