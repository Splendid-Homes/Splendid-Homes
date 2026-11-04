/**
 * Geometry for the stylised Dubai map (homepage round 2, item 10). A simple local projection of
 * latitude/longitude onto a 1000-wide viewBox (longitude scaled by cos(latitude), so distances
 * look right), plus hand-traced, deliberately simplified lines: coastline, Palm Jumeirah,
 * Dubai Creek and the two main roads. Pins use the real coordinates stored in the CMS.
 */
const LNG_MIN = 55.02, LNG_MAX = 55.4, LAT_MIN = 25.0, LAT_MAX = 25.315;
export const MAP_W = 1000;
const KM_PER_DEG_LAT = 111, KM_PER_DEG_LNG = 111 * Math.cos((25.15 * Math.PI) / 180);
export const MAP_H = Math.round((MAP_W * ((LAT_MAX - LAT_MIN) * KM_PER_DEG_LAT)) / ((LNG_MAX - LNG_MIN) * KM_PER_DEG_LNG));

type LatLng = [number, number];
export const project = ([lat, lng]: LatLng): [number, number] => [
  +(((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * MAP_W).toFixed(1),
  +(((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * MAP_H).toFixed(1),
];
const line = (pts: LatLng[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${project(p).join(' ')}`).join('');

const COAST: LatLng[] = [
  [25.0, 55.03], [25.03, 55.07], [25.06, 55.11], [25.085, 55.135], [25.1, 55.15], [25.115, 55.165], [25.13, 55.18],
  [25.141, 55.188], [25.16, 55.205], [25.185, 55.235], [25.21, 55.252], [25.235, 55.262], [25.255, 55.27],
  [25.268, 55.29], [25.275, 55.3], [25.285, 55.315], [25.295, 55.335], [25.305, 55.355], [25.31, 55.38], [25.31, 55.4],
];
const CREEK: LatLng[] = [[25.268, 55.29], [25.262, 55.3], [25.25, 55.315], [25.235, 55.325], [25.215, 55.335], [25.2, 55.338], [25.19, 55.345]];
const SZR: LatLng[] = [[25.01, 55.075], [25.045, 55.115], [25.075, 55.15], [25.1, 55.18], [25.13, 55.21], [25.16, 55.24], [25.19, 55.265], [25.215, 55.28], [25.235, 55.286]];
const AL_KHAIL: LatLng[] = [[25.03, 55.17], [25.07, 55.205], [25.11, 55.24], [25.15, 55.27], [25.18, 55.3], [25.2, 55.318]];

/** Palm Jumeirah: trunk, fronds either side and the crescent arcing round the tip. */
function palm() {
  const [bx, by] = project([25.104, 55.156]), [tx, ty] = project([25.126, 55.13]);
  const dx = tx - bx, dy = ty - by, len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
  const f = (v: number) => v.toFixed(1);
  let d = `M${bx} ${by}L${tx} ${ty}`;
  for (let i = 0; i < 8; i++) {
    const t = 0.28 + i * 0.1, px = bx + dx * t, py = by + dy * t, reach = 44 - i * 3;
    for (const s of [1, -1]) d += `M${f(px)} ${f(py)}l${f(nx * reach * s + ux * 10)} ${f(ny * reach * s + uy * 10)}`;
  }
  // Crescent: an arc around the palm's centre, open towards the shore.
  const cx = bx + dx * 0.62, cy = by + dy * 0.62, r = len * 0.78;
  const at = (deg: number) => {
    const a = (deg * Math.PI) / 180, c = Math.cos(a), sn = Math.sin(a);
    return [cx + r * (ux * c - uy * sn), cy + r * (uy * c + ux * sn)];
  };
  const [sx, sy] = at(-118), [ex, ey] = at(118);
  return `${d}M${f(sx)} ${f(sy)}A${f(r)} ${f(r)} 0 1 1 ${f(ex)} ${f(ey)}`;
}

/** The World islands: a loose scatter of dots offshore. */
const WORLD = Array.from({ length: 26 }, (_, i) => {
  const a = i * 2.39996, r = 0.006 * Math.sqrt(i + 1);
  return project([25.222 + r * Math.sin(a), 55.17 + r * 1.2 * Math.cos(a)]);
});

export const MAP = {
  coast: line(COAST),
  // Land: everything south-east of the coastline.
  land: `${line(COAST)}L${MAP_W} ${MAP_H}L0 ${MAP_H}Z`,
  // Sea: everything north-west of the coastline.
  sea: `${line(COAST)}L${project([LAT_MAX, LNG_MIN]).join(' ')}L${project([LAT_MIN, LNG_MIN]).join(' ')}Z`,
  creek: line(CREEK),
  roads: [line(SZR), line(AL_KHAIL)],
  palm: palm(),
  world: WORLD,
};
