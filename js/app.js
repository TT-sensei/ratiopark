import { GameEngine } from "./gameEngine.js";
import { best, reset, read, growthTip } from "./storage.js";
import { sameRatioGame } from "./games/sameRatio.js";
import { simplifyRatioGame } from "./games/simplifyRatio.js";
import { ratioValueGame } from "./games/ratioValue.js";
import { memoryRatioGame } from "./games/memoryRatio.js";
import { sounds, soundOn, toggleSound, unlockAudio } from "./audio.js";
import { fakeRatioGame } from "./games/fakeRatio.js";
import { missingRatioGame } from "./games/missingRatio.js";
import { compareRatioGame } from "./games/compareRatio.js";
import { ratioChainGame } from "./games/ratioChain.js";
import { mountRatioLab } from "./ratioLab.js";
const app = document.querySelector("#app");
const NAVI_BASE = "https://tt-sensei.github.io/navi-character-/assets/web/characters";
function naviImage(id, pose, className = "navi-reaction-image") {
  return `<img class="${className}" src="${NAVI_BASE}/${id}/fullbody/${pose}.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" onerror="this.hidden=true">`;
}
const games = [
  sameRatioGame,
  simplifyRatioGame,
  ratioValueGame,
  memoryRatioGame,
  fakeRatioGame,
  missingRatioGame,
  compareRatioGame,
  ratioChainGame,
];
const labels = { easy: "EASY", normal: "NORMAL", hard: "HARD" };
let activeEngine = null;
const esc = (s) =>
  String(s).replace(
    /[&<>]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c],
  );
