const KEY = "ratioPark.v1";
const fresh = () => ({
  best: {},
  plays: 0,
  correct: 0,
  wrong: 0,
  maxCombo: 0,
  weaknesses: {},
  sound: false,
});
export const read = () => {
  try {
    return { ...fresh(), ...JSON.parse(localStorage.getItem(KEY)) };
  } catch {
    return fresh();
  }
};
export const write = (data) => localStorage.setItem(KEY, JSON.stringify(data));
export const best = (game, level) => read().best?.[game]?.[level] || 0;
export const record = ({ game, level, score, correct, wrong, maxCombo }) => {
  const d = read();
  const old = d.best?.[game]?.[level] || 0;
  d.best[game] ??= {};
  d.best[game][level] = Math.max(old, score);
  d.plays++;
  d.correct += correct;
  d.wrong += wrong;
  d.maxCombo = Math.max(d.maxCombo, maxCombo);
  write(d);
  return { old, isNew: score > old, best: d.best[game][level] };
};
export const recordAttempt = ({
  game,
  level,
  questionType = "general",
  target = "",
  correct,
}) => {
  const d = read();
  const key = `${game}:${level}:${questionType}`;
  const item = d.weaknesses[key] || { wrong: 0, right: 0, target };
  item.target = target || item.target;
  if (correct) item.right++;
  else item.wrong++;
  d.weaknesses[key] = item;
  write(d);
};
const tips = {
  sameRatio: "両方を同じ数でかけたり、わったりして、同じ比を見つけよう！",
  simplifyRatio: "両方を同じ数でわって、いちばん簡単な比にしよう！",
  ratioValue: "比の値は「前の数 ÷ 後ろの数」。最後に約分も確かめよう！",
  memoryRatio: "カードの比を、両方同じ数でわった形にして見くらべよう！",
  fakeRatio: "両方に同じ数をかけているか、わっているかを確かめよう！",
  missingRatio: "対応する数が、同じ数倍になっているかを見つけよう！",
  compareRatio: "比の値を「前の数 ÷ 後ろの数」でくらべよう！",
  ratioChain: "両方に同じ数をかけたり、わったりして、比をつなごう！",
};
export const growthTip = () => {
  const d = read();
  const entries = Object.entries(d.weaknesses)
    .map(([key, v]) => ({
      key,
      ...(typeof v === "number" ? { wrong: v, right: 0 } : v),
    }))
    .filter((x) => x.wrong > x.right);
  if (!entries.length) return "いろいろな比にチャレンジしてみよう！";
  const top = entries.sort(
    (a, b) => b.wrong - b.right - (a.wrong - a.right),
  )[0];
  const [game, , questionType] = top.key.split(":");
  if (questionType?.includes("decimal")) {
    return "小数の比は、両方を10倍して整数の比にしてから考えよう！";
  }
  return tips[game] || "いろいろな比にチャレンジしてみよう！";
};
export const reset = () => {
  localStorage.removeItem(KEY);
  localStorage.removeItem("ratioPark.badges.v1");
};
