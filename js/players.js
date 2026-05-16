export const AVATARS = [
  "images/avatars/avatar-1.png",
  "images/avatars/avatar-2.png",
  "images/avatars/avatar-3.png",
  "images/avatars/avatar-4.png",
  "images/avatars/avatar-5.png",
  "images/avatars/avatar-6.png"
];

export function createDefaultPlayers() {
  return [
    createPlayer(1, "Игрок 1", AVATARS[0]),
    createPlayer(2, "Игрок 2", AVATARS[1])
  ];
}

export function createPlayer(index, name = `Игрок ${index}`, avatar = AVATARS[(index - 1) % AVATARS.length]) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    name,
    avatar,
    position: 0,
    score: 0,
    skippedTurns: 0
  };
}

export function normalizePlayers(players) {
  return players
    .map((player, index) => ({
      ...player,
      name: player.name.trim() || `Игрок ${index + 1}`,
      avatar: player.avatar || AVATARS[index % AVATARS.length],
      position: Number(player.position) || 0,
      score: Number(player.score) || 0,
      skippedTurns: Number(player.skippedTurns) || 0
    }))
    .filter((player) => player.name);
}

export function sortLeaders(players) {
  return [...players].sort((a, b) => b.position - a.position || b.score - a.score || a.name.localeCompare(b.name, "ru"));
}
