const canvas = document.querySelector("#zone-canvas");
const ctx = canvas.getContext("2d");
const tickerTrack = document.querySelector(".ticker div");
const sessionStart = document.querySelector("#session-start");
const sessionReset = document.querySelector("#session-reset");
const sessionClock = document.querySelector("#session-clock");
const sessionLog = document.querySelector("#session-log");
const downloadBait = document.querySelector("#download-bait");
const saveMessage = document.querySelector("#save-message");
const rescueModal = document.querySelector("#rescue-modal");
const rescueClose = document.querySelector("#rescue-close");
const emissionTrigger = document.querySelector("#emission-trigger");
const countdownStart = document.querySelector("#countdown-start");
const countdownReset = document.querySelector("#countdown-reset");
const ambientToggle = document.querySelector("#ambient-toggle");
const countdownDisplay = document.querySelector("#emission-countdown");
const countdownStatus = document.querySelector("#emission-status");
const playerTabs = document.querySelectorAll(".player-tab");
const playerDiagnosis = document.querySelector("#player-diagnosis");
const excuseButton = document.querySelector("#excuse-button");
const excuseOutput = document.querySelector("#excuse-output");
const interceptButton = document.querySelector("#intercept-button");
const interceptLine = document.querySelector("#intercept-line");
const interceptMeta = document.querySelector("#intercept-meta");
const mapButtons = document.querySelectorAll(".pain-map button");
const mapDiagnosis = document.querySelector("#map-diagnosis");
const forumThreads = document.querySelectorAll(".forum-thread");
const patchInput = document.querySelector("#patch-input");
const patchTranslate = document.querySelector("#patch-translate");
const patchOutput = document.querySelector("#patch-output");
const patchPresetButtons = document.querySelectorAll("[data-patch]");
const patchRandom = document.querySelector("#patch-random");
const contractSign = document.querySelector("#contract-sign");
const contractResult = document.querySelector("#contract-result");
const revealTargets = document.querySelectorAll(
  ".card, .rating-card, .review-card, .compare-grid article, .player-diagnosis, .excuse-machine, .session-console, .pain-map, .knowledge-grid article, .forum-thread, .detector-panel, .museum-timeline li, .contract-card",
);
const emissionAudio = new Audio("assets/emission.mp3");
const ambientLoop = new Audio("assets/ambient-zone.mp3");
const geigerAudio = new Audio("assets/geiger.mp3");
const pointer = { x: 0.5, y: 0.5 };

let width = 0;
let height = 0;
let particles = [];
let time = 0;
let sessionTimer = null;
let sessionStep = 0;
let countdownTimer = null;
let countdownRemaining = 17;
let audioContext = null;
let ambientTickTimer = null;
let ambientEnabled = false;

emissionAudio.preload = "auto";
emissionAudio.volume = 0.9;
emissionAudio.playbackRate = 1.12;
ambientLoop.preload = "auto";
ambientLoop.loop = true;
ambientLoop.volume = 0.18;
geigerAudio.preload = "auto";
geigerAudio.volume = 0.22;

const sessionEvents = [
  { time: "00:01", text: "Пользователь зашел 'чисто на 20 минут'. Система улыбнулась." },
  { time: "00:07", text: "Квест: принести три штуки. На карте: сорок минут туда и обратно, если вас не сотрут." },
  { time: "00:14", text: "Обнаружен артефакт. Обнаружен чужой прицел. Артефакт сменил владельца." },
  { time: "00:23", text: "Рюкзак пуст. Душа тоже. В чате кто-то пишет 'скилл ишью'." },
  { time: "00:41", text: "Решение: отыграться. Ошибка: думать, что игра уважает решения." },
  { time: "01:18", text: "Фарм найден. Фарм потерян. Нервная система отправила жалобу в отдел кадров." },
  { time: "02:06", text: "Открыт форум. Найден тред на 14 абзацев. Пользователь кивает каждому слову." },
  { time: "03:12", text: "Итог: прогресса почти нет, зато есть новая личная вражда с углами и прострелами." },
  { time: "03:47", text: "Пользователь нажал 'еще рейд'. Симуляция прекращена из жалости." },
];

