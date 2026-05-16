const CURRENT_GAME_KEY = "myChildGame.currentGame";
const RESULTS_KEY = "myChildGame.results";

export function saveCurrentGame(game) {
  localStorage.setItem(CURRENT_GAME_KEY, JSON.stringify(game));
}

export function loadCurrentGame() {
  const raw = localStorage.getItem(CURRENT_GAME_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(CURRENT_GAME_KEY);
    return null;
  }
}

export function clearCurrentGame() {
  localStorage.removeItem(CURRENT_GAME_KEY);
}

export function saveResult(result) {
  const results = loadResults();
  results.unshift(result);
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results.slice(0, 30)));
}

export function loadResults() {
  const raw = localStorage.getItem(RESULTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(RESULTS_KEY);
    return [];
  }
}
