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
      window.location.href = 'login.html';
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
  // 1. Name fields: NO NUMBERS allowed (0-9 blocked on keydown, beforeinput, input & paste)
  // 2. Number/Phone fields: NO ALPHABETS allowed (a-zA-Z blocked on keydown, beforeinput, input & paste)
  // --------------------------------------------------------------------------
  function setupInputValidationRestrictions() {
    function getAssociatedLabelText(el) {
      if (!el) return '';
      let text = '';
      if (el.id) {
        try {
          const lbl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
          if (lbl) text = lbl.textContent || '';
        } catch (_) {}
      }
      if (!text) {
        let prev = el.previousElementSibling;
        while (prev) {
          if (prev.tagName === 'LABEL') {
            text = prev.textContent || '';
            break;
          }
          prev = prev.previousElementSibling;
        }
      }
      if (!text) {
        const parent = el.closest('.auth-form-group, .dash-form-row > div, .dash-form-group, .form-group, div');
        if (parent) {
          const lbl = parent.querySelector('label');
          if (lbl && !lbl.contains(el)) text = lbl.textContent || '';
        }
      }
      return text.trim().toLowerCase();
    }

    function isNameInput(el) {
      if (!el || el.tagName !== 'INPUT') return false;
      const type = (el.type || 'text').toLowerCase();
      if (['password', 'email', 'checkbox', 'radio', 'submit', 'button', 'file', 'hidden', 'date', 'number', 'tel'].includes(type)) {
        return false;
      }

      const id = (el.id || '').toLowerCase();
      const name = (el.name || '').toLowerCase();
      const placeholder = (el.placeholder || '').toLowerCase();
      const dataType = (el.dataset.type || '').toLowerCase();
      const autocomplete = (el.autocomplete || '').toLowerCase();
      const labelText = getAssociatedLabelText(el);

      if (dataType === 'name') return true;

      // Exclude platform / clinic / branch / business names
      const isExcluded =
        labelText.includes('platform') ||
        labelText.includes('legal') ||
        labelText.includes('clinic') ||
        labelText.includes('branch') ||
        labelText.includes('headline') ||
        labelText.includes('subject') ||
        labelText.includes('directive') ||
        labelText.includes('service') ||
        labelText.includes('treatment') ||
        labelText.includes('file');

      if (isExcluded) return false;

      return (
        id === 'regname' ||
        id === 'profilename' ||
        id === 'profilefullname' ||
        id.includes('fullname') ||
        name === 'name' ||
        name === 'fullname' ||
        name === 'firstname' ||
        name === 'lastname' ||
        name === 'leadname' ||
        name === 'managername' ||
        autocomplete === 'name' ||
        placeholder.includes('eleanor') ||
        placeholder.includes('scarlett') ||
        placeholder.includes('johansson') ||
        placeholder.includes('vance') ||
        placeholder === 'name' ||
        placeholder.includes('full name') ||
        labelText === 'name' ||
        labelText.includes('full name') ||
        labelText.includes('lead name') ||
        labelText.includes('manager full name') ||
        labelText.includes('signing manager') ||
        labelText.includes('assigned consultant') ||
        labelText.includes('patient name') ||
        labelText.includes('your name')
      );
    }

    function isPhoneOrNumberInput(el) {
      if (!el || el.tagName !== 'INPUT') return false;
      const type = (el.type || 'text').toLowerCase();
      if (['password', 'email', 'checkbox', 'radio', 'submit', 'button', 'file', 'hidden'].includes(type)) {
        return false;
      }

      const id = (el.id || '').toLowerCase();
      const name = (el.name || '').toLowerCase();
      const placeholder = (el.placeholder || '').toLowerCase();
      const dataType = (el.dataset.type || '').toLowerCase();
      const inputmode = (el.inputMode || '').toLowerCase();
      const labelText = getAssociatedLabelText(el);

      if (dataType === 'phone' || dataType === 'number') return true;
      if (type === 'tel' || type === 'number') return true;
      if (inputmode === 'numeric' || inputmode === 'tel' || inputmode === 'decimal') return true;

      return (
        id.includes('phone') ||
        id.includes('mobile') ||
        id.includes('tel') ||
        id.includes('hotline') ||
        name.includes('phone') ||
        name.includes('mobile') ||
        name.includes('tel') ||
        placeholder.includes('phone') ||
        placeholder.includes('mobile') ||
        placeholder.includes('(555)') ||
        placeholder.includes('000-0000') ||
        labelText.includes('phone') ||
        labelText.includes('mobile') ||
        labelText.includes('telephone') ||
        labelText.includes('hotline') ||
        (labelText.includes('number') && !labelText.includes('name'))
      );
    }

    function flashWarning(input, msg) {
      if (!input) return;
      input.classList.add('input-restriction-invalid');
      setTimeout(() => input.classList.remove('input-restriction-invalid'), 600);

      // Parent container to position toast
      const parent = input.parentElement;
      if (parent) {
        let existingToast = parent.querySelector('.input-restriction-toast');
        if (!existingToast) {
          const originalPosition = window.getComputedStyle(parent).position;
          if (originalPosition === 'static') {
            parent.style.position = 'relative';
          }
          const toast = document.createElement('div');
          toast.className = 'input-restriction-toast';
          toast.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <span>${msg}</span>`;
          parent.appendChild(toast);
          setTimeout(() => {
            if (toast && toast.parentNode) {
              toast.parentNode.removeChild(toast);
            }
          }, 1800);
        }
      }
    }

    // 1. Keydown blocker (prevents unwanted characters from being typed)
    document.addEventListener('keydown', function (e) {
      const target = e.target;
      if (!target || target.tagName !== 'INPUT') return;

      // Allow control combos (Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+Z, Meta, Alt)
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // Allow navigation and editing keys
      const safeKeys = ['Backspace', 'Delete', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
      if (safeKeys.includes(e.key)) return;

      if (isNameInput(target)) {
        // Block numbers in Name field
        if (/[0-9]/.test(e.key)) {
          e.preventDefault();
          e.stopPropagation();
          flashWarning(target, 'Numbers are not allowed in name');
          return false;
        }
      } else if (isPhoneOrNumberInput(target)) {
        // Block alphabetic characters in Phone/Number field
        if (/[a-zA-Z]/.test(e.key)) {
          e.preventDefault();
          e.stopPropagation();
          flashWarning(target, 'Alphabets are not allowed in phone/number');
          return false;
        }
      }
    }, true);

    // 2. Beforeinput blocker (modern browsers, mobile virtual keyboards)
    document.addEventListener('beforeinput', function (e) {
      const target = e.target;
      if (!target || target.tagName !== 'INPUT') return;

      if (e.data) {
        if (isNameInput(target) && /[0-9]/.test(e.data)) {
          e.preventDefault();
          flashWarning(target, 'Numbers are not allowed in name');
          return false;
        }
        if (isPhoneOrNumberInput(target) && /[a-zA-Z]/.test(e.data)) {
          e.preventDefault();
          flashWarning(target, 'Alphabets are not allowed in phone/number');
          return false;
        }
      }
    }, true);

    // 3. Input sanitizer (handles paste, drag-and-drop, browser autofill)
    document.addEventListener('input', function (e) {
      const target = e.target;
      if (!target || target.tagName !== 'INPUT') return;

      if (isNameInput(target)) {
        if (/[0-9]/.test(target.value)) {
          const pos = target.selectionStart;
          target.value = target.value.replace(/[0-9]/g, '');
          if (pos !== null) {
            const newPos = Math.max(0, pos - 1);
            target.setSelectionRange(newPos, newPos);
          }
          flashWarning(target, 'Numbers are not allowed in name');
        }
      } else if (isPhoneOrNumberInput(target)) {
        if (/[a-zA-Z]/.test(target.value)) {
          const pos = target.selectionStart;
          target.value = target.value.replace(/[a-zA-Z]/g, '');
          if (pos !== null) {
            const newPos = Math.max(0, pos - 1);
            target.setSelectionRange(newPos, newPos);
          }
          flashWarning(target, 'Alphabets are not allowed in phone/number');
        }
      }
    }, true);

    // 4. Paste interceptor (strips disallowed characters upon paste)
    document.addEventListener('paste', function (e) {
      const target = e.target;
      if (!target || target.tagName !== 'INPUT') return;

      const pastedData = (e.clipboardData || window.clipboardData)?.getData('text') || '';
      if (!pastedData) return;

      if (isNameInput(target) && /[0-9]/.test(pastedData)) {
        e.preventDefault();
        const cleaned = pastedData.replace(/[0-9]/g, '');
        document.execCommand('insertText', false, cleaned);
        flashWarning(target, 'Numbers removed from pasted text');
      } else if (isPhoneOrNumberInput(target) && /[a-zA-Z]/.test(pastedData)) {
        e.preventDefault();
        const cleaned = pastedData.replace(/[a-zA-Z]/g, '');
        document.execCommand('insertText', false, cleaned);
        flashWarning(target, 'Alphabets removed from pasted text');
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

  // Active Navigation Highlighter: Guarantees active page is prominently marked in mobile & desktop nav
  function ensureActiveNavLinks() {
    let path = window.location.pathname;
    let fileName = path.substring(path.lastIndexOf('/') + 1);
    if (!fileName || fileName === '' || fileName === '/') {
      fileName = 'index.html';
    }
    fileName = fileName.split('#')[0].split('?')[0];

    const menuLists = document.querySelectorAll('.main-menu__list');
    menuLists.forEach(menu => {
      const items = menu.querySelectorAll(':scope > li');
      let matched = false;
      items.forEach(li => {
        const anchor = li.querySelector(':scope > a');
        if (anchor) {
          const rawHref = anchor.getAttribute('href') || '';
          const cleanHref = rawHref.replace(/^(\.\/|\/)/, '').split('#')[0].split('?')[0];
          const isMatch = cleanHref === fileName || (fileName === 'index.html' && (cleanHref === 'index.html' || cleanHref === '' || cleanHref === '/'));
          if (isMatch) {
            li.classList.add('current');
            matched = true;
          } else {
            li.classList.remove('current');
          }
        }
      });
      // Fallback for homepage
      if (!matched && (fileName === 'index.html' || fileName === '') && items.length > 0) {
        items[0].classList.add('current');
      }
    });
  }

  // Hook into mobile menu toggler to re-evaluate active item upon opening
  document.addEventListener('click', function (e) {
    if (e.target.closest('.mobile-nav__toggler')) {
      setTimeout(ensureActiveNavLinks, 50);
      setTimeout(ensureActiveNavLinks, 200);
    }
  });

  // Auto-close mobile navigation drawer when resizing/switching to desktop view (>= 1200px)
  function handleNavResize() {
    if (window.innerWidth >= 1200) {
      const mobileNav = document.querySelector('.mobile-nav__wrapper');
      if (mobileNav && mobileNav.classList.contains('expanded')) {
        mobileNav.classList.remove('expanded');
      }
      if (document.body.classList.contains('locked')) {
        document.body.classList.remove('locked');
      }
    }
  }

  window.addEventListener('resize', handleNavResize, { passive: true });

  // Floating Up Arrow Scroll-To-Top Controller
  function initScrollToTop() {
    const btns = document.querySelectorAll('.scroll-to-top, .scroll-to-target');
    if (!btns.length) return;

    btns.forEach(btn => {
      btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
      btn.setAttribute('aria-label', 'Scroll to top');
      btn.setAttribute('title', 'Scroll to top');

      btn.onclick = function (e) {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      };
    });

    function checkScroll() {
      const show = window.pageYOffset > 250;
      btns.forEach(btn => {
        if (show) {
          btn.classList.add('show');
        } else {
          btn.classList.remove('show');
        }
      });
    }

    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
  }

  // Run on DOM loaded, window load, and after a brief delay for sticky cloned header
  document.addEventListener('DOMContentLoaded', function () {
    handleNavResize();
    updateHeaderAuthUI();
    ensureActiveNavLinks();
    update404UI();
    setupContentButtons404Routing();
    setupInputValidationRestrictions();
    initMobileStickyNav();
    initScrollToTop();
  });
  window.addEventListener('load', function () {
    handleNavResize();
    updateHeaderAuthUI();
    ensureActiveNavLinks();
    update404UI();
    setupContentButtons404Routing();
    setupInputValidationRestrictions();
    initMobileStickyNav();
    initScrollToTop();
  });
  setTimeout(function () {
    updateHeaderAuthUI();
    ensureActiveNavLinks();
    update404UI();
    initScrollToTop();
  }, 400);
  setTimeout(function () {
    updateHeaderAuthUI();
    ensureActiveNavLinks();
    update404UI();
    initScrollToTop();
  }, 1000);
})();


