export const AVATAR_GROUPS = [
  {
    id: "teona",
    name: "Теона",
    prefix: "t",
    avatars: [
      "images/avatars/t-avatar-1.png",
      "images/avatars/t-avatar-2.png",
      "images/avatars/t-avatar-3.png",
      "images/avatars/t-avatar-4.png",
      "images/avatars/t-avatar-5.png",
      "images/avatars/t-avatar-6.png"
    ]
  },
  {
    id: "mama",
    name: "Мама",
    prefix: "m",
    avatars: [
      "images/avatars/m-avatar-1.png",
      "images/avatars/m-avatar-2.png",
      "images/avatars/m-avatar-3.png",
      "images/avatars/m-avatar-4.png"
    ]
  },
  {
    id: "papa",
    name: "Папа",
    prefix: "p",
    avatars: [
      "images/avatars/p-avatar-1.png",
      "images/avatars/p-avatar-2.png",
      "images/avatars/p-avatar-3.png",
      "images/avatars/p-avatar-4.png"
    ]
  },
  {
    id: "guest",
    name: "Гость",
    prefix: "g",
    avatars: [
      "images/avatars/g-avatar-1.png",
      "images/avatars/g-avatar-2.png",
      "images/avatars/g-avatar-3.png",
      "images/avatars/g-avatar-4.png"
    ]
  }
];

export const AVATARS = AVATAR_GROUPS.flatMap((group) => group.avatars);

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
      avatar: normalizeAvatarPath(player.avatar) || AVATARS[index % AVATARS.length],
      position: Number(player.position) || 0,
      score: Number(player.score) || 0,
      skippedTurns: Number(player.skippedTurns) || 0
    }))
    .filter((player) => player.name);
}

export function sortLeaders(players) {
  return [...players].sort((a, b) => b.position - a.position || b.score - a.score || a.name.localeCompare(b.name, "ru"));
}

function normalizeAvatarPath(avatar) {
  if (!avatar) return "";
  return avatar.replace(/^images\/avatars\/avatar-(\d+)\.png$/, "images/avatars/t-avatar-$1.png");
}
