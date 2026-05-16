export function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

export function setDiceValue(cube, value) {
  cube.dataset.value = String(value);
  const transforms = {
    1: "translate3d(-50%, -50%, 0) rotate(-8deg)",
    2: "translate3d(-50%, -50%, 0) rotate(4deg)",
    3: "translate3d(-50%, -50%, 0) rotate(-5deg)",
    4: "translate3d(-50%, -50%, 0) rotate(7deg)",
    5: "translate3d(-50%, -50%, 0) rotate(-10deg)",
    6: "translate3d(-50%, -50%, 0) rotate(3deg)"
  };
  cube.style.transform = transforms[value] || transforms[1];
}

export function animateDice(cube, value) {
  const duration = 2000 + Math.floor(Math.random() * 4001);
  cube.style.setProperty("--roll-duration", `${duration}ms`);
  cube.classList.remove("rolling");
  void cube.offsetWidth;
  cube.classList.add("rolling");
  return new Promise((resolve) => {
    window.setTimeout(() => {
      cube.classList.remove("rolling");
      setDiceValue(cube, value);
      resolve();
    }, duration);
  });
}
