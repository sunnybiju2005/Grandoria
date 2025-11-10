/**
 * NEW MOBILE NAVIGATION - COMPLETE SOLUTION
 * Handles hamburger menu, sidebar, dropdowns, and all interactions
 */

(function() {
  'use strict';

  // ============================================
  // INITIALIZATION
  // ============================================
  let isInitialized = false;

  function initMobileNav() {
    if (isInitialized) return;
    isInitialized = true;

    const body = document.body;
    const hamburgerBtn = document.querySelector('.mobile-nav-btn');
    const sidebar = document.querySelector('.mobile-nav-sidebar');
    const overlay = document.querySelector('.mobile-nav-overlay-new');
    const closeBtn = document.querySelector('.mobile-nav-close');

    if (!hamburgerBtn || !sidebar) {
      console.warn('Mobile navigation elements not found');
      return;
    }

    // ============================================
    // TOGGLE MOBILE NAVIGATION
    // ============================================
    function toggleMobileNav() {
      const isOpen = body.classList.contains('mobile-nav-open');
      
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    }

    function openMobileNav() {
      body.classList.add('mobile-nav-open');
      // Prevent body scroll
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }

    function closeMobileNav() {
      body.classList.remove('mobile-nav-open');
      // Restore body scroll
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      // Close all dropdowns
      closeAllDropdowns();
    }

    // ============================================
    // DROPDOWN HANDLING
    // ============================================
    function setupDropdowns() {
      const dropdownToggles = sidebar.querySelectorAll('.mobile-nav-dropdown > a');
      
      dropdownToggles.forEach(toggle => {
        // Remove any existing listeners by cloning
        const newToggle = toggle.cloneNode(true);
        toggle.parentNode.replaceChild(newToggle, toggle);
        
        newToggle.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const dropdown = this.parentElement;
          const isActive = dropdown.classList.contains('active');
          
          // Close all other dropdowns
          closeAllDropdowns();
          
          // Toggle current dropdown
          if (!isActive) {
            dropdown.classList.add('active');
          }
        }, true);
      });
    }

    function closeAllDropdowns() {
      const activeDropdowns = sidebar.querySelectorAll('.mobile-nav-dropdown.active');
      activeDropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
      });
    }

    // ============================================
    // NAVIGATION LINKS
    // ============================================
    function setupNavigationLinks() {
      const navLinks = sidebar.querySelectorAll('.mobile-nav-menu a[href]');
      
      navLinks.forEach(link => {
        // Skip dropdown toggles
        if (link.parentElement.classList.contains('mobile-nav-dropdown')) {
          return;
        }
        
        link.addEventListener('click', function(e) {
          // Close menu after a short delay to allow navigation
          setTimeout(() => {
            closeMobileNav();
          }, 100);
        });
      });
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    
    // Hamburger button
    hamburgerBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMobileNav();
    }, true);

    // Touch support for hamburger
    hamburgerBtn.addEventListener('touchend', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleMobileNav();
    }, { passive: false, capture: true });

    // Close button
    if (closeBtn) {
      closeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeMobileNav();
      }, true);

      closeBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeMobileNav();
      }, { passive: false, capture: true });
    }

    // Overlay click to close
    if (overlay) {
      overlay.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        closeMobileNav();
      }, true);
    }

    // ESC key to close
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && body.classList.contains('mobile-nav-open')) {
        closeMobileNav();
      }
    });

    // Close menu when clicking outside (on document)
    document.addEventListener('click', function(e) {
      if (body.classList.contains('mobile-nav-open')) {
        // Check if click is outside sidebar and overlay
        if (!sidebar.contains(e.target) && 
            !hamburgerBtn.contains(e.target) && 
            (!overlay || !overlay.contains(e.target))) {
          // Small delay to prevent immediate close on menu open
          setTimeout(() => {
            if (body.classList.contains('mobile-nav-open')) {
              closeMobileNav();
            }
          }, 10);
        }
      }
    }, true);

    // ============================================
    // SETUP DROPDOWNS AND LINKS
    // ============================================
    setupDropdowns();
    setupNavigationLinks();

    // Ensure menu is closed on page load
    closeMobileNav();
  }

  // ============================================
  // INITIALIZE WHEN DOM IS READY
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    // DOM already loaded
    initMobileNav();
  }

  // Re-initialize if needed (for dynamic content)
  window.addEventListener('load', function() {
    if (!isInitialized) {
      initMobileNav();
    }
  });

})();

