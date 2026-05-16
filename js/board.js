export const MAPS = [
  {
    id: "sunny-trail",
    name: "Солнечная тропа",
    mapImage: "images/maps/sunny-trail.png",
    previewImage: "images/preview-maps/sunny-trail.png",
    // Centers of visible steps on the numbered garden map, in [x%, y%] order from 1 to 36.
    cells: [
      [32.4, 87.1],
      [37.5, 82.4],
      [37.7, 75.0],
      [33.4, 68.9],
      [29.2, 63.5],
      [25.2, 57.6],
      [22.3, 50.8],
      [23.0, 43.2],
      [24.9, 33.3],
      [29.9, 30.3],
      [38.5, 29.8],
      [46.0, 30.8],
      [51.0, 36.6],
      [52.7, 41.5],
      [52.9, 49.7],
      [50.8, 57.0],
      [48.0, 65.1],
      [47.1, 74.0],
      [46.6, 81.6],
      [50.4, 87.3],
      [55.2, 85.2],
      [57.7, 78.8],
      [58.9, 69.8],
      [60.7, 62.4],
      [67.4, 61.0],
      [73.9, 59.0],
      [81.5, 59.4],
      [89.2, 57.7],
      [83.7, 53.5],
      [77.3, 50.7],
      [71.0, 48.5],
      [65.2, 43.5],
      [61.4, 36.3],
      [60.5, 29.6],
      [61.3, 20.6],
      [66.6, 15.7]
    ],
    bonuses: { 2: 2, 5: 2, 8: 2, 13: 2, 16: 2, 23: 2, 30: 2, 33: 2 },
    penalties: { 10: -2, 18: -2, 27: -2, 31: -2 }
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
