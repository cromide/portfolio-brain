// ===== Quiz & Leveling System =====
// 뉴런별 퀴즈 + 레벨링 + 스페이스드 리피티션

(function () {
  const STORAGE_KEY = 'quiz-progress';
  const LEVEL_THRESHOLDS = [0, 30, 80, 160, 300, 500];
  const LEVEL_NAMES = ['Novice', 'Learner', 'Practitioner', 'Specialist', 'Expert', 'Master'];
  const XP_PER_LEVEL = { 1: 10, 2: 20, 3: 35, 4: 50, 5: 75 };

  // Spaced repetition intervals (hours)
  const SR_INTERVALS = [0, 4, 12, 24, 72, 168, 336]; // 0h, 4h, 12h, 1d, 3d, 7d, 14d

  let quizBank = null;
  let progress = null;

  // ===== Load =====
  async function init() {
    const bankRes = await fetch('./data/quiz-bank.json');
    quizBank = await bankRes.json();

    // Load progress from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      progress = JSON.parse(saved);
    } else {
      progress = { player: { total_xp: 0, level: 1, streak_days: 0, last_quiz_date: null, quizzes_completed: 0, correct_count: 0 }, neurons: {}, history: [] };
    }

    buildUI();
    updateStats();
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  // ===== Player Level =====
  function getPlayerLevel(xp) {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
    }
    return 1;
  }

  function xpToNextLevel(xp) {
    const lv = getPlayerLevel(xp);
    if (lv >= LEVEL_THRESHOLDS.length) return { current: xp, next: xp, pct: 100 };
    const current = LEVEL_THRESHOLDS[lv - 1];
    const next = LEVEL_THRESHOLDS[lv];
    return { current: xp - current, next: next - current, pct: Math.round(((xp - current) / (next - current)) * 100) };
  }

  // ===== Neuron Level =====
  function getNeuronData(neuronId) {
    if (!progress.neurons[neuronId]) {
      progress.neurons[neuronId] = { xp: 0, level: 0, correct: 0, wrong: 0, last_review: null, sr_step: 0, streak: 0 };
    }
    return progress.neurons[neuronId];
  }

  function getNeuronLevel(neuronXP) {
    if (neuronXP >= 190) return 5;
    if (neuronXP >= 105) return 4;
    if (neuronXP >= 45) return 3;
    if (neuronXP >= 15) return 2;
    if (neuronXP > 0) return 1;
    return 0;
  }

  // ===== Spaced Repetition =====
  function getDueNeurons() {
    const now = Date.now();
    const due = [];

    for (const [nid, data] of Object.entries(progress.neurons)) {
      if (data.last_review) {
        const interval = SR_INTERVALS[Math.min(data.sr_step, SR_INTERVALS.length - 1)] * 3600000;
        if (now - data.last_review >= interval) {
          due.push({ id: nid, data, overdue: now - data.last_review - interval });
        }
      }
    }

    // Sort by most overdue first
    due.sort((a, b) => b.overdue - a.overdue);
    return due;
  }

  function getRecommendedQuiz() {
    // 1. Due for review (spaced repetition)
    const due = getDueNeurons();
    if (due.length > 0) {
      return { type: 'review', neuronId: due[0].id, reason: 'Spaced repetition review' };
    }

    // 2. New neurons not yet started
    const allNeurons = Object.keys(quizBank.quizzes);
    const untouched = allNeurons.filter(nid => !progress.neurons[nid] || progress.neurons[nid].xp === 0);
    if (untouched.length > 0) {
      return { type: 'new', neuronId: untouched[0], reason: 'New neuron to explore' };
    }

    // 3. Lowest level neuron
    const sorted = Object.entries(progress.neurons).sort((a, b) => a[1].xp - b[1].xp);
    if (sorted.length > 0) {
      return { type: 'weakest', neuronId: sorted[0][0], reason: 'Weakest neuron' };
    }

    return null;
  }

  // ===== Pick Quiz =====
  function pickQuiz(neuronId) {
    const quizzes = quizBank.quizzes[neuronId];
    if (!quizzes || quizzes.length === 0) return null;

    const data = getNeuronData(neuronId);
    const neuronLv = getNeuronLevel(data.xp);

    // Pick quiz at appropriate level (current level or +1)
    const targetLv = Math.min(5, neuronLv + 1);
    let candidates = quizzes.filter(q => q.lv <= targetLv);
    if (candidates.length === 0) candidates = quizzes;

    // Random from candidates
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  // ===== Answer =====
  function submitAnswer(neuronId, quiz, isCorrect) {
    const data = getNeuronData(neuronId);
    const xpGain = isCorrect ? XP_PER_LEVEL[quiz.lv] || 10 : 0;

    data.xp += xpGain;
    data.level = getNeuronLevel(data.xp);
    data.last_review = Date.now();

    if (isCorrect) {
      data.correct++;
      data.streak++;
      data.sr_step = Math.min(data.sr_step + 1, SR_INTERVALS.length - 1);
      progress.player.correct_count++;
    } else {
      data.wrong++;
      data.streak = 0;
      data.sr_step = Math.max(0, data.sr_step - 2); // Reset spaced repetition
    }

    progress.player.total_xp += xpGain;
    progress.player.level = getPlayerLevel(progress.player.total_xp);
    progress.player.quizzes_completed++;

    // Streak tracking
    const today = new Date().toISOString().slice(0, 10);
    if (progress.player.last_quiz_date !== today) {
      if (progress.player.last_quiz_date === new Date(Date.now() - 86400000).toISOString().slice(0, 10)) {
        progress.player.streak_days++;
      } else {
        progress.player.streak_days = 1;
      }
      progress.player.last_quiz_date = today;
    }

    // History
    progress.history.push({
      date: today,
      neuron: neuronId,
      level: quiz.lv,
      correct: isCorrect,
      xp: xpGain,
    });

    // Keep history manageable
    if (progress.history.length > 500) {
      progress.history = progress.history.slice(-500);
    }

    save();
    return xpGain;
  }

  // ===== UI =====
  function buildUI() {
    // Quiz button in header
    const header = document.querySelector('.header-right');
    if (!header) return;

    const btn = document.createElement('button');
    btn.id = 'quiz-btn';
    btn.innerHTML = 'Quiz';
    btn.addEventListener('click', openQuizPanel);
    header.insertBefore(btn, header.firstChild);

    // Quiz panel
    const panel = document.createElement('div');
    panel.id = 'quiz-panel';
    panel.className = 'quiz-hidden';
    panel.innerHTML = `
      <div class="quiz-overlay" onclick="document.getElementById('quiz-panel').classList.add('quiz-hidden')"></div>
      <div class="quiz-modal">
        <button class="quiz-close" onclick="document.getElementById('quiz-panel').classList.add('quiz-hidden')">&times;</button>
        <div id="quiz-header"></div>
        <div id="quiz-body"></div>
        <div id="quiz-footer"></div>
      </div>
    `;
    document.body.appendChild(panel);
  }

  function openQuizPanel() {
    const panel = document.getElementById('quiz-panel');
    panel.classList.remove('quiz-hidden');
    showQuizHome();
  }

  function showQuizHome() {
    const header = document.getElementById('quiz-header');
    const body = document.getElementById('quiz-body');
    const footer = document.getElementById('quiz-footer');

    const lv = progress.player.level;
    const xpInfo = xpToNextLevel(progress.player.total_xp);
    const due = getDueNeurons();

    header.innerHTML = `
      <div class="quiz-player">
        <div class="quiz-level">Lv.${lv} <span class="quiz-level-name">${LEVEL_NAMES[lv - 1] || ''}</span></div>
        <div class="quiz-xp-bar">
          <div class="quiz-xp-fill" style="width:${xpInfo.pct}%"></div>
        </div>
        <div class="quiz-xp-text">${progress.player.total_xp} XP · ${xpInfo.current}/${xpInfo.next} to next</div>
        <div class="quiz-stats-row">
          <span>Streak: ${progress.player.streak_days}d</span>
          <span>Completed: ${progress.player.quizzes_completed}</span>
          <span>Accuracy: ${progress.player.quizzes_completed ? Math.round(progress.player.correct_count / progress.player.quizzes_completed * 100) : 0}%</span>
        </div>
      </div>
    `;

    // Neuron levels grid
    const allNeurons = Object.keys(quizBank.quizzes);
    let grid = '<div class="quiz-grid">';
    for (const nid of allNeurons) {
      const data = progress.neurons[nid] || { xp: 0, level: 0 };
      const nlv = getNeuronLevel(data.xp);
      const label = nid.replace(/^(skill_|future_|proj_)/, '').replace(/_/g, ' ');
      const isDue = due.some(d => d.id === nid);
      grid += `<div class="quiz-neuron-card ${isDue ? 'quiz-due' : ''} quiz-lv-${nlv}" onclick="window._quizStart('${nid}')">
        <div class="quiz-neuron-lv">Lv.${nlv}</div>
        <div class="quiz-neuron-name">${label}</div>
        ${isDue ? '<div class="quiz-due-badge">REVIEW</div>' : ''}
      </div>`;
    }
    grid += '</div>';

    body.innerHTML = `
      ${due.length > 0 ? `<div class="quiz-due-alert">${due.length} neurons need review!</div>` : ''}
      <div class="quiz-actions">
        <button class="quiz-start-btn" onclick="window._quizRecommended()">Recommended Quiz</button>
        <button class="quiz-review-btn" onclick="window._quizReviewAll()">Review Due (${due.length})</button>
      </div>
      <h3 class="quiz-section-title">Neuron Levels</h3>
      ${grid}
    `;

    footer.innerHTML = '';
  }

  function startQuiz(neuronId) {
    const quiz = pickQuiz(neuronId);
    if (!quiz) {
      document.getElementById('quiz-body').innerHTML = '<p class="quiz-empty">No quizzes available for this neuron.</p>';
      return;
    }

    const data = getNeuronData(neuronId);
    const label = neuronId.replace(/^(skill_|future_|proj_)/, '').replace(/_/g, ' ');

    document.getElementById('quiz-header').innerHTML = `
      <div class="quiz-topic">
        <span class="quiz-topic-label">${label}</span>
        <span class="quiz-topic-lv">Lv.${quiz.lv} · ${quizBank.meta.levels[quiz.lv].name}</span>
      </div>
    `;

    document.getElementById('quiz-body').innerHTML = `
      <div class="quiz-question">${quiz.q}</div>
      <div class="quiz-hint-wrap">
        <button class="quiz-hint-btn" onclick="this.nextElementSibling.style.display='block';this.style.display='none'">Show Hint</button>
        <div class="quiz-hint" style="display:none">${quiz.hint}</div>
      </div>
      <div class="quiz-answer-area">
        <button class="quiz-show-answer" onclick="window._quizShowAnswer()">Show Answer</button>
        <div id="quiz-answer-reveal" style="display:none">
          <div class="quiz-answer">${quiz.a}</div>
          <div class="quiz-judge">
            <button class="quiz-wrong" onclick="window._quizJudge('${neuronId}', ${quiz.lv}, false)">Didn't Know</button>
            <button class="quiz-correct" onclick="window._quizJudge('${neuronId}', ${quiz.lv}, true)">Got It!</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('quiz-footer').innerHTML = '';

    // Store current quiz for judging
    window._currentQuiz = quiz;
  }

  // ===== Global handlers =====
  window._quizStart = function (nid) { startQuiz(nid); };
  window._quizShowAnswer = function () {
    document.getElementById('quiz-answer-reveal').style.display = 'block';
    document.querySelector('.quiz-show-answer').style.display = 'none';
  };
  window._quizJudge = function (nid, lv, correct) {
    const quiz = window._currentQuiz;
    const xp = submitAnswer(nid, quiz, correct);
    const data = getNeuronData(nid);

    document.getElementById('quiz-body').innerHTML = `
      <div class="quiz-result ${correct ? 'quiz-result-correct' : 'quiz-result-wrong'}">
        <div class="quiz-result-icon">${correct ? '+' + xp + ' XP' : 'Review Again Soon'}</div>
        <div class="quiz-result-neuron">
          <span>${nid.replace(/^(skill_|future_|proj_)/, '').replace(/_/g, ' ')}</span>
          <span>Lv.${data.level} (${data.xp} XP)</span>
        </div>
        <div class="quiz-result-streak">${data.streak > 1 ? 'Streak: ' + data.streak : ''}</div>
      </div>
    `;

    document.getElementById('quiz-footer').innerHTML = `
      <button class="quiz-next-btn" onclick="window._quizStart('${nid}')">Next Quiz</button>
      <button class="quiz-home-btn" onclick="window._quizGoHome()">Back</button>
    `;

    updateStats();
  };
  window._quizRecommended = function () {
    const rec = getRecommendedQuiz();
    if (rec) startQuiz(rec.neuronId);
  };
  window._quizReviewAll = function () {
    const due = getDueNeurons();
    if (due.length > 0) startQuiz(due[0].id);
  };
  window._quizGoHome = function () { showQuizHome(); };

  function updateStats() {
    // Update quiz button badge
    const btn = document.getElementById('quiz-btn');
    if (btn) {
      const due = getDueNeurons();
      btn.innerHTML = `Quiz${due.length > 0 ? ' <span class="quiz-badge">' + due.length + '</span>' : ''}`;
    }
  }

  // Initialize
  init();
})();