const playerTypes = {
  newbie: {
    label: "Новичок",
    title: "Думает, что умер случайно.",
    text: "Еще не знает, что это был не баг, а приветственный пакет: пустой рюкзак, экран смерти и первое 'ну бывает'.",
  },
  farmer: {
    label: "Фармила",
    title: "Считает маршрут до ресурсов второй родиной.",
    text: "У него есть таблица, таймер, схема обхода и выражение лица человека, который уже не помнит слово 'развлечение'.",
  },
  pvp: {
    label: "PvP-псих",
    title: "Не играет в игру. Он патрулирует чужую боль.",
    text: "Держит угол, забирает лут и исчезает с моральной позицией 'ну это же PvP-зона'.",
  },
  returner: {
    label: "Вернувшийся",
    title: "Удалял игру три раза и каждый раз 'навсегда'.",
    text: "Вернулся проверить патч, остался на ночь, утром снова написал себе внутреннее заявление на увольнение из Зоны.",
  },
  timepayer: {
    label: "Донатер времени",
    title: "Платит не деньгами, а биографией.",
    text: "Не покупает ускорения, потому что принципиальный. Зато отдает вечера оптом, как будто у жизни есть складской запас.",
  },
};

const excuses = [
  "Я просто хотел проверить патч.",
  "Друг позвал, я не виноват.",
  "Сегодня точно нафармлю без приключений.",
  "Мне просто нравится атмосфера, не начинай.",
  "Я удалю после одного рейда.",
  "Нужно только забрать награду, это на пять минут.",
  "В этот раз пойду аккуратно, без риска.",
  "Я не играю, я изучаю пользовательский опыт боли.",
  "Если не зайду сегодня, недельки пропадут. Логично же.",
  "Мне надо проверить, стало ли хуже. Для науки.",
];

const interceptMessages = [
  {
    line: "Прием... баланс не отвечает. Повторяю: баланс не отвечает.",
    meta: "Источник: диспетчерская, где уже смирились.",
  },
  {
    line: "Сталкер, не неси это туда... поздно. Слишком поздно.",
    meta: "Статус: сигнал сорван чужим прицелом.",
  },
  {
    line: "Внимание всем на частоте: ваш лут оформил смену владельца.",
    meta: "Подпись: эфирная служба унижения.",
  },
  {
    line: "Прием... нерф прошел. Повторяю: ваша сборка теперь исторический экспонат.",
    meta: "Фон: треск, тоска и далекий смешок патчноута.",
  },
  {
    line: "Передача срочная: еще один рейд не спасет вечер, но вы все равно пойдете.",
    meta: "Заключение: пациент стабильно в проекте.",
  },
];

const patchTranslations = [
  {
    keywords: ["эконом", "фарм", "ресурс", "прогресс"],
    text: "Фармить стало дольше, но теперь это называется долгосрочной прогрессией.",
  },
  {
    keywords: ["баланс", "оруж", "сборк", "мета"],
    text: "Ваша сборка умерла красиво, с формулировкой 'для разнообразия игрового опыта'.",
  },
  {
    keywords: ["pvp", "пвп", "урон", "попад"],
    text: "Вас будут убивать быстрее, зато теперь у смерти появилась новая анимация принятия.",
  },
  {
    keywords: ["оптим", "производ", "fps", "фпс"],
    text: "На трех компьютерах стало лучше. Ваш пока проходит эмоциональную сертификацию.",
  },
  {
    keywords: ["квест", "задан", "мисси"],
    text: "Теперь надо идти чуть дальше, нести чуть больше и сомневаться в себе чуть громче.",
  },
];

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.max(80, Math.floor((width * height) / 14000));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 2.3 + 0.4,
    speed: Math.random() * 0.35 + 0.08,
    drift: Math.random() * 0.8 - 0.4,
    glow: Math.random(),
  }));
}

function drawNoise() {
  ctx.save();
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < 260; i += 1) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const shade = 120 + Math.random() * 90;
    ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.restore();
}

