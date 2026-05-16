export function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

export function setDiceValue(cube, value) {
  cube.dataset.value = String(value);
  const transforms = {
    1: "rotateX(-18deg) rotateY(22deg)",
    2: "rotateX(92deg) rotateY(16deg)",
    3: "rotateX(-14deg) rotateY(-70deg)",
    4: "rotateX(-14deg) rotateY(110deg)",
    5: "rotateX(-104deg) rotateY(18deg)",
    6: "rotateX(-18deg) rotateY(202deg)"
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
