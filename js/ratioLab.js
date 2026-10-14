const NAVI_BASE = "https://tt-sensei.github.io/navi-character-/assets/web/characters";

const navi = (id, pose = "hint", className = "ratio-navi") =>
  `<img class="${className}" src="${NAVI_BASE}/${id}/fullbody/${pose}.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" onerror="this.hidden=true">`;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

const ratioValue = (a, b) => {
  const d = gcd(a, b);
  return `${a / d}/${b / d}`;
};

const unitBar = (count, tone) =>
  `<div class="ratio-units ${tone}" aria-label="${count}つ分">${Array.from({ length: count }, () => "<i></i>").join("")}</div>`;

const missions = [
  {
    context: "スポーツドリンク",
    text: "原液：水＝2：5で作ります。全部で210mL作るとき、原液は何mL？",
    aName: "原液",
    bName: "水",
    a: 2,
    b: 5,
    total: 210,
    unit: "mL",
    ask: "a",
    choices: [30, 60, 90, 150],
  },
  {
    context: "ビーズづくり",
    text: "赤：青＝3：4。ビーズが全部で56個あるとき、青いビーズは何個？",
    aName: "赤",
    bName: "青",
    a: 3,
    b: 4,
    total: 56,
    unit: "個",
    ask: "b",
    choices: [8, 24, 32, 40],
  },
  {
    context: "おかし作り",
    text: "小麦粉：砂糖＝5：2。2つ合わせて420gなら、砂糖は何g？",
    aName: "小麦粉",
    bName: "砂糖",
    a: 5,
    b: 2,
    total: 420,
    unit: "g",
    ask: "b",
    choices: [60, 120, 300, 350],
  },
  {
    context: "クラスの人数",
    text: "男子：女子＝4：3。合わせて35人なら、女子は何人？",
    aName: "男子",
    bName: "女子",
    a: 4,
    b: 3,
    total: 35,
    unit: "人",
    ask: "b",
    choices: [10, 15, 20, 25],
  },
];

