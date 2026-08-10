export const gcd = (a, b) => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
};
export const rand = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
export const shuffle = (a) => {
  const result = [...a];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
export const decimalScale = (n) => {
  const s = String(n);
  return s.includes(".") ? 10 ** s.split(".")[1].length : 1;
};
export const integerRatio = (a, b) => {
  const scale = Math.max(decimalScale(a), decimalScale(b));
  return [Math.round(a * scale), Math.round(b * scale)];
};
export const reduceRatio = (a, b) => {
  const [x, y] = integerRatio(a, b),
    d = gcd(x, y);
  return [x / d, y / d];
};
export const sameRatio = (a, b, c, d) => {
  const [x, y] = integerRatio(a, b),
    [u, v] = integerRatio(c, d);
  return x * v === y * u;
};
export const compareRatio = (a, b, c, d) => {
  const [x, y] = integerRatio(a, b),
    [u, v] = integerRatio(c, d);
  return x * v === y * u ? 0 : x * v < u * y ? -1 : 1;
};
export const formatRatio = (a, b) => `${a}：${b}`;
export const fraction = (a, b) => {
  const [x, y] = reduceRatio(a, b);
  return { n: x, d: y };
};
export const isReduced = (n, d) => gcd(n, d) === 1;
export const distinctBases = (count) => {
  const pool = [
    [1, 2],
    [2, 3],
    [3, 4],
    [3, 5],
    [4, 5],
    [5, 6],
    [5, 7],
    [7, 8],
    [2, 5],
    [3, 7],
  ];
  return shuffle(pool).slice(0, count);
};
export const ratioVariant = ([a, b], mult = 1, decimal = false) =>
  decimal
    ? [((a * mult) / 10).toFixed(1), ((b * mult) / 10).toFixed(1)]
    : [a * mult, b * mult];
export const nearMiss = ([a, b], mult = 2) => [
  a * mult,
  b * mult + (Math.random() < 0.5 ? -1 : 1),
];
