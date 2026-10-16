document.addEventListener("DOMContentLoaded", function () {
  // A single entrance, never replayed by scrolling or changing preferences.
  var hero = document.querySelector(".hero");
  var introMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (hero && !introMotion.matches) {
    function finishHeroIntro() {
      hero.removeEventListener("animationend", onHeroIntroEnd);
      hero.removeEventListener("animationcancel", onHeroIntroEnd);
      introMotion.removeEventListener("change", onIntroPreferenceChange);
      delete hero.dataset.introReady;
    }

    function onHeroIntroEnd(event) {
      if (event.animationName !== "hero-title-enter") return;
      if (event.type === "animationcancel" || event.target.classList.contains("hero-title-accent")) finishHeroIntro();
    }

    function onIntroPreferenceChange(event) {
      if (event.matches) finishHeroIntro();
    }

    hero.addEventListener("animationend", onHeroIntroEnd);
    hero.addEventListener("animationcancel", onHeroIntroEnd);
    introMotion.addEventListener("change", onIntroPreferenceChange);
    hero.dataset.introReady = "true";
  }

  // Mobile menu toggle
  var menuButton = document.getElementById("menu-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  if (menuButton && mobileNav) {
    function setMenuOpen(isOpen) {
      mobileNav.classList.toggle("is-open", isOpen);
      mobileNav.setAttribute("aria-hidden", String(!isOpen));
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.querySelector("use").setAttribute("href", isOpen ? "images/icons.svg#close" : "images/icons.svg#menu");
    }

    menuButton.addEventListener("click", function () {
      var isOpen = !mobileNav.classList.contains("is-open");
      setMenuOpen(isOpen);
      if (isOpen) {
        mobileNav.querySelector("a")?.focus();
      }
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuOpen(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && mobileNav.classList.contains("is-open")) {
        setMenuOpen(false);
        menuButton.focus();
      }
    });

    window.matchMedia("(min-width: 1024px)").addEventListener("change", function (event) {
      if (event.matches) setMenuOpen(false);
    });
  }

  // Motion stays static without JavaScript and respects live OS preference changes.
  var identityStrip = document.querySelector(".identity-strip");
  var motionControl = document.querySelector(".identity-window");

  if (identityStrip && motionControl) {
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var isPaused = false;

    function updateIdentityMotion() {
      identityStrip.dataset.animated = String(!reducedMotion.matches);
      identityStrip.dataset.paused = String(isPaused);
      motionControl.dataset.motionControl = String(!reducedMotion.matches);
      if (reducedMotion.matches) {
        ["role", "tabindex", "aria-label", "aria-pressed", "aria-describedby"].forEach(function (attribute) {
          motionControl.removeAttribute(attribute);
        });
      } else {
        motionControl.setAttribute("role", "button");
        motionControl.tabIndex = 0;
        motionControl.setAttribute("aria-label", "Pause scrolling text");
        motionControl.setAttribute("aria-pressed", String(isPaused));
        motionControl.setAttribute("aria-describedby", "identity-help");
      }
    }

    function toggleIdentityMotion() {
      if (reducedMotion.matches) return;
      isPaused = !isPaused;
      updateIdentityMotion();
    }

    motionControl.addEventListener("click", toggleIdentityMotion);
    motionControl.addEventListener("keydown", function (event) {
      if (!reducedMotion.matches && (event.key === " " || event.key === "Enter")) {
        event.preventDefault();
        toggleIdentityMotion();
      }
    });

    reducedMotion.addEventListener("change", updateIdentityMotion);
    updateIdentityMotion();
  }

});
