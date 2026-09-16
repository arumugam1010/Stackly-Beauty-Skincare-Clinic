/**
 * Stackly Authentication & Session Management Module
 */

(function () {
  'use strict';

  const AUTH_STORAGE_KEY = 'stackly_auth_user';

  // Role Configurations with their respective 10 sidebar items
  const ROLE_CONFIGS = {
    admin: {
      id: 'admin',
      title: 'Super Admin',
      badgeClass: 'role-pill-admin',
      icon: 'fas fa-shield-alt',
      greeting: 'Administrator Portal',
      description: 'Full system management, analytics, audit logs and enterprise configuration.',
      sidebar: [
        { title: 'Admin Overview', icon: 'fas fa-chart-line', badge: 'Live', active: true },
        { title: 'User & Role Management', icon: 'fas fa-users-cog', badge: '1.2k' },
        { title: 'Branch & Clinic Operations', icon: 'fas fa-hospital-alt' },
        { title: 'Service Catalog & Pricing', icon: 'fas fa-tags' },
        { title: 'Financials & Revenue', icon: 'fas fa-wallet', badge: '+$42k' },
        { title: 'System Analytics & Growth', icon: 'fas fa-chart-pie' },
        { title: 'Audit Logs & Security', icon: 'fas fa-clipboard-list' },
        { title: 'Access Permissions', icon: 'fas fa-user-lock' },
        { title: 'System Alerts & Broadcasts', icon: 'fas fa-broadcast-tower', badge: '3' },
        { title: 'Global System Settings', icon: 'fas fa-cogs' }
      ]
    },
    manager: {
      id: 'manager',
      title: 'Operations Manager',
      badgeClass: 'role-pill-manager',
      icon: 'fas fa-user-tie',
      greeting: 'Manager Operations Hub',
      description: 'Team schedules, customer bookings, inventory control, and branch KPIs.',
      sidebar: [
        { title: 'Manager Dashboard', icon: 'fas fa-tachometer-alt', badge: 'Active', active: true },
        { title: 'Team Rosters & Shifts', icon: 'fas fa-calendar-check' },
        { title: 'Service Bookings & Orders', icon: 'fas fa-concierge-bell', badge: '18' },
        { title: 'Inventory & Stock Control', icon: 'fas fa-boxes' },
        { title: 'Customer Inquiries & Leads', icon: 'fas fa-headset', badge: '5 new' },
        { title: 'Team Performance KPIs', icon: 'fas fa-trophy' },
        { title: 'Operations Monthly Reports', icon: 'fas fa-file-invoice-dollar' },
        { title: 'Customer Feedback & Ratings', icon: 'fas fa-star-half-alt' },
        { title: 'Internal Staff Announcements', icon: 'fas fa-bullhorn' },
        { title: 'Manager Profile & Branch Hub', icon: 'fas fa-user-edit' }
      ]
    },
    user: {
      id: 'user',
      title: 'Standard User',
      badgeClass: 'role-pill-user',
      icon: 'fas fa-user-circle',
      greeting: 'Client Portal',
      description: 'Personal treatments, appointment bookings, invoices, and wellness rewards.',
      sidebar: [
        { title: 'My Account Overview', icon: 'fas fa-user-shield', badge: 'Member', active: true },
        { title: 'My Bookings & Appointments', icon: 'fas fa-calendar-alt', badge: '2' },
        { title: 'Treatment History & Care', icon: 'fas fa-notes-medical' },
        { title: 'My Invoices & Receipts', icon: 'fas fa-receipt' },
        { title: 'Rewards & Loyalty Points', icon: 'fas fa-gift', badge: '450 pts' },
        { title: 'Chat with Specialist', icon: 'fas fa-comments', badge: 'Online' },
        { title: 'My Skin Health Records', icon: 'fas fa-heartbeat' },
        { title: 'My Reviews & Ratings', icon: 'fas fa-medal' },
        { title: 'Reminders & Notifications', icon: 'fas fa-bell', badge: '4' },
        { title: 'Account Security & Preferences', icon: 'fas fa-sliders-h' }
      ]
    }
  };

  // Helper: Retrieve current authenticated user
  function getCurrentUser() {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse auth data:', e);
      return null;
    }
  }

  // Helper: Save user session
  function setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }
    const sessionData = {
      email: user.email,
      role: (user.role || 'user').toLowerCase(),
      name: user.name || user.email.split('@')[0],
      loggedInAt: new Date().toISOString()
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
    return sessionData;
  }

  // Helper: Logout user
  function logoutUser(redirect = true) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    if (redirect) {
      window.location.href = 'index.html';
    } else {
      updateHeaderAuthUI();
    }
  }

  // Email validation: Standard regex
  function validateEmail(email) {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).trim());
  }

  // Password validation: Minimum 6 characters
  function validatePassword(password) {
    const pwd = password || '';
    const lengthValid = pwd.length >= 6;

    return {
      lengthValid,
      isValid: lengthValid
    };
  }

  // Update header auth UI on normal website pages (index.html, about.html, etc.)
  function updateHeaderAuthUI() {
    const user = getCurrentUser();
    const guestBoxes = document.querySelectorAll('.guest-nav-actions');
    const userBoxes = document.querySelectorAll('.user-nav-actions');
    const mobileAuthContainers = document.querySelectorAll('.mobile-nav-auth-links');

    if (user) {
      // User is logged in: Hide Login/Register, Show Dashboard button!
      guestBoxes.forEach(el => el.style.setProperty('display', 'none', 'important'));
      userBoxes.forEach(el => {
        el.style.setProperty('display', 'inline-flex', 'important');
        const roleLabel = el.querySelector('.user-role-text');
        if (roleLabel) {
          roleLabel.textContent = ROLE_CONFIGS[user.role]?.title || user.role;
        }
      });

      // Update mobile drawer
      mobileAuthContainers.forEach(container => {
        container.innerHTML = `
          <a href="dashboard.html" class="mobile-nav-auth-dashboard">
            <i class="fas fa-th-large"></i> Go to Dashboard (${ROLE_CONFIGS[user.role]?.title || 'Portal'})
          </a>
          <a href="javascript:void(0)" class="mobile-nav-auth-login" onclick="StacklyAuth.logoutUser(true)">
            <i class="fas fa-sign-out-alt"></i> Logout (${user.email})
          </a>
        `;
      });
    } else {
      // User is logged out: Show Login/Register, Hide Dashboard button!
      guestBoxes.forEach(el => el.style.setProperty('display', 'inline-flex', 'important'));
      userBoxes.forEach(el => el.style.setProperty('display', 'none', 'important'));

      // Update mobile drawer
      mobileAuthContainers.forEach(container => {
        container.innerHTML = `
          <a href="login.html" class="mobile-nav-auth-login">
            <i class="fas fa-sign-in-alt"></i> Login
          </a>
          <a href="register.html" class="mobile-nav-auth-register">
            <i class="fas fa-user-plus"></i> Register
          </a>
        `;
      });
    }

    // Attach logout click listener
    document.querySelectorAll('.auth-nav-logout-btn, .auth-logout-action').forEach(btn => {
      btn.onclick = function (e) {
        e.preventDefault();
        logoutUser(true);
      };
    });

    // Clean up custom cursor interference over auth navbar buttons
    const cursor = document.querySelector('.custom-cursor__cursor');
    const cursorinner = document.querySelector('.custom-cursor__cursor-two');
    if (cursor || cursorinner) {
      document.querySelectorAll('.auth-nav-box, .auth-nav-btn').forEach(el => {
        el.addEventListener('mouseenter', () => {
          if (cursor) cursor.style.setProperty('opacity', '0', 'important');
          if (cursorinner) cursorinner.style.setProperty('opacity', '0', 'important');
        });
        el.addEventListener('mouseleave', () => {
          if (cursor) cursor.style.setProperty('opacity', '', '');
          if (cursorinner) cursorinner.style.setProperty('opacity', '', '');
        });
      });
    }
  }

  // --------------------------------------------------------------------------
  // 404 Routing for All Content Buttons & Forms on Public Pages
  // Targets: index.html, about.html, services.html, products.html, blog.html, contact.html
  // Excludes: Navbar, Footer, Mobile View Sidebar
  // --------------------------------------------------------------------------
  function setupContentButtons404Routing() {
    const rawPath = (window.location.pathname || '').toLowerCase();
    const page = rawPath.substring(rawPath.lastIndexOf('/') + 1) || 'index.html';
    const targetPages = [
      'index.html',
      'about.html',
      'services.html',
      'products.html',
      'blog.html',
      'contact.html'
    ];

    const isTargetPage = targetPages.includes(page) || rawPath.endsWith('/') || rawPath === '';
    if (!isTargetPage) return;

    // Handle button & action link clicks
    document.addEventListener('click', function (e) {
      const target = e.target.closest('button, a, input[type="submit"], input[type="button"]');
      if (!target) return;

      // 1. EXCLUSION: Desktop Header, Sticky Header & Navbar (Home, About, Services, Products, Blog, Contact, Login, Register, Dashboard, Logout, Logo)
      if (target.closest('header, .main-header, .main-menu, .stricky-header, .sticky-header, .auth-nav-box, .main-menu__wrapper')) {
        return; // Allow normal nav action
      }

      // Footer Newsletter Send Button -> route to 404.html
      if (target.closest('.footer-widget__newsletter-btn, .footer-widget__newsletter-form-box button')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        window.location.href = '404.html';
        return;
      }

      // 2. EXCLUSION: Footer (all footer quick links, services, contact, social, etc.)
      if (target.closest('footer, .site-footer, .footer-widget, .site-footer__bottom')) {
        return; // Allow normal footer action
      }

      // 3. EXCLUSION: Mobile Navigation Drawer (Mobile sidebar menu links & toggler)
      if (target.closest('.mobile-nav__wrapper, .mobile-nav__toggler, .mobile-nav__container, .mobile-nav__content, .mobile-nav__overlay')) {
        return; // Allow normal mobile drawer action
      }

      // 4. EXCLUSION: Utility UI controls (Scroll-to-top, Slider Prev/Next, Search Close, Side Widget Close)
      if (target.closest('.scroll-to-target, .scroll-to-top, .owl-nav, .owl-dots, .close-search, .close-side-widget')) {
        return;
      }

      // 5. EXCLUSION: Breadcrumb navigation ("Home" link back to index.html)
      if (target.closest('.thm-breadcrumb')) {
        return;
      }

      // 6. EXCLUSION: Side drawer contact links or logo (tel, mailto, index.html)
      if (target.closest('.side-content') && (target.getAttribute('href') === 'index.html' || target.getAttribute('href')?.startsWith('tel:') || target.getAttribute('href')?.startsWith('mailto:'))) {
        return;
      }

      // 7. Check if target is a content button or action element
      const href = target.getAttribute('href');
      const isContentButton = (
        target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' ||
        target.classList.contains('thm-btn') ||
        target.classList.contains('services-one__btn') ||
        target.classList.contains('video-popup') ||
        target.className.includes('btn') ||
        target.closest('.single-product-style1, .product__all, .blog-one__single, .services-one__single, .team-one__single, .about-one__btn-box, .banner-one__btn, .cta-one, .pricing-one') ||
        (href && (href === '404.html' || href.endsWith('.html') || href === '#'))
      );

      if (isContentButton) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        window.location.href = '404.html';
      }
    }, true);

    // Handle Form Submissions in Content Area & Footer
    document.addEventListener('submit', function (e) {
      const form = e.target;
      if (form.closest('header, .main-header, .mobile-nav__wrapper')) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      window.location.href = '404.html';
    }, true);
  }

  // --------------------------------------------------------------------------
  // 404 Page Helper: Show "Return to Dashboard" ONLY if logged in
  // --------------------------------------------------------------------------
  function update404UI() {
    const btnDashboard = document.getElementById('btnReturnDashboard');
    if (!btnDashboard) return;
    const user = getCurrentUser();
    if (user) {
      btnDashboard.style.display = 'inline-flex';
    } else {
      btnDashboard.style.display = 'none';
    }
  }

  // --------------------------------------------------------------------------
  // Global Input Constraints:
  // 1. Name fields: No numbers allowed (letters & spaces only)
  // 2. Phone fields: No alphabets allowed (numbers & phone symbols only)
  // --------------------------------------------------------------------------
  function setupInputValidationRestrictions() {
    function isNameInput(el) {
      if (!el || el.tagName !== 'INPUT') return false;
      const name = (el.name || '').toLowerCase();
      const id = (el.id || '').toLowerCase();
      const placeholder = (el.placeholder || '').toLowerCase();
      return (
        name === 'name' ||
        name === 'fullname' ||
        name === 'firstname' ||
        name === 'lastname' ||
        id === 'regname' ||
        id === 'name' ||
        placeholder.includes('name')
      );
    }

    function isPhoneInput(el) {
      if (!el || el.tagName !== 'INPUT') return false;
      const name = (el.name || '').toLowerCase();
      const id = (el.id || '').toLowerCase();
      const type = (el.type || '').toLowerCase();
      const placeholder = (el.placeholder || '').toLowerCase();
      return (
        type === 'tel' ||
        name === 'phone' ||
        name === 'phonenumber' ||
        name === 'mobile' ||
        id === 'phone' ||
        placeholder.includes('phone') ||
        placeholder.includes('mobile')
      );
    }

    // 1. Prevent typing prohibited characters
    document.addEventListener('keypress', function (e) {
      const target = e.target;
      if (isNameInput(target)) {
        // Disallow numbers (0-9)
        if (/[0-9]/.test(e.key)) {
          e.preventDefault();
          return false;
        }
      } else if (isPhoneInput(target)) {
        // Disallow alphabets (a-z, A-Z)
        if (/[a-zA-Z]/.test(e.key)) {
          e.preventDefault();
          return false;
        }
      }
    }, true);

    // 2. Immediate sanitization on input (handles paste, drag-and-drop, autofill)
    document.addEventListener('input', function (e) {
      const target = e.target;
      if (isNameInput(target)) {
        if (/[0-9]/.test(target.value)) {
          target.value = target.value.replace(/[0-9]/g, '');
        }
      } else if (isPhoneInput(target)) {
        if (/[a-zA-Z]/.test(target.value)) {
          target.value = target.value.replace(/[a-zA-Z]/g, '');
        }
      }
    }, true);
  }

  // Expose globally
  window.StacklyAuth = {
    ROLE_CONFIGS,
    getCurrentUser,
    setCurrentUser,
    logoutUser,
    validateEmail,
    validatePassword,
    updateHeaderAuthUI,
    update404UI,
    setupContentButtons404Routing,
    setupInputValidationRestrictions
  };

  // Mobile Sticky Navigation Enhancer
  function initMobileStickyNav() {
    const header = document.querySelector('.main-header');
    if (!header) return;

    function onScroll() {
      if (window.innerWidth <= 1199) {
        if (window.pageYOffset > 10) {
          header.classList.add('mobile-nav-scrolled');
        } else {
          header.classList.remove('mobile-nav-scrolled');
        }
      } else {
        header.classList.remove('mobile-nav-scrolled');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
  }

  // Run on DOM loaded, window load, and after a brief delay for sticky cloned header
  document.addEventListener('DOMContentLoaded', function () {
    updateHeaderAuthUI();
    update404UI();
    setupContentButtons404Routing();
    setupInputValidationRestrictions();
    initMobileStickyNav();
  });
  window.addEventListener('load', function () {
    updateHeaderAuthUI();
    update404UI();
    setupContentButtons404Routing();
    setupInputValidationRestrictions();
    initMobileStickyNav();
  });
  setTimeout(function () {
    updateHeaderAuthUI();
    update404UI();
  }, 400);
  setTimeout(function () {
    updateHeaderAuthUI();
    update404UI();
  }, 1000);
})();


