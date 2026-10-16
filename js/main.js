document.addEventListener("DOMContentLoaded", function () {
  // Mobile menu toggle
  var menuButton = document.getElementById("menu-toggle");
  var mobileNav = document.getElementById("mobile-nav");

  if (menuButton && mobileNav) {
    function setMenuOpen(isOpen) {
      mobileNav.classList.toggle("is-open", isOpen);
      mobileNav.setAttribute("aria-hidden", String(!isOpen));
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.querySelector(".material-symbols-outlined").textContent =
        isOpen ? "close" : "menu";
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
  var motionButton = document.querySelector(".identity-toggle");

  if (identityStrip && motionButton) {
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var isPaused = false;

    function updateIdentityMotion() {
      identityStrip.dataset.animated = String(!reducedMotion.matches);
      identityStrip.dataset.paused = String(isPaused);
      motionButton.hidden = reducedMotion.matches;
      motionButton.setAttribute("aria-pressed", String(isPaused));
    }

    motionButton.addEventListener("click", function () {
      isPaused = !isPaused;
      updateIdentityMotion();
    });

    reducedMotion.addEventListener("change", updateIdentityMotion);
    updateIdentityMotion();
  }

  // Contact form: open the visitor's email client with a prefilled message
  var contactForm = document.getElementById("contact-form");
  var contactSuccess = document.getElementById("contact-success");

  if (contactForm && contactSuccess) {
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = contactForm.elements["name"].value;
      var email = contactForm.elements["email"].value;
      var message = contactForm.elements["message"].value;

      var subject = "Portfolio contact from " + name;
      var body =
        message + "\n\n---\nFrom: " + name + " (" + email + ")";
      var mailtoLink =
        "mailto:muhammedrinshidvpr@gmail.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = mailtoLink;

      contactForm.reset();
      contactForm.classList.add("hidden");
      contactSuccess.classList.add("is-visible");
    });
  }
});
