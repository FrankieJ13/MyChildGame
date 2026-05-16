export const MAPS = [
  {
    id: "sunny-trail",
    name: "Солнечная тропа",
    mapImage: "images/maps/sunny-trail.png",
    previewImage: "images/preview-maps/sunny-trail.png",
    cells: [
      [8, 80], [16, 72], [25, 66], [35, 71], [45, 77], [56, 72], [66, 63], [76, 66],
      [87, 58], [78, 48], [68, 42], [56, 45], [46, 53], [36, 47], [27, 38], [18, 42],
      [12, 31], [22, 22], [34, 27], [45, 33], [56, 26], [67, 20], [79, 27], [90, 20]
    ],
    bonuses: { 4: 2, 11: 3, 18: 2 },
    penalties: { 8: -2, 15: -3, 21: -2 }
  },
  {
    id: "moon-park",
    name: "Лунный парк",
    mapImage: "images/maps/moon-park.png",
    previewImage: "images/preview-maps/moon-park.png",
    cells: [
      [10, 78], [19, 68], [29, 72], [39, 62], [50, 68], [60, 57], [72, 62], [84, 52],
      [75, 43], [64, 47], [54, 36], [43, 41], [33, 31], [22, 35], [14, 24], [25, 16],
      [38, 22], [50, 14], [62, 22], [74, 14], [86, 25], [76, 34], [88, 43], [92, 64]
    ],
    bonuses: { 3: 3, 10: 2, 17: 3 },
    penalties: { 6: -2, 13: -2, 20: -3 }
  }
];

export function getMapById(id) {
  return MAPS.find((map) => map.id === id) || MAPS[0];
}

export function getCell(map, index) {
  const safeIndex = Math.max(0, Math.min(index, map.cells.length - 1));
  const [x, y] = map.cells[safeIndex];
  return { x, y };
}

export function getCellEffect(map, index) {
  if (map.bonuses[index]) return { type: "bonus", steps: map.bonuses[index] };
  if (map.penalties[index]) return { type: "penalty", steps: map.penalties[index] };
  return null;
}

export function clampPosition(map, position) {
  return Math.max(0, Math.min(position, map.cells.length - 1));
}
