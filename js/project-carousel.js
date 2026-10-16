document.addEventListener("DOMContentLoaded", function () {
  var carousel = document.querySelector(".project-carousel");
  if (!carousel) return;

  var stage = carousel.querySelector(".project-stage");
  var slides = Array.from(carousel.querySelectorAll(".project-slide"));
  var navigation = carousel.querySelector(".project-navigation");
  var dots = Array.from(carousel.querySelectorAll("[data-project-to]"));
  var status = carousel.querySelector(".project-status");
  if (!stage || slides.length < 2 || !navigation || !status) return;

  var activeIndex = 0;
  var gesture = null;
  var suppressCardClick = false;

  function resetDrag() {
    stage.dataset.dragging = "false";
    stage.style.removeProperty("--project-drag");
    stage.style.removeProperty("--project-tilt");
    gesture = null;
  }

  function selectProject(index) {
    activeIndex = (index + slides.length) % slides.length;
    resetDrag();

    slides.forEach(function (slide, position) {
      var isActive = position === activeIndex;
      // Never leave keyboard focus inside content that is about to become inert.
      if (!isActive && slide.contains(document.activeElement)) {
        carousel.focus({ preventScroll: true });
      }
      slide.dataset.position = isActive
        ? "active"
        : position === (activeIndex + 1) % slides.length ? "next" : "previous";
      slide.inert = !isActive;
      slide.setAttribute("aria-hidden", String(!isActive));
    });

    dots.forEach(function (dot, index) {
      dot.setAttribute("aria-pressed", String(index === activeIndex));
    });
    var title = slides[activeIndex].querySelector("h3").textContent;
    status.textContent = (activeIndex + 1) + " / " + slides.length + " — " + title;
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      selectProject(Number(dot.dataset.projectTo));
    });
  });

  carousel.querySelectorAll(".project-card-next").forEach(function (button) {
    button.addEventListener("click", function (event) {
      if (event.detail > 0 && suppressCardClick) {
        suppressCardClick = false;
        return;
      }
      suppressCardClick = false;
      selectProject(activeIndex + 1);
    });
    button.hidden = false;
  });

  carousel.addEventListener("keydown", function (event) {
    if (event.target !== carousel) return;
    var destination;
    if (event.key === "ArrowLeft") destination = activeIndex - 1;
    else if (event.key === "ArrowRight") destination = activeIndex + 1;
    else if (event.key === "Home") destination = 0;
    else if (event.key === "End") destination = slides.length - 1;
    else return;
    event.preventDefault();
    selectProject(destination);
  });

  stage.addEventListener("pointerdown", function (event) {
    if (!event.isPrimary || event.button !== 0 || !event.target.closest(".project-face")) return;
    suppressCardClick = false;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, delta: 0, horizontal: false };
  });

  stage.addEventListener("pointermove", function (event) {
    if (!gesture || event.pointerId !== gesture.id) return;
    var deltaX = event.clientX - gesture.x;
    var deltaY = event.clientY - gesture.y;
    if (!gesture.horizontal) {
      if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) suppressCardClick = true;
      if (Math.abs(deltaY) > 10 && Math.abs(deltaY) > Math.abs(deltaX)) {
        gesture.delta = deltaX;
        return;
      }
      if (Math.abs(deltaX) < 10 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
      gesture.horizontal = true;
      suppressCardClick = true;
      stage.setPointerCapture(event.pointerId);
      stage.dataset.dragging = "true";
    }
    gesture.delta = deltaX;
    // A little resistance keeps the rear cards visible during a drag.
    var offset = Math.max(-120, Math.min(120, deltaX * 0.65));
    stage.style.setProperty("--project-drag", offset + "px");
    stage.style.setProperty("--project-tilt", (offset / 24) + "deg");
    if (event.cancelable) event.preventDefault();
  });

  stage.addEventListener("pointerup", function (event) {
    if (!gesture || event.pointerId !== gesture.id) return;
    var delta = gesture.delta;
    var shouldChange = gesture.horizontal && Math.abs(delta) > Math.min(72, stage.clientWidth * 0.18);
    resetDrag();
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    if (shouldChange) selectProject(activeIndex + (delta < 0 ? 1 : -1));
  });

  stage.addEventListener("pointercancel", resetDrag);
  stage.addEventListener("lostpointercapture", function (event) {
    // Touch starts with implicit capture on the image. Its loss bubbles when we
    // transfer capture to the stage; only losing the stage's own capture cancels.
    if (event.target === stage && gesture && event.pointerId === gesture.id) resetDrag();
  });

  function selectFromHash() {
    var target = document.getElementById(window.location.hash.slice(1));
    var slide = target && target.closest(".project-slide");
    if (slide) selectProject(slides.indexOf(slide));
  }

  carousel.tabIndex = 0;
  carousel.setAttribute("aria-roledescription", "carousel");
  carousel.dataset.ready = "true";
  navigation.hidden = false;
  selectProject(0);
  selectFromHash();
  window.addEventListener("hashchange", selectFromHash);
});