function gameHint(id, q) {
  switch (id) {
    case "sameRatio":
      return `お題は ${q.shown[0]}：${q.shown[1]}。前の数を何倍かしたなら、後ろの数も同じ倍率になっているかを見よう。`;
    case "simplifyRatio":
      return `今の比は ${q.current.join("：")}。2つの数を同じ数で割っても、比は変わらないよ。小数なら先に両方を10倍して整数にしよう。`;
    case "ratioValue":
      return `比の値は「前の数 ÷ 後ろの数」。${q.pair[0]}：${q.pair[1]}なら、${q.pair[0]}/${q.pair[1]} と分数にして、約分できるか確かめよう。`;
    case "memoryRatio":
      return "2枚の比をそれぞれ簡単にして、同じ数の組になるか見くらべよう。";
    case "fakeRatio":
      return `お題は ${q.base[0]}：${q.base[1]}。前の数だけでなく、後ろの数も同じ倍率になっているか確かめよう。`;
    case "missingRatio":
      return "□の左右にある比を見くらべよう。対応する数どうしが同じ数倍になっているかが手がかりだよ。";
    case "compareRatio":
      return `左は ${q.a[0]}÷${q.a[1]}、右は ${q.b[0]}÷${q.b[1]}。比の値を分数で表して大きさを比べよう。`;
    case "ratioChain":
      return `もとの比は ${q.base[0]}：${q.base[1]}。2つの数に同じ数をかけたり、わったりして、次の比をつなごう。`;
    default:
      return "2つの数量の関係を図や式で考えてみよう。";
  }
}
function gameProgress(id, q) {
  switch (id) {
    case "sameRatio": return "4つから選ぶ";
    case "simplifyRatio": return q.level === "hard" && !q.integerized ? "まず整数の比にする" : "ステップ " + (q.steps + 1);
    case "ratioValue": return "分数で答える";
    case "memoryRatio": return (q.cards.filter((c) => c.state === "matched").length / 2) + "/" + (q.cards.length / 2) + " ペア";
    case "fakeRatio": return "ニセモノは1つ";
    case "missingRatio": return "□の数を入力";
    case "compareRatio": return "＜・＝・＞を選ぶ";
    case "ratioChain": return Math.min(q.step + 1, 5) + "/5 CHAIN";
    default: return "正確さも大切";
  }
}
function gameSolution(id, q) {
  switch (id) {
    case "sameRatio": {
      const answer = q.choices.find((x) => x.ok)?.pair;
      return answer ? `正解は ${answer[0]}：${answer[1]}。前と後ろを同じ倍率にするのがポイント。` : "前と後ろを同じ倍率にしよう。";
    }
    case "simplifyRatio": {
      const op = q.options.find((x) => x.ok);
      if (!op) return "2つの数を同じ数で割れるか探そう。";
      return op.n === "×10" ? "小数の比は、まず両方を10倍して整数にしよう。" : `次は両方を÷${op.n}。片方だけを割らないようにしよう。`;
    }
    case "ratioValue":
      return `比の値は ${q.pair[0]}÷${q.pair[1]}。分数にして、できるだけ約分しよう。`;
    case "memoryRatio":
      return "2枚の比をそれぞれ簡単にして、同じ組になるか確かめよう。";
    case "fakeRatio": {
      const answer = q.cards.find((x) => x.fake)?.pair;
      return answer ? `ニセモノは ${answer[0]}：${answer[1]}。2つの数が同じ倍率になっていないよ。` : "2つの数が同じ倍率になっているか見よう。";
    }
    case "missingRatio":
      return `□に入る数は ${q.answer}。対応する数どうしが同じ倍率になっているか確かめよう。`;
    case "compareRatio":
      return `比の値を比べると、左 ${q.a[0]}÷${q.a[1]}、右 ${q.b[0]}÷${q.b[1]}。${q.answer < 0 ? "左が小さい" : q.answer > 0 ? "左が大きい" : "2つは等しい"}よ。`;
    case "ratioChain": {
      const answer = q.options.find((x) => x.ok)?.pair;
      return answer ? `次につながる比は ${answer[0]}：${answer[1]}。2つに同じ数をかけよう。` : "前と後ろに同じ数をかけよう。";
    }
    default:
      return "比の前と後ろの数を、同じ倍率で考えよう。";
  }
}
function bindSoundToggle() {
  const button = app.querySelector("[data-sound]");
  if (!button) return;
  button.onclick = () => {
    toggleSound();
    unlockAudio();
    button.textContent = soundOn() ? "🔊" : "🔇";
    button.setAttribute("aria-label", `効果音を${soundOn() ? "オフ" : "オン"}にする`);
  };
}
const BADGE_KEY = "ratioPark.badges.v1";
const BADGE_BASE = "https://tt-sensei.github.io/edu-assets/assets/";
const BADGES = [
  { id: "fraction-sense", name: "わける・まとめる", path: "badges/math/fraction-sense/badge.png", test: (g,l,s,r) => s.correct >= 5 },
  { id: "relationship", name: "関係発見！", path: "badges/math/relationship/badge.png", test: (g,l,s,r) => s.correct >= 8 },
  { id: "logical-thinking", name: "すじみち思考", path: "badges/math/logical-thinking/badge.png", test: (g,l,s,r) => s.maxCombo >= 5 },
  { id: "strategy", name: "作戦名人", path: "badges/math/strategy/badge.png", test: (g,l,s,r) => s.saved.isNew },
  { id: "perfect", name: "パーフェクト", path: "badges/common/perfect/badge.png", test: (g,l,s,r) => s.correct + s.wrong > 0 && s.wrong === 0 },
  { id: "mastery", name: "マスタリー", path: "badges/common/mastery/badge.png", test: (g,l,s,r) => l === "hard" && r >= 80 }
];
function readBadgeIds() {
  try { return JSON.parse(localStorage.getItem(BADGE_KEY) || "[]"); }
  catch { return []; }
}
function collectBadges(game, level, state, rate) {
  const old = readBadgeIds();
  const unlocked = BADGES.filter((b) => b.test(game, level, state, rate)).map((b) => b.id);
  const all = [...new Set([...old, ...unlocked])];
  localStorage.setItem(BADGE_KEY, JSON.stringify(all));
  return { all, newIds: unlocked.filter((id) => !old.includes(id)) };
}
function badgeMarkup(state) {
  return "<div class=\"badge-panel\"><div class=\"badge-heading\"><span>🏅 バッジコレクション</span><small>" + state.all.length + "/" + BADGES.length + " 獲得</small></div><div class=\"badge-grid\">" + BADGES.map((b) => {
    const got = state.all.includes(b.id), fresh = state.newIds.includes(b.id);
    return "<div class=\"badge-card " + (got ? "" : "locked") + (fresh ? " new" : "") + "\"><img src=\"" + BADGE_BASE + b.path + "\" alt=\"" + b.name + "\"><span>" + b.name + "</span>" + (fresh ? "<b>NEW!</b>" : "") + "</div>";
  }).join("") + "</div></div>";
}
function header() {
  return `<header class="brand"><div class="brand-mark">⚖</div><div><h1>RATIO PARK</h1><p>いろいろなゲームで、比の感覚をみがこう！</p></div><button class="sound-toggle" data-sound aria-label="効果音を${soundOn() ? "オフ" : "オン"}にする">${soundOn() ? "🔊" : "🔇"}</button></header>`;
}
function home() {
  activeEngine?.stop();
  activeEngine = null;
  const level = location.hash.match(/level=(easy|normal|hard)/)?.[1] || "easy",
    data = read(),
    icons = ["◎", "÷", "½", "🂠", "🕵", "□", "＜", "⛓"],
    words = [
      "前と後ろを同じ数倍にした比を見つける",
      "2つの数を同じ数で割って簡単にする",
      "前の数 ÷ 後ろの数を分数で表す",
      "見た目が違っても等しい比をペアにする",
      "2つの数の倍率が違う比を見抜く",
      "等しい比の□に入る数を求める",
      "比の値を計算して大きさを比べる",
      "等しい比を5回つないでいく",
    ];  app.innerHTML = `${header()}<section class="hero"><h2>比のアトラクションへ、ようこそ。</h2><p>見て、考えて、タップ！ 正確に続けるほどコンボで得点アップ。</p><div class="difficulty">${Object.entries(
    labels,
  )
    .map(
      ([k, v]) =>
        `<button class="${k === level ? "active" : ""}" data-level="${k}">${v}</button>`,
    )
    .join(
      "",
    )}</div><small>🎟 ${data.plays || 0}回プレイ　✨最高 ${data.maxCombo || 0} COMBO</small></section><section class="lab-launch"><div class="lab-launch-copy">${naviImage("kai", "hint", "lab-launch-navi")}<div><p class="eyebrow">START HERE</p><h2>比ラボで、数を動かしてみよう</h2><p>同じ比・比の値・比で分ける問題を、目で見ながらためせるよ。</p></div></div><button class="lab-launch-button" data-lab>比ラボをひらく <span aria-hidden="true">→</span></button></section><div class="section-title"><h2>🎡 アトラクションをえらぼう</h2><span class="mode">${labels[level]}</span></div><section class="game-grid">${games.map((g, i) => `<button class="game-card" data-game="${g.id}"><div class="card-top"><div class="game-icon">${icons[i]}</div><div><small>GAME ${String(i + 1).padStart(2, "0")}</small><h3>${g.title}</h3></div></div><p>${words[i]}</p><div class="best-line">BEST SCORE <strong>${best(g.id, level).toLocaleString()}</strong></div></button>`).join("")}</section><details class="ratio-secret"><summary>💡 比のひみつ</summary><p>両方に同じ数をかけても、わっても、比は同じ。比の値は「前の数 ÷ 後ろの数」。</p></details>${badgeMarkup({ all: readBadgeIds(), newIds: [] })}<button class="reset-link" data-reset>記録をリセット</button>`;
  bindSoundToggle();
  app.querySelectorAll("[data-level]").forEach(
    (b) =>
      (b.onclick = () => {
        location.hash = `#home?level=${b.dataset.level}`;
        home();
      }),
  );
  app.querySelectorAll("[data-game]").forEach(
    (b) =>
      (b.onclick = () => {
        unlockAudio();
        start(b.dataset.game, level);
      }),
  );
  app.querySelector("[data-lab]").onclick = () => {
    unlockAudio();
    startRatioLab(level);
  };
  app.querySelector("[data-reset]").onclick = () => {
    if (confirm("すべての記録を消しますか？")) {
      reset();
      home();
    }
  };
}
function startRatioLab(level) {
  activeEngine?.stop();
  activeEngine = null;
  mountRatioLab({
    app,
    header,
    level,
    onHome: () => {
      location.hash = "#home";
      home();
    },
    onPractice: () => start("sameRatio", level),
    onSoundToggle: () => {
      toggleSound();
      unlockAudio();
    },
  });
}
function gameHead(g, level, e) {
  return `<button class="back" data-home>← パークにもどる</button><div class="game-head"><div><span class="mode">${labels[level]}</span><h2>${g.title}</h2></div><div class="stats"><div class="stat">TIME<strong>${e.time}</strong></div><div class="stat">SCORE<strong>${e.score}</strong></div><div class="stat">COMBO<strong>${e.combo}</strong></div></div></div>`;
}
function start(id, level) {
  const g = games.find((x) => x.id === id);
  let q = g.newQuestion(level),
    feedback = "",
    feedbackTip = "",
    helperCharacter = "kai",
    helperPose = "hint",
    showHelp = false,
    answerMarks = null;
  const engine = new GameEngine({
    game: id,
    level,
    onRender: (event) => {
      if (event.phase === "countdown") {
        sounds.count(event.word);
        app.innerHTML = `${header()}<section class="screen-card countdown">${event.word}<span>まもなくスタート！</span></section>`;
        bindSoundToggle();
        return;
      }
      if (event.phase === "tick") {
        const stats = app.querySelectorAll(".stat strong");
        if (stats.length >= 3) {
          stats[0].textContent = engine.time;
          const track = app.querySelector(".game-time-track i");
          if (track) track.style.width = `${Math.max(0, engine.time / 60 * 100)}%`;
          stats[1].textContent = engine.score;
          stats[2].textContent = engine.combo;
        }
        return;
      }
      if (event.phase === "answer") {
        if (event.near) sounds.near();
        else if (event.ok) {
          sounds.correct();
          sounds.combo(engine.combo);
        } else sounds.wrong();
        feedback = event.near
          ? "△ あと一歩！"
          : event.ok
            ? "○ GOOD!"
            : "× もう一度考えよう";
        helperCharacter = event.near ? "kai" : event.ok ? "tsuki" : "nami";
        helperPose = event.near ? "hint" : event.ok ? "correct" : "retry";
        feedbackTip = event.near || event.ok ? gameHint(id, q) : `${gameHint(id, q)} ${gameSolution(id, q)}`;
        // Keep answer feedback visible until the learner answers again or the question changes.
        // Wrong answers stay on the same question, so the explanation remains available while thinking.
      }
      render();
    },
    onEnd: (state) => result(g, level, state),
  });
  activeEngine = engine;
  function render() {
    if (!engine.active && engine.time > 0) return;
    app.innerHTML = `${header()}<section class="screen-card">${gameHead(g, level, engine)}<div class="game-time-track" aria-label="残り時間"><i style="width:${Math.max(0, engine.time / 60 * 100)}%"></i></div><div class="game-skill-line"><span>${({sameRatio:"等しい比を見つける",simplifyRatio:"比を簡単にする",ratioValue:"比の値を求める",memoryRatio:"等しい比を見抜く",fakeRatio:"まちがいを見抜く",missingRatio:"未知の数を求める",compareRatio:"比の値を比べる",ratioChain:"等しい比をつなぐ"})[id]}</span><span>${gameProgress(id, q)}</span></div><div class="feedback ${feedback.startsWith("○") ? "good" : feedback.startsWith("×") ? "bad" : feedback ? "near" : ""}" role="status" aria-live="polite">${feedback}</div>${feedback ? `<div class="navi-reaction">${naviImage(helperCharacter, helperPose)}<p>${esc(feedbackTip)}</p></div>` : ""}${g.render(q)}<div class="game-help"><button class="text-button" data-help>${showHelp ? "考え方をとじる" : "💡 考え方を見てみる"}</button>${showHelp ? `<div class="game-help-panel">${naviImage("kai", "hint")}<p>${esc(gameHint(id, q))}</p></div>` : ""}</div></section>`;
    if (answerMarks) {
      const chosen = app.querySelector(`[${answerMarks.selector}="${answerMarks.value}"]`);
      if (chosen) chosen.classList.add(answerMarks.ok ? "correct" : "wrong");
      if (!answerMarks.ok && answerMarks.correctValue !== undefined) {
        const correct = app.querySelector(`[${answerMarks.selector}="${answerMarks.correctValue}"]`);
        if (correct) correct.classList.add("correct");
      }
    }
    app.querySelector("[data-home]").onclick = () => {
      engine.stop();
      location.hash = "#home";
      home();
    };
    bindSoundToggle();
    bind();
  }
  function next() {
    q = g.newQuestion(level);
    feedback = "";
    feedbackTip = "";
    answerMarks = null;
    showHelp = false;
    helperCharacter = "kai";
    helperPose = "hint";
    engine.unlock();
    render();
  }
  function bind() {
    app.querySelector("[data-help]")?.addEventListener("click", () => {
      showHelp = !showHelp;
      render();
    });
    if (id === "sameRatio")
      app.querySelectorAll("[data-choice]").forEach(
        (b) =>
          (b.onclick = () => {
            const index = Number(b.dataset.choice);
            const choice = q.choices[index];
            answerMarks = { selector: "data-choice", value: String(index), ok: choice.ok, correctValue: String(q.choices.findIndex(x => x.ok)) };
            if (!engine.answer(choice.ok, { weakness: "sameRatio" })) { answerMarks = null; return; }
            b.classList.add(choice.ok ? "correct" : "wrong");
            if (choice.ok) {
              setTimeout(next, 260);
            } else
              setTimeout(() => {
                engine.unlock();
                render();
              }, 450);
          }),
      );
    if (id === "simplifyRatio") {
      const finish = app.querySelector("[data-finish]");
      if (finish)
        finish.onclick = () => {
          if (
            !engine.answer(true, {
              bonus: g.bonus(q),
              questionType:
                q.level === "hard" ? "decimalToInteger" : "multiStep",
            })
          )
            return;
          setTimeout(next, 250);
        };
      app.querySelectorAll("[data-op]").forEach(
        (b) =>
          (b.onclick = () => {
            if (!engine.active || engine.locked) return;
            const ok = g.apply(q, q.options[Number(b.dataset.op)]);
            if (ok) {
              feedback = "○ その調子！";
              render();
              return;
            }
            if (
              !engine.answer(false, {
                weakness: "simplifyRatio",
                questionType:
                  q.level === "hard" ? "decimalToInteger" : "divideStep",
              })
            )
              return;
            setTimeout(() => {
              engine.unlock();
              render();
            }, 450);
          }),
      );
    }
    if (id === "ratioValue") {
      app.querySelectorAll("[data-field]").forEach(
        (b) =>
          (b.onclick = () => {
            q.active = b.dataset.field;
            render();
          }),
      );
      app.querySelectorAll("[data-key]").forEach(
        (b) =>
          (b.onclick = () => {
            const k = b.dataset.key;
            if (k === "C") {
              q[q.active] = "";
              render();
              return;
            }
            if (k === "✓") {
              const r = g.judge(q);
              if (r.type === "near") {
                feedback = r.message;
                engine.answer(true, { near: true });
                engine.unlock();
                render();
                return;
              }
              if (r.type === "correct") {
                if (engine.answer(true)) {
                  feedback = r.message;
                  setTimeout(next, 320);
                }
                return;
              }
              engine.miss("ratioValue");
              feedback = r.message;
              setTimeout(() => {
                engine.unlock();
                render();
              }, 550);
              return;
            }
            q[q.active] = String(q[q.active] || "") + k;
            render();
          }),
      );
    }
    if (id === "memoryRatio")
      app.querySelectorAll("[data-card]").forEach(
        (b) =>
          (b.onclick = () => {
            if (!engine.active || engine.locked) return;
            const r = g.flip(q, Number(b.dataset.card));
            if (!r) return;
            render();
            if (r.type === "match") {
              if (engine.answer(true)) {
                feedback = "○ MATCH!";
                setTimeout(() => {
                  if (q.cards.every((c) => c.state === "matched"))
                    q = g.newQuestion(level);
                  engine.unlock();
                  render();
                }, 260);
              }
            }
            if (r.type === "miss") {
              engine.miss("memoryRatio");
              feedback = "× ちがうペア";
              setTimeout(() => {
                r.cards.forEach((c) => (c.state = "down"));
                q.open = [];
                engine.unlock();
                render();
              }, 600);
            }
          }),
      );
    if (id === "fakeRatio")
      app.querySelectorAll("[data-choice]").forEach(
        (b) =>
          (b.onclick = () => {
            const index = Number(b.dataset.choice);
            const c = q.cards[index];
            answerMarks = { selector: "data-choice", value: String(index), ok: c.fake, correctValue: String(q.cards.findIndex(x => x.fake)) };
            if (
              !engine.answer(c.fake, {
                weakness: "fakeRatio",
                questionType: q.type,
              })
            )
              return;
            b.classList.add(c.fake ? "correct" : "wrong");
            if (c.fake) {
              feedback = "○ ニセモノ発見！";
              setTimeout(next, 260);
            } else
              setTimeout(() => {
                engine.unlock();
                render();
              }, 450);
          }),
      );
    if (id === "missingRatio")
      app.querySelectorAll("[data-key]").forEach(
        (b) =>
          (b.onclick = () => {
            const k = b.dataset.key;
            if (k === "C") {
              q.active = "";
              render();
              return;
            }
            if (k !== "✓") {
              q.active += k;
              render();
              return;
            }
            const ok = g.judge(q);
            if (
              !engine.answer(ok, {
                weakness: "missingRatio",
                questionType: q.type,
              })
            )
              return;
            feedback = ok ? "○ NICE!" : "× 同じ数をかけてみよう";
            if (ok) {
              setTimeout(next, 280);
            } else
              setTimeout(() => {
                engine.unlock();
                render();
              }, 480);
          }),
      );
    if (id === "compareRatio")
      app.querySelectorAll("[data-compare]").forEach(
        (b) =>
          (b.onclick = () => {
            const ok = Number(b.dataset.compare) === q.answer;
            answerMarks = { selector: "data-compare", value: String(b.dataset.compare), ok, correctValue: String(q.answer) };
            if (
              !engine.answer(ok, {
                weakness: "compareRatio",
                questionType: q.type,
              })
            )
              return;
            b.classList.add(ok ? "correct" : "wrong");
            if (ok) {
              setTimeout(next, 260);
            } else
              setTimeout(() => {
                engine.unlock();
                render();
              }, 450);
          }),
      );
    if (id === "ratioChain")
      app.querySelectorAll("[data-chain]").forEach(
        (b) =>
          (b.onclick = () => {
            const index = Number(b.dataset.chain);
            const c = q.options[index];
            answerMarks = { selector: "data-chain", value: String(index), ok: c.ok, correctValue: String(q.options.findIndex(x => x.ok)) };
            if (
              !engine.answer(c.ok, {
                weakness: "ratioChain",
                questionType: q.type,
              })
            )
              return;
            b.classList.add(c.ok ? "correct" : "wrong");
            if (c.ok) {
              const reset = g.advance(q, c.pair);
              feedback = `○ ${q.step} CHAIN!`;
              setTimeout(() => {
                if (reset) q = g.newQuestion(level);
                engine.unlock();
                render();
              }, 270);
            } else
              setTimeout(() => {
                engine.unlock();
                render();
              }, 450);
          }),
      );
  }
  engine.start();
}
function result(g, level, s) {
  if (s.saved.isNew) sounds.best();
  const total = s.correct + s.wrong,
    rate = total ? Math.round((s.correct / total) * 100) : 0,
    good = s.saved.isNew
      ? "自己ベスト更新！"
      : s.maxCombo >= 10
        ? "10 COMBO達成！ 正確に続けられたね！"
        : rate >= 95
          ? "ほとんどミスなし！ すばらしい！"
          : "たくさんの比にチャレンジできたね！",
    next =
      rate < 80
        ? "次は正答率80%以上をねらおう！"
        : s.maxCombo < 5
          ? "まずは5 COMBOを目指そう！"
          : growthTip();
  const badgeState = collectBadges(g.id, level, s, rate);
  app.innerHTML = `${header()}<section class="screen-card result"><span class="mode">${labels[level]} / ${g.title}</span><p>SCORE</p><div class="score">${s.score.toLocaleString()}</div>${s.saved.isNew ? '<div class="new-best">★ NEW BEST!</div>' : ""}<div class="result-grid"><div>BEST<strong>${s.saved.best.toLocaleString()}</strong></div><div>正解<strong>${s.correct}</strong></div><div>ミス<strong>${s.wrong}</strong></div><div>最高コンボ<strong>${s.maxCombo}</strong></div><div>正答率<strong>${rate}%</strong></div></div><p class="result-tip">✨ ${good}<br>🎯 ${next}</p>${badgeMarkup(badgeState)}<div class="result-actions"><button class="primary" data-again>もう一回！</button><button class="secondary" data-levels>難易度を変える</button><button class="secondary" data-home>ホームへ</button></div></section>`;
  bindSoundToggle();
  app.querySelector("[data-again]").onclick = () => start(g.id, level);
  app.querySelector("[data-levels]").onclick = () => {
    location.hash = `#home?level=${level}`;
    home();
  };
  app.querySelector("[data-home]").onclick = () => {
    location.hash = "#home";
    home();
  };
}
window.addEventListener("hashchange", home);
home();
