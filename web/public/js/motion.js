particlesJS("particles-js", {
  particles: {
    number: { value: 40 },
    color: { value: "#7c7cff" },
    opacity: { value: 0.15 },
    size: { value: 2 },
    move: { speed: 0.4 }
  }
});
document.querySelectorAll(".dashboard-card").forEach((card, i) => {
  card.style.opacity = 0;
  card.style.transform = "translateY(20px)";
  setTimeout(() => {
    card.style.transition = "0.6s ease";
    card.style.opacity = 1;
    card.style.transform = "translateY(0)";
  }, i * 120);
});