export function mountRatioLab({
  app,
  header,
  onHome,
  onPractice,
  onSoundToggle,
  level = "easy",
}) {
  let tab = "explore";
  let a = 2;
  let b = 3;
  let factor = 2;
  let builderMode = "both";
  let reduceReveal = false;
  let valuePair = [2, 3];
  let missionIndex = 0;
  let missionAnswered = false;
  let missionWasCorrect = false;
  let missionCorrect = 0;

  function tabs() {
    const items = [
      ["explore", "比を体験"],
      ["equivalent", "同じ比"],
      ["value", "比の値"],
      ["mission", "生活ミッション"],
    ];
    return `<nav class="ratio-lab-tabs" aria-label="学習内容">${items.map(([id, label]) =>
      `<button class="ratio-lab-tab ${tab === id ? "active" : ""}" data-tab="${id}" aria-pressed="${tab === id}">${label}</button>`
    ).join("")}</nav>`;
  }

  function panelExplore() {
    const same = a * 3 === b * 2;
    return `
      <section class="ratio-lab-panel">
        <div class="ratio-lab-panel-head">
          <div><p class="eyebrow">TRY IT / 01</p><h2>量が変わっても、比は同じ？</h2></div>
          ${navi("kai", "thinking")}
        </div>
        <p class="ratio-lab-lead">飲み物のきほんは「原液2：水3」。数を動かして、同じ割合のまま量を増やせるか試そう。</p>
        <div class="ratio-reference"><span>きほんの比</span><strong>2：3</strong><span class="ratio-reference-note">原液：水</span></div>
        <div class="ratio-adjust-grid">
          <div class="ratio-adjust-card">
            <div class="ratio-adjust-label"><span class="ratio-dot syrup"></span>原液 <strong>${a}</strong></div>
            <div class="ratio-adjust-controls"><button data-adjust="a:-1" aria-label="原液を1減らす" ${a <= 1 ? "disabled" : ""}>−</button><button data-adjust="a:1" aria-label="原液を1増やす" ${a >= 12 ? "disabled" : ""}>＋</button></div>
            ${unitBar(a, "syrup")}
          </div>
          <div class="ratio-adjust-card">
            <div class="ratio-adjust-label"><span class="ratio-dot water"></span>水 <strong>${b}</strong></div>
            <div class="ratio-adjust-controls"><button data-adjust="b:-1" aria-label="水を1減らす" ${b <= 1 ? "disabled" : ""}>−</button><button data-adjust="b:1" aria-label="水を1増やす" ${b >= 12 ? "disabled" : ""}>＋</button></div>
            ${unitBar(b, "water")}
          </div>
        </div>
        <div class="ratio-lab-result ${same ? "is-same" : "is-different"}" aria-live="polite">
          <span class="ratio-result-label">${same ? "同じ比！" : "比が変わったよ"}</span>
          <strong>${a}：${b}</strong>
          <p>${same
            ? `きほんの2：3と同じ関係。前も後ろも同じ数（×${a / 2}）になっているね。`
            : "2つの数の増え方がそろっていないと、比は変わるよ。前の数だけでなく、後ろの数も見よう。"
          }</p>
        </div>
        <div class="ratio-lab-bottom"><span>今の比の値：<strong>${ratioValue(a, b)}</strong></span><button class="text-button" data-reset-explore>きほんの比にもどす</button></div>
      </section>`;
  }

  function panelEquivalent() {
    const currentA = builderMode === "both" ? 2 * factor : 2 * factor;
    const currentB = builderMode === "both" ? 3 * factor : 3;
    const same = currentA * 3 === currentB * 2;
    return `
      <section class="ratio-lab-panel">
        <div class="ratio-lab-panel-head">
          <div><p class="eyebrow">TRY IT / 02</p><h2>等しい比をつくろう</h2></div>
          ${navi("sora", "thinking")}
        </div>
        <p class="ratio-lab-lead">2：3をもとに、数を変えてみよう。2つの数をどのように変えると、比は変わらないかな？</p>
        <div class="ratio-builder-controls">
          <div class="ratio-toggle-group" aria-label="数の変え方">
            <button class="${builderMode === "both" ? "active" : ""}" data-builder="both" aria-pressed="${builderMode === "both"}">両方に同じ数をかける</button>
            <button class="${builderMode === "one" ? "active" : ""}" data-builder="one" aria-pressed="${builderMode === "one"}">前の数だけかける</button>
          </div>
          <div class="ratio-multipliers">${[2, 3, 4, 5].map(n => `<button class="${factor === n ? "active" : ""}" data-factor="${n}" aria-pressed="${factor === n}">×${n}</button>`).join("")}</div>
        </div>
        <div class="ratio-equation-board">
          <div class="ratio-eq-source"><span>もとの比</span><strong>2：3</strong></div>
          <span class="ratio-eq-arrow" aria-hidden="true">→</span>
          <div class="ratio-eq-target"><span>変えた比</span><strong>${currentA}：${currentB}</strong></div>
        </div>
        <div class="ratio-lab-result ${same ? "is-same" : "is-different"}" aria-live="polite">
          <span class="ratio-result-label">${same ? "等しい比" : "等しくない比"}</span>
          <p>${same
            ? `2つとも×${factor}したので、${currentA}：${currentB}は2：3と等しい比だよ。`
            : `前の数だけ×${factor}したので、後ろの数との関係が変わったね。等しい比にするには、両方に同じ数をかけよう。`
          }</p>
        </div>
        <div class="ratio-mini-lesson">
          <div><p class="eyebrow">もうひとつ</p><strong>18：24 を簡単にすると？</strong><p>18も24も6で割れるから、3：4になる。比を変えずに、見やすい数に整理できるよ。</p></div>
          <button class="secondary" data-reduce>${reduceReveal ? "かくす" : "÷6して確かめる"}</button>
          ${reduceReveal ? '<div class="ratio-reduce-answer" aria-live="polite"><span>18：24</span><b>÷6</b><strong>3：4</strong><small>両方を同じ数で割る</small></div>' : ""}
        </div>
      </section>`;
  }

  function panelValue() {
    const [x, y] = valuePair;
    const d = gcd(x, y);
    const decimal = (x / y).toFixed(2);
    const choices = [[2, 3], [3, 4], [4, 5], [3, 6], [4, 6], [5, 2]];
    return `
      <section class="ratio-lab-panel">
        <div class="ratio-lab-panel-head">
          <div><p class="eyebrow">TRY IT / 03</p><h2>比の値は、何を表している？</h2></div>
          ${navi("kai", "hint")}
        </div>
        <p class="ratio-lab-lead">比の値は「前の数 ÷ 後ろの数」。後ろの数量を1とみたとき、前の数量がどれくらいかを表すよ。</p>
        <div class="ratio-value-picks">${choices.map(pair => {
          const key = pair.join(":");
          const active = x === pair[0] && y === pair[1];
          return `<button class="${active ? "active" : ""}" data-value-pair="${key}" aria-pressed="${active}">${pair[0]}：${pair[1]}</button>`;
        }).join("")}</div>
        <div class="ratio-value-display">
          <div class="ratio-value-expression"><span>比</span><strong>${x}：${y}</strong><span>前 ÷ 後ろ</span></div>
          <div class="ratio-value-fraction"><span>比の値</span><strong>${x}/${y}</strong><span>=</span><strong>${x / d}/${y / d}</strong></div>
          <p>${x} ÷ ${y} = ${decimal}（小数第2位まで）。分数で表して、約分できるときは簡単にしよう。</p>
        </div>
        <div class="ratio-value-tip">${navi("nami", "correct", "ratio-navi-small")}<p><strong>ポイント</strong><br>比の値が等しければ、比も等しいよ。たとえば2：3と4：6は、どちらも比の値が2/3。</p></div>
      </section>`;
  }

  function panelMission() {
    if (missionIndex >= missions.length) {
      return `
        <section class="ratio-lab-panel ratio-mission-complete">
          ${navi("saku", "complete")}
          <p class="eyebrow">MISSION COMPLETE</p>
          <h2>生活ミッション終了！</h2>
          <div class="mission-score"><strong>${missionCorrect}</strong><span>／${missions.length} 問正解</span></div>
          <p>比で分けるときは、まず比の数を足して「全部で何つ分か」を考えるのがポイント。</p>
          <div class="ratio-lab-actions"><button class="primary" data-mission-reset>もう一度挑戦</button><button class="secondary" data-practice>ゲームで練習する</button></div>
        </section>`;
    }
    const m = missions[missionIndex];
    const totalParts = m.a + m.b;
    const onePart = m.total / totalParts;
    const targetAmount = onePart * (m.ask === "a" ? m.a : m.b);
    const targetName = m.ask === "a" ? m.aName : m.bName;
    return `
      <section class="ratio-lab-panel">
        <div class="ratio-lab-panel-head">
          <div><p class="eyebrow">LIFE MISSION / ${String(missionIndex + 1).padStart(2, "0")}</p><h2>${m.context}</h2></div>
          ${navi(missionAnswered ? (missionWasCorrect ? "tsuki" : "nami") : "sora", missionAnswered ? (missionWasCorrect ? "correct" : "retry") : "thinking")}
        </div>
        <div class="mission-progress"><span>ミッション ${missionIndex + 1} / ${missions.length}</span><span class="mission-progress-track"><i style="width:${(missionIndex / missions.length) * 100}%"></i></span></div>
        <p class="ratio-lab-lead mission-question">${m.text}</p>
        <div class="mission-ratio-card">
          <div><span class="ratio-dot syrup"></span>${m.aName}<strong>${m.a}</strong></div>
          <b>：</b>
          <div><span class="ratio-dot water"></span>${m.bName}<strong>${m.b}</strong></div>
        </div>
        <div class="mission-parts">
          <span>全体は ${totalParts} つ分</span>
          <div class="mission-part-bars">${unitBar(m.a, "syrup")}${unitBar(m.b, "water")}</div>
        </div>
        <p class="mission-ask">${targetName}は何${m.unit}？</p>
        <div class="mission-choices">${m.choices.map(v => `<button class="choice ${missionAnswered && v === targetAmount ? "correct" : ""} ${missionAnswered && v !== targetAmount && missionSelected === v ? "wrong" : ""}" data-mission-answer="${v}" ${missionAnswered ? "disabled" : ""}>${v}${m.unit}</button>`).join("")}</div>
        ${missionAnswered ? `
          <div class="mission-explanation ${missionWasCorrect ? "is-correct" : "is-retry"}" aria-live="polite">
            <strong>${missionWasCorrect ? "正解！" : `答えは ${targetAmount}${m.unit}。`}</strong>
            <p>${m.a}＋${m.b}＝${totalParts}つ分。<br>${m.total}÷${totalParts}＝${onePart}${m.unit}（1つ分）。<br>${onePart}×${m.ask === "a" ? m.a : m.b}＝${targetAmount}${m.unit} だね。</p>
          </div>
          <button class="primary mission-next" data-mission-next>${missionIndex === missions.length - 1 ? "結果を見る" : "次のミッションへ →"}</button>
        ` : '<p class="mission-hint">ヒント：比の数を足すと、全部で何つ分かが分かるよ。</p>'}
      </section>`;
  }

  function render() {
    const panel = {
      explore: panelExplore,
      equivalent: panelEquivalent,
      value: panelValue,
      mission: panelMission,
    }[tab]();
    app.innerHTML = `${header()}<div class="ratio-lab-shell">
      <div class="ratio-lab-heading"><button class="back" data-home>← ホームへ</button><div><p class="eyebrow">RATIO PARK / LAB</p><h1>比ラボ</h1><p>動かして、見つけて、生活の中で使ってみよう。</p></div></div>
      ${tabs()}
      ${panel}
      <div class="ratio-lab-footer"><span>自分のペースで何度でも試せるよ。</span><button class="text-button" data-practice>8つのゲームで練習する →</button></div>
    </div>`;

    app.querySelector("[data-sound]")?.addEventListener("click", () => {
      onSoundToggle?.();
      render();
    });
    app.querySelector("[data-home]")?.addEventListener("click", onHome);
    app.querySelectorAll("[data-tab]").forEach(button => button.addEventListener("click", () => {
      tab = button.dataset.tab;
      render();
    }));
    app.querySelectorAll("[data-adjust]").forEach(button => button.addEventListener("click", () => {
      const [which, delta] = button.dataset.adjust.split(":");
      if (which === "a") a = clamp(a + Number(delta), 1, 12);
      else b = clamp(b + Number(delta), 1, 12);
      render();
    }));
    app.querySelector("[data-reset-explore]")?.addEventListener("click", () => {
      a = 2; b = 3; render();
    });
    app.querySelectorAll("[data-builder]").forEach(button => button.addEventListener("click", () => {
      builderMode = button.dataset.builder;
      render();
    }));
    app.querySelectorAll("[data-factor]").forEach(button => button.addEventListener("click", () => {
      factor = Number(button.dataset.factor);
      render();
    }));
    app.querySelector("[data-reduce]")?.addEventListener("click", () => {
      reduceReveal = !reduceReveal;
      render();
    });
    app.querySelectorAll("[data-value-pair]").forEach(button => button.addEventListener("click", () => {
      valuePair = button.dataset.valuePair.split(":").map(Number);
      render();
    }));
    app.querySelectorAll("[data-mission-answer]").forEach(button => button.addEventListener("click", () => {
      if (missionAnswered) return;
      const m = missions[missionIndex];
      const correctValue = (m.total / (m.a + m.b)) * (m.ask === "a" ? m.a : m.b);
      missionSelected = Number(button.dataset.missionAnswer);
      missionWasCorrect = missionSelected === correctValue;
      missionAnswered = true;
      if (missionWasCorrect) missionCorrect++;
      render();
    }));
    app.querySelector("[data-mission-next]")?.addEventListener("click", () => {
      missionIndex++;
      missionAnswered = false;
      missionWasCorrect = false;
      missionSelected = null;
      render();
    });
    app.querySelector("[data-mission-reset]")?.addEventListener("click", () => {
      missionIndex = 0; missionAnswered = false; missionWasCorrect = false; missionCorrect = 0; missionSelected = null;
      render();
    });
    app.querySelectorAll("[data-practice]").forEach(button => button.addEventListener("click", onPractice));
  }

  let missionSelected = null;
  render();
}