function drawAnomaly(cx, cy, radius, color, pulse) {
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.22, `rgba(184, 255, 61, ${0.12 + pulse * 0.08})`);
  gradient.addColorStop(0.58, `rgba(227, 90, 44, ${0.05 + pulse * 0.04})`);
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawGrid() {
  const gap = 72;
  const offset = (time * 10) % gap;
  ctx.save();
  ctx.strokeStyle = "rgba(184, 255, 61, 0.045)";
  ctx.lineWidth = 1;

  for (let x = -gap + offset; x < width + gap; x += gap) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + Math.sin(time * 0.4) * 30, height);
    ctx.stroke();
  }

  for (let y = -gap + offset; y < height + gap; y += gap) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y + Math.cos(time * 0.35) * 18);
    ctx.stroke();
  }

  ctx.restore();
}

function render() {
  time += 0.01;
  ctx.clearRect(0, 0, width, height);

  const pulse = (Math.sin(time * 2.2) + 1) / 2;
  drawAnomaly(width * 0.18, height * 0.26, Math.min(width, 980) * 0.55, `rgba(184, 255, 61, ${0.18 + pulse * 0.08})`, pulse);
  drawAnomaly(width * (0.78 + (pointer.x - 0.5) * 0.06), height * (0.42 + (pointer.y - 0.5) * 0.06), Math.min(width, 760) * 0.45, `rgba(227, 90, 44, ${0.14 + pulse * 0.05})`, pulse);

  drawGrid();

  for (const particle of particles) {
    particle.y -= particle.speed;
    particle.x += particle.drift + Math.sin(time + particle.glow * 6) * 0.12;

    if (particle.y < -10) {
      particle.y = height + 10;
      particle.x = Math.random() * width;
    }

    if (particle.x < -10) particle.x = width + 10;
    if (particle.x > width + 10) particle.x = -10;

    const alpha = 0.16 + particle.glow * 0.28;
    ctx.fillStyle = `rgba(214, 245, 154, ${alpha})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    ctx.fill();
  }

  drawNoise();
  requestAnimationFrame(render);
}

function updateCalculator() {
  const hours = Number(document.querySelector("#hours").value);
  const ambushes = Number(document.querySelector("#ambushes").value);
  const faith = Number(document.querySelector("#faith").value);

  document.querySelector("#hours-out").textContent = hours;
  document.querySelector("#ambushes-out").textContent = ambushes;
  document.querySelector("#faith-out").textContent = `${faith}%`;

  const score = Math.min(100, Math.max(0, Math.round(hours * 3.2 + ambushes * 2.6 + (100 - faith) * 0.55)));
  const verdict =
    score < 35
      ? "Пока терпимо. Вы еще можете выйти через меню, а не через драму."
      : score < 70
        ? "Средняя зона риска: уже спорите с игрой, но еще называете это интересом."
        : "Красная зона: скоро вы объясните стене, почему баланс опять в отпуске.";

  document.querySelector("#salt-score").textContent = score;
  document.querySelector("#salt-verdict").textContent = verdict;
}

function alignHashTarget() {
  if (!window.location.hash) return;

  const target = document.querySelector(window.location.hash);
  if (!target) return;

  target.scrollIntoView({ block: "start" });
}

function formatCountdown(value) {
  return `00:${String(value).padStart(2, "0")}`;
}

function updateCountdownUi() {
  if (countdownDisplay) countdownDisplay.textContent = formatCountdown(countdownRemaining);
}

function resetCountdown(silent = false) {
  clearInterval(countdownTimer);
  countdownTimer = null;
  countdownRemaining = 17;
  updateCountdownUi();

  if (!silent && countdownStatus) {
    countdownStatus.textContent = "Таймер сброшен. Зона снова делает вид, что никуда не торопится.";
  }
}

function startCountdown() {
  if (countdownTimer) return;
  if (countdownStatus) {
    countdownStatus.textContent = "Сирена пошла. У вас осталось несколько секунд на последний хороший выбор.";
  }

  updateCountdownUi();
  countdownTimer = setInterval(() => {
    countdownRemaining -= 1;
    updateCountdownUi();

    if (countdownRemaining <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
      if (countdownStatus) {
        countdownStatus.textContent = "Поздно. Выброс пришел по расписанию и без уважения к нервной системе.";
      }
      triggerEmission();
      window.setTimeout(() => resetCountdown(true), 1800);
    }
  }, 1000);
}

function resetSession() {
  clearInterval(sessionTimer);
  sessionTimer = null;
  sessionStep = 0;
  if (sessionClock) sessionClock.textContent = "00:00";
  if (sessionLog) {
    sessionLog.innerHTML = "<li>Готовность: пользователь еще верит в счастливый исход.</li>";
  }
}

function addSessionEvent() {
  if (!sessionLog || !sessionClock) return;

  const event = sessionEvents[sessionStep];
  if (!event) {
    clearInterval(sessionTimer);
    sessionTimer = null;
    return;
  }

  const item = document.createElement("li");
  item.textContent = event.text;
  sessionLog.appendChild(item);
  sessionClock.textContent = event.time;
  sessionLog.scrollTop = sessionLog.scrollHeight;
  sessionStep += 1;

  if (sessionStep >= sessionEvents.length) {
    clearInterval(sessionTimer);
    sessionTimer = null;
  }
}

function startSession() {
  resetSession();
  addSessionEvent();
  sessionTimer = setInterval(addSessionEvent, 850);
}

function moveDownloadButton() {
  if (!downloadBait || !saveMessage) return;

  const zone = downloadBait.parentElement;
  const safeX = 20;
  const safeY = 86;
  const maxLeft = Math.max(safeX, zone.clientWidth - downloadBait.offsetWidth - safeX);
  const maxTop = Math.max(safeY, zone.clientHeight - downloadBait.offsetHeight - 104);
  const nextLeft = Math.round(safeX + Math.random() * Math.max(1, maxLeft - safeX));
  const nextTop = Math.round(safeY + Math.random() * Math.max(1, maxTop - safeY));

  downloadBait.style.left = `${nextLeft}px`;
  downloadBait.style.top = `${nextTop}px`;
  downloadBait.style.transform = `rotate(${Math.random() > 0.5 ? 3 : -3}deg)`;
  saveMessage.textContent = "Нет. Я тебя спасаю. Отойди от кнопки и сохрани остатки вечера.";
}

function openRescueModal() {
  if (rescueModal) rescueModal.classList.add("is-open");
}

function closeRescueModal() {
  if (rescueModal) rescueModal.classList.remove("is-open");
}

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioContext) audioContext = new AudioContextClass();
  return audioContext;
}

function updateAmbientButton() {
  if (!ambientToggle) return;
  ambientToggle.textContent = ambientEnabled ? "Выключить фон зоны" : "Включить фон зоны";
  ambientToggle.classList.toggle("is-active", ambientEnabled);
}

function createNoiseBuffer(audio, duration) {
  const sampleCount = Math.floor(audio.sampleRate * duration);
  const buffer = audio.createBuffer(1, sampleCount, audio.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < sampleCount; i += 1) {
    const fade = 1 - i / sampleCount;
    data[i] = (Math.random() * 2 - 1) * fade;
  }

  return buffer;
}

function createDistortionCurve(amount) {
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;

  for (let i = 0; i < samples; i += 1) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }

  return curve;
}

function queueAmbientTick() {
  if (!ambientEnabled) return;

  const wait = 1800 + Math.random() * 4200;
  ambientTickTimer = window.setTimeout(() => {
    if (!ambientEnabled) return;

    const tick = geigerAudio.cloneNode();
    tick.volume = 0.12 + Math.random() * 0.18;
    tick.playbackRate = 0.94 + Math.random() * 0.16;
    const playback = tick.play();
    if (playback && typeof playback.catch === "function") playback.catch(() => {});
    queueAmbientTick();
  }, wait);
}

function startAmbientSound() {
  if (ambientEnabled) return;

  ambientEnabled = true;
  updateAmbientButton();
  ambientLoop.pause();
  ambientLoop.currentTime = 0;
  ambientLoop.volume = 0.18;

  const playback = ambientLoop.play();
  if (playback && typeof playback.catch === "function") {
    playback.catch(() => {
      ambientEnabled = false;
      updateAmbientButton();
      if (countdownStatus) {
        countdownStatus.textContent = "Браузер не дал автозапуск звука. Если что, фон зоны можно включить кнопкой ниже.";
      }
    });
  }
  queueAmbientTick();

  if (countdownStatus) {
    countdownStatus.textContent = "Фон зоны включен: ветер шуршит, дозиметр жив, нервы под наблюдением.";
  }
}

function stopAmbientSound() {
  if (!ambientEnabled) return;

  ambientEnabled = false;
  updateAmbientButton();

  if (ambientTickTimer) {
    clearTimeout(ambientTickTimer);
    ambientTickTimer = null;
  }
  ambientLoop.pause();
  ambientLoop.currentTime = 0;

  if (countdownStatus) {
    countdownStatus.textContent = "Фон зоны выключен. Даже эфир понял, что надо дать вам передохнуть.";
  }
}

function toggleAmbientSound() {
  if (ambientEnabled) {
    stopAmbientSound();
  } else {
    startAmbientSound();
  }
}

function playSyntheticEmissionSound() {
  const audio = getAudioContext();
  if (!audio) return;

  if (audio.state === "suspended") audio.resume();

  const now = audio.currentTime;
  const master = audio.createGain();
  const compressor = audio.createDynamicsCompressor();
  const distortion = audio.createWaveShaper();
  distortion.curve = createDistortionCurve(70);
  distortion.oversample = "4x";
  compressor.threshold.setValueAtTime(-18, now);
  compressor.knee.setValueAtTime(22, now);
  compressor.ratio.setValueAtTime(7, now);
  compressor.attack.setValueAtTime(0.004, now);
  compressor.release.setValueAtTime(0.28, now);
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.88, now + 0.06);
  master.gain.exponentialRampToValueAtTime(0.62, now + 0.72);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
  master.connect(distortion).connect(compressor).connect(audio.destination);

  const impact = audio.createOscillator();
  const impactGain = audio.createGain();
  impact.type = "sine";
  impact.frequency.setValueAtTime(48, now);
  impact.frequency.exponentialRampToValueAtTime(22, now + 0.58);
  impactGain.gain.setValueAtTime(0.0001, now);
  impactGain.gain.exponentialRampToValueAtTime(0.95, now + 0.025);
  impactGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);
  impact.connect(impactGain).connect(master);
  impact.start(now);
  impact.stop(now + 1.25);

  const rumble = audio.createOscillator();
  const rumbleGain = audio.createGain();
  rumble.type = "sawtooth";
  rumble.frequency.setValueAtTime(118, now + 0.08);
  rumble.frequency.exponentialRampToValueAtTime(34, now + 2.2);
  rumbleGain.gain.setValueAtTime(0.0001, now + 0.08);
  rumbleGain.gain.exponentialRampToValueAtTime(0.42, now + 0.28);
  rumbleGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.55);
  rumble.connect(rumbleGain).connect(master);
  rumble.start(now + 0.08);
  rumble.stop(now + 2.65);

  const siren = audio.createOscillator();
  const sirenGain = audio.createGain();
  siren.type = "triangle";
  siren.frequency.setValueAtTime(340, now);
  siren.frequency.linearRampToValueAtTime(1040, now + 0.42);
  siren.frequency.linearRampToValueAtTime(620, now + 0.72);
  siren.frequency.linearRampToValueAtTime(1680, now + 1.18);
  siren.frequency.exponentialRampToValueAtTime(260, now + 2.45);
  sirenGain.gain.setValueAtTime(0.0001, now);
  sirenGain.gain.exponentialRampToValueAtTime(0.34, now + 0.14);
  sirenGain.gain.linearRampToValueAtTime(0.24, now + 1.25);
  sirenGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.55);
  siren.connect(sirenGain).connect(master);
  siren.start(now);
  siren.stop(now + 2.65);

  const alarm = audio.createOscillator();
  const alarmGain = audio.createGain();
  alarm.type = "square";
  alarm.frequency.setValueAtTime(620, now + 0.22);
  alarm.frequency.setValueAtTime(930, now + 0.46);
  alarm.frequency.setValueAtTime(620, now + 0.7);
  alarm.frequency.setValueAtTime(930, now + 0.94);
  alarmGain.gain.setValueAtTime(0.0001, now + 0.18);
  alarmGain.gain.exponentialRampToValueAtTime(0.18, now + 0.24);
  alarmGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);
  alarm.connect(alarmGain).connect(master);
  alarm.start(now + 0.18);
  alarm.stop(now + 1.32);

  const wind = audio.createBufferSource();
  const windFilter = audio.createBiquadFilter();
  const windGain = audio.createGain();
  wind.buffer = createNoiseBuffer(audio, 2.7);
  windFilter.type = "bandpass";
  windFilter.frequency.setValueAtTime(180, now);
  windFilter.frequency.exponentialRampToValueAtTime(2600, now + 0.75);
  windFilter.frequency.exponentialRampToValueAtTime(520, now + 2.35);
  windFilter.Q.setValueAtTime(0.72, now);
  windGain.gain.setValueAtTime(0.0001, now);
  windGain.gain.exponentialRampToValueAtTime(0.56, now + 0.12);
  windGain.gain.linearRampToValueAtTime(0.28, now + 1.4);
  windGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.75);
  wind.connect(windFilter).connect(windGain).connect(master);
  wind.start(now);
  wind.stop(now + 2.8);

  [0.18, 0.37, 0.58, 0.92, 1.36].forEach((offset, index) => {
    const crack = audio.createBufferSource();
    const crackFilter = audio.createBiquadFilter();
    const crackGain = audio.createGain();
    crack.buffer = createNoiseBuffer(audio, 0.16);
    crackFilter.type = "highpass";
    crackFilter.frequency.setValueAtTime(1200 + index * 420, now + offset);
    crackGain.gain.setValueAtTime(0.0001, now + offset);
    crackGain.gain.exponentialRampToValueAtTime(0.28 - index * 0.025, now + offset + 0.01);
    crackGain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.15);
    crack.connect(crackFilter).connect(crackGain).connect(master);
    crack.start(now + offset);
    crack.stop(now + offset + 0.18);
  });
}

function playEmissionSound() {
  emissionAudio.pause();
  emissionAudio.currentTime = 0;
  emissionAudio.volume = 0.95;
  emissionAudio.playbackRate = 1.12;

  const playback = emissionAudio.play();
  if (playback && typeof playback.catch === "function") {
    playback.catch(playSyntheticEmissionSound);
  }
}

function triggerEmission() {
  if (ambientEnabled) {
    ambientLoop.volume = 0.08;
    window.setTimeout(() => {
      if (ambientEnabled) ambientLoop.volume = 0.18;
    }, 2200);
  }
  playEmissionSound();
  document.body.classList.remove("emission-active");
  void document.body.offsetWidth;
  document.body.classList.add("emission-active");
  setTimeout(() => document.body.classList.remove("emission-active"), 1900);
}

function setPlayerType(key) {
  const data = playerTypes[key];
  if (!data || !playerDiagnosis) return;

  playerTabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.player === key));
  playerDiagnosis.innerHTML = `<span>${data.label}</span><h3>${data.title}</h3><p>${data.text}</p>`;
}

function generateExcuse() {
  if (!excuseOutput) return;
  const current = excuseOutput.textContent.replace(/[“”"]/g, "");
  let next = excuses[Math.floor(Math.random() * excuses.length)];

  if (excuses.length > 1) {
    while (next === current) {
      next = excuses[Math.floor(Math.random() * excuses.length)];
    }
  }

  excuseOutput.textContent = `“${next}”`;
}

function generateIntercept() {
  if (!interceptLine || !interceptMeta) return;

  const current = interceptLine.textContent.replace(/[“”"]/g, "");
  let next = interceptMessages[Math.floor(Math.random() * interceptMessages.length)];

  if (interceptMessages.length > 1) {
    while (next.line === current) {
      next = interceptMessages[Math.floor(Math.random() * interceptMessages.length)];
    }
  }

  interceptLine.textContent = `“${next.line}”`;
  interceptMeta.textContent = next.meta;
}

function showMapPlace(button) {
  if (!mapDiagnosis) return;

  mapButtons.forEach((item) => item.classList.toggle("is-active", item === button));
  mapDiagnosis.innerHTML = `<span>Локальная аномалия</span><strong>${button.dataset.place}</strong><p>${button.dataset.desc}</p>`;
}

function translatePatchNote() {
  if (!patchInput || !patchOutput) return;

  const source = patchInput.value.trim().toLowerCase();
  const match = patchTranslations.find((item) => item.keywords.some((keyword) => source.includes(keyword)));
  patchOutput.textContent = match
    ? match.text
    : "Перевод не найден, но это тревожный знак: скорее всего, страдать придется экспериментальным способом.";
}

function usePatchPhrase(phrase) {
  if (!patchInput) return;
  patchInput.value = phrase;
  translatePatchNote();
}

function useRandomPatchPhrase() {
  if (!patchPresetButtons.length) return;
  const phrases = Array.from(patchPresetButtons, (button) => button.dataset.patch).filter(Boolean);
  usePatchPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
}

function signContract() {
  const card = document.querySelector(".contract-card");
  if (card) card.classList.add("is-signed");
  if (contractResult) {
    contractResult.textContent = "Контракт принят. Зона вежливо забрала вечер и оставила вам чувство, что это было ваше решение.";
  }
}

document.addEventListener("pointermove", (event) => {
  pointer.x = event.clientX / Math.max(1, window.innerWidth);
  pointer.y = event.clientY / Math.max(1, window.innerHeight);
});

document.querySelectorAll(".calculator input").forEach((input) => {
  input.addEventListener("input", updateCalculator);
});

if (sessionStart) sessionStart.addEventListener("click", startSession);
if (sessionReset) sessionReset.addEventListener("click", resetSession);
if (downloadBait) {
  downloadBait.addEventListener("mouseenter", moveDownloadButton);
  downloadBait.addEventListener("click", openRescueModal);
}
if (rescueClose) rescueClose.addEventListener("click", closeRescueModal);
if (rescueModal) {
  rescueModal.addEventListener("click", (event) => {
    if (event.target === rescueModal) closeRescueModal();
  });
}
if (emissionTrigger) emissionTrigger.addEventListener("click", triggerEmission);
if (countdownStart) countdownStart.addEventListener("click", startCountdown);
if (countdownReset) countdownReset.addEventListener("click", () => resetCountdown(false));
if (ambientToggle) ambientToggle.addEventListener("click", toggleAmbientSound);
playerTabs.forEach((tab) => {
  tab.addEventListener("click", () => setPlayerType(tab.dataset.player));
});
if (excuseButton) excuseButton.addEventListener("click", generateExcuse);
if (interceptButton) interceptButton.addEventListener("click", generateIntercept);
mapButtons.forEach((button) => {
  button.addEventListener("click", () => showMapPlace(button));
});
forumThreads.forEach((thread) => {
  const button = thread.querySelector("button");
  if (button) button.addEventListener("click", () => thread.classList.toggle("is-open"));
});
if (patchTranslate) patchTranslate.addEventListener("click", translatePatchNote);
patchPresetButtons.forEach((button) => {
  button.addEventListener("click", () => usePatchPhrase(button.dataset.patch));
});
if (patchRandom) patchRandom.addEventListener("click", useRandomPatchPhrase);
if (patchInput) {
  patchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") translatePatchNote();
  });
}
if (contractSign) contractSign.addEventListener("click", signContract);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeRescueModal();
});

if (tickerTrack) {
  tickerTrack.innerHTML += tickerTrack.innerHTML;
}

revealTargets.forEach((target) => target.classList.add("reveal-target"));

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );

  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-revealed"));
}

resizeCanvas();
updateCalculator();
updateCountdownUi();
updateAmbientButton();
render();
window.addEventListener("resize", resizeCanvas);
window.addEventListener("load", () => {
  window.setTimeout(() => {
    if (!ambientEnabled) startAmbientSound();
  }, 180);
  requestAnimationFrame(() => {
    alignHashTarget();
    window.setTimeout(alignHashTarget, 180);
  });
});
