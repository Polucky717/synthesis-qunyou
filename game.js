/* ============================================================
 * 合成大群友 —— 仿照「合成大院系」制作（整体架构照搬 https://bu.eltaos.top/，
 * 即「合成世界第一的大学」/ GreatUSTC 社区项目 myustc.feixu.site/GreatUSTC）。
 * 在原站 game.js 之上保留原版三处适配，并追加群友版适配：
 *   P1 渐进解锁投放（progressiveUnlock 配置：可投上限随合成进度提升，顶部平坦权重）
 *   P2 头像运行时圆形化兜底 —— QQ 头像式截取：居中裁方铺满 + 统一黑色描边
 *      （预生成的 assets/img/round/*.png 已是圆形徽章，自动跳过本处理）
 *   P3 可选合成目标（选群友为终极目标、其余随机排列、背景主题随目标切换）
 *   Q1 胜利结算：合成出目标群友即结束游戏（短暂庆祝后弹出结算卡；原版达成后可继续堆）
 *   Q2 统一标题：无论合成哪个群友，标题恒为「合成大群友」
 *   Q3 无彩蛋：原版「合成大清华」链顶彩蛋整体移除，合成链固定 13 级
 *   Q4 合成图鉴：只有合成出目标群友（胜利）才入鉴——选择界面统计「已合成成功 N /
 *      总数」位群友（跨局累计、本地保存），入鉴的群友卡片标记「合成成功」；
 *      头像描边统一黑色
 *   Q6 群主彩蛋（Chespy = 群主）：图鉴收入群主后 armed——选择界面点 Chespy 进入
 *      展示态（其卡片变深、头像下方黄色「群主」框，其余群友头像下方红色「禁言」框，
 *      原「合成成功」标记一律不显示）；再点 Chespy 正常开局；点「禁言」将该群友
 *      标记已禁言（卡片变淡、弹出「✕ 该群友已被禁言」、此后不可选、跨局保存）；
 *      禁言满其余全部群友触发终章：自动滚到群主 → 其余内容渐隐 → 群主卡片最后
 *      渐隐（操作按钮随后恢复，随机目标只会选到群主）
 * 其余逻辑与原站 game.js 保持一致。
 * ============================================================ */
(function () {
  "use strict";

  var canvas = document.getElementById("gameCanvas");
  var ctx = canvas.getContext("2d");

  var pageDescription = document.getElementById("pageDescription");
  var gameTitleElement = document.getElementById("gameTitle");
  var scoreElement = document.getElementById("score");
  var bestScoreElement = document.getElementById("bestScore");
  var gameOverOverlay = document.getElementById("gameOverOverlay");
  var gameOverMessage = document.getElementById("gameOverMessage");
  var finalScoreElement = document.getElementById("finalScore");
  var highestItemImage = document.getElementById("highestItemImage");
  var newRecordElement = document.getElementById("newRecord");
  var againButton = document.getElementById("againButton");
  var continueMergeButton = document.getElementById("continueMergeButton");
  var menuReturnButton = document.getElementById("menuReturnButton");
  var soundButton = document.getElementById("soundButton");
  var soundIcon = document.getElementById("soundIcon");
  var restartButton = document.getElementById("restartButton");
  var headerActions = document.getElementById("headerActions");
  var restartConfirmOverlay = document.getElementById("restartConfirmOverlay");
  var restartCancelButton = document.getElementById("restartCancelButton");
  var restartConfirmButton = document.getElementById("restartConfirmButton");
  var targetBanner = document.getElementById("targetBanner");
  var targetBannerImage = document.getElementById("targetBannerImage");
  var targetBannerText = document.getElementById("targetBannerText");
  var targetBannerSubtext = document.getElementById("targetBannerSubtext");
  var targetButton = document.getElementById("targetButton");
  var targetOverlay = document.getElementById("targetOverlay");
  var targetGrid = document.getElementById("targetGrid");
  var targetStatsElement = document.getElementById("targetStats");  /* Q4: 已合成统计 */
  var targetEyebrow = document.getElementById("targetEyebrow");     /* Q6: 终章渐隐 */
  var targetTitleElement = document.getElementById("targetTitle");  /* Q6: 终章渐隐 */
  var targetActions = document.getElementById("targetActions");     /* Q6: 终章渐隐后恢复 */
  var muteToast = document.getElementById("muteToast");             /* Q6: 禁言弹窗 */
  var cinemaWhite = document.getElementById("cinemaWhite");         /* Q6: 终章白幕（盖住棋盘渐变） */
  var challengeOverlay = document.getElementById("challengeOverlay");         /* Q6: 特殊挑战 */
  var challengeIntro = document.getElementById("challengeIntro");             /* Q6: 挑战开场 */
  var challengePick = document.getElementById("challengePick");               /* Q6: 挑战选择面板 */
  var challengeResult = document.getElementById("challengeResult");           /* Q6: 挑战结算面板 */
  var challengeConfirm = document.getElementById("challengeConfirm");         /* Q6: 禁言确认行 */
  var challengeGrid = document.getElementById("challengeGrid");               /* Q6: 挑战 15 人网格 */
  var challengePickTitle = document.getElementById("challengePickTitle");     /* Q6: 选择禁言标题 */
  var challengeNote = document.getElementById("challengeNote");               /* Q6: 三行说明 */
  var challengeResultTitle = document.getElementById("challengeResultTitle");
  var challengeResultActions = document.getElementById("challengeResultActions");
  var challengeResultImage = document.getElementById("challengeResultImage");   /* Q7: 挑战结算胜/败图片 */
  var challengePigIntro = document.getElementById("challengePigIntro");         /* Q7: 小猪挑战开场 */
  var challengePigRules = document.getElementById("challengePigRules");         /* Q7: 小猪挑战规则 */
  var pigStartChallengeButton = document.getElementById("pigStartChallengeButton");
  /* ===== 主界面 + 特殊挑战菜单 ===== */
  var mainMenuOverlay = document.getElementById("mainMenuOverlay");
  var menuTitle = document.getElementById("menuTitle");                     /* 主界面标题（供测试读取） */
  var menuStartButton = document.getElementById("menuStartButton");
  var menuChallengeButton = document.getElementById("menuChallengeButton");
  var menuToast = document.getElementById("menuToast");
  var menuToastText = document.getElementById("menuToastText");
  var challengeMenuOverlay = document.getElementById("challengeMenuOverlay");
  var challengeMenuTitle = document.getElementById("challengeMenuTitle");   /* 菜单标题（供测试读取） */
  var challengeMenuList = document.getElementById("challengeMenuList");
  var menuPigSurround = document.getElementById("menuPigSurround");         /* Q7: 主界面「被群友包围了」 */
  var pigCaptured = document.getElementById("pigCaptured");                 /* Q7: 「被捕捉的小猪」动图 */
  var boardWhiteout = document.getElementById("boardWhiteout");             /* Q7: 解锁演出背景淡出层 */
  var pigRetryOverlay = document.getElementById("pigRetryOverlay");         /* Q7: 失败重试弹窗 */
  var challengeEroIntro = document.getElementById("challengeEroIntro");     /* Q8: Erosion 开场字幕 */
  var eroBlackout = document.getElementById("eroBlackout");                 /* Q8: 失败黑化遮罩 */
  var eroRetryOverlay = document.getElementById("eroRetryOverlay");         /* Q8: 失败重试弹窗 */
  var eroRetryExitButton = document.getElementById("eroRetryExitButton");
  var eroRetryGoButton = document.getElementById("eroRetryGoButton");
  var challengeExitOverlay = document.getElementById("challengeExitOverlay"); /* 挑战退出确认 */
  var challengeExitCancelButton = document.getElementById("challengeExitCancelButton");
  var challengeExitConfirmButton = document.getElementById("challengeExitConfirmButton");
  var pigRetryExitButton = document.getElementById("pigRetryExitButton");
  var pigRetryGoButton = document.getElementById("pigRetryGoButton");
  var challengeMenuBackButton = document.getElementById("challengeMenuBackButton");
  var challengeRetryButton = document.getElementById("challengeRetryButton");
  var challengeContinueButton = document.getElementById("challengeContinueButton");
  var challengeConfirmText = document.getElementById("challengeConfirmText");
  var challengeConfirmYesButton = document.getElementById("challengeConfirmYesButton");
  var challengeConfirmNoButton = document.getElementById("challengeConfirmNoButton");
  var targetRandomButton = document.getElementById("targetRandomButton");
  var targetCancelButton = document.getElementById("targetCancelButton");
  var targetMenuButton = document.getElementById("targetMenuButton");       /* 选择界面：回到主界面 */

  var WORLD_WIDTH = 400;
  var WORLD_HEIGHT = 620;
  var MIN_CANVAS_WIDTH = 1024;
  var LEFT_WALL = 0;
  var RIGHT_WALL = WORLD_WIDTH;
  var FLOOR = WORLD_HEIGHT;
  var DANGER_LINE = 90;
  var DANGER_PROXIMITY = 80;
  var SPAWN_Y = DANGER_LINE / 2;
  var MAX_ITEM_RADIUS = (RIGHT_WALL - LEFT_WALL) / 2 - 1;
  var MAX_SCORE = Number.MAX_SAFE_INTEGER;

  var FIXED_STEP = 1 / 120;
  var MAX_STEPS = 8;
  var GRAVITY = 1480;
  var SOLVER_ITERATIONS = 16;
  var AIR_DAMPING = 0.998;
  var GROUND_DRAG = 4.4;
  var CIRCLE_RESTITUTION = 0.06;
  var WALL_RESTITUTION = 0.035;
  var FRICTION = 0.13;
  var MAX_SPEED = 1700;
  var DANGER_DELAY = 1.35;
  var HIGHEST_CELEBRATION_DURATION = 3.2;
  var FAILURE_SWEEP_DURATION = 1.25;
  var FAILURE_SETTLE_DURATION = 0.76;
  var MACHINE_VERSION = 1;

  var DEFAULT_RADII = [13, 17, 22, 28, 35, 43, 51, 60, 70, 80, 91];
  var DEFAULT_COLORS = ["#e84d5b", "#f26b73", "#8f6ccf", "#ff9f43", "#f3cc30", "#79b94f", "#df4b3f", "#f38ba7", "#e5ab33", "#a77757", "#39ad65"];
  var CELEBRATION_COLORS = ["#fff27a", "#ff9eb5", "#8ce7ff", "#c5a3ff", "#ffffff", "#ffbd57"];
  /* 小猪配色彩带（解锁演出专用：粉系 + 奶油 + 点缀金） */
  var PIG_CELEBRATION_COLORS = ["#ff8fab", "#ffa8c5", "#f783ac", "#ffd166", "#ffe3ee", "#ffffff"];
  var CELEBRATION_BURST_TIMES = [0.5, 0.94, 1.4, 1.9];
  var DEFAULT_SPAWN_LEVEL_COUNT = 5;
  var CONFIG = normalizeConfig(window.MERGE_GAME_CONFIG);
  var LEVELS = CONFIG.levels;
  var LEVEL_ASSETS = preloadLevelAssets();
  var COLLEGES = CONFIG.colleges;   /* P3: 群友池（可选合成目标，昵称 = 照片文件名） */

  var items = [];
  var particles = [];
  var celebrationParticles = [];
  var failureBlasts = [];
  var floaters = [];
  var highestCelebration = null;
  var failureSequence = null;
  var victorySequence = null;   /* Q1: 达成目标后的庆祝计时，到点弹出胜利结算卡 */
  var mode = "loading";
  var score = 0;
  var bestScore = loadBestScore();
  var bestBeforeGame;
  var maxLevelReached = 0;
  var targetAchieved = false;
  var highestMergedLevel = 0;   /* P1: 最高已合成等级（解锁投放用） */
  var currentMaxDropLevel = 1;  /* P1: 当前可投最高级 */
  var currentLevel = 0;
  var aimX = WORLD_WIDTH / 2;
  var readyToDrop = false;
  var dropCooldown = 0;
  var activePointer = null;
  var nextItemId = 1;
  var dangerTimer = 0;
  var dangerIsNear = false;
  var dangerIsCrossed = false;
  var shake = 0;
  var accumulator = 0;
  var lastFrameTime = performance.now();
  var dpr = 1;
  var canvasScaleX = 1;
  var canvasScaleY = 1;
  var soundEnabled = true;
  var audioContext = null;
  var targetCollegeKey = null;  /* P3: 当前合成目标群友 key */
  var pickerCanCancel = false;  /* P3: 目标选择弹窗可否取消（对局中打开时） */
  var synthesizedKeys = loadSynthesized();  /* Q4: 已合成成功的群友 key 集合（跨局累计，本地保存） */
  var mutedKeys = loadMuted();              /* Q6: 被禁言的群友 key 集合（跨局保留、本地保存） */
  var eggMode = false;                      /* Q6: 群主彩蛋展示态（点 Chespy 进入） */
  var eggFinaleStarted = false;             /* Q6: 终章（全员禁言后）已触发（仅当次选择会话） */
  var eggDone = loadEggDone();              /* Q6: 挑战解锁成功后彩蛋永久关闭；解锁前失败可重复触发 */

  /* ===== Q7: 第二个特殊挑战「直到群友变成一群小猪」 ===== */
  var PIG_DIR = "challenge/challenge-pig/";
  var PIG_LEVEL_DEFS = [                    /* 1-12 级小猪（第 13 级 = 唱片猪） */
    { name: "古典猪", image: PIG_DIR + "pig-game/古典猪.png", color: "#f2a0b5" },
    { name: "猪堡", image: PIG_DIR + "pig-game/猪堡.png", color: "#f4b26e" },
    { name: "猪冰冰", image: PIG_DIR + "pig-game/猪冰冰.png", color: "#9fd8ef" },
    { name: "云猪", image: PIG_DIR + "pig-game/云猪.jpg", color: "#d7d2f2" },
    { name: "彩虹云猪", image: PIG_DIR + "pig-game/彩虹云猪.jpg", color: "#f7b8d4" },
    { name: "抽象猪", image: PIG_DIR + "pig-game/抽象猪.png", color: "#c9b06b" },
    { name: "艺术猪", image: PIG_DIR + "pig-game/艺术猪.png", color: "#8fbf6f" },
    { name: "油画猪", image: PIG_DIR + "pig-game/油画猪.png", color: "#d9a441" },
    { name: "梵高猪", image: PIG_DIR + "pig-game/梵高猪.png", color: "#5f79c9" },
    { name: "油炸猪", image: PIG_DIR + "pig-game/油炸猪.jpg", color: "#e0a23e" },
    { name: "机器猪(赛博朋克猪)", image: PIG_DIR + "pig-game/机器猪(赛博朋克猪).png", color: "#7f5fd0" },
    { name: "黄金猪(存钱罐猪)", image: PIG_DIR + "pig-game/黄金猪(存钱罐猪).png", color: "#d9b23a" }
  ];
  var PIG_TARGET_IMAGE = PIG_DIR + "pig-game/唱片猪(旋转猪).gif";
  var PIG_ASSETS = {
    surround: PIG_DIR + "pig-unlock/被群友包围了.jpg",
    captured: PIG_DIR + "pig-unlock/被捕捉的小猪.gif",
    where: PIG_DIR + "profile-challenge/猪呢.jpg",
    noOink: PIG_DIR + "pig-rule/禁止猪叫.jpg",
    pigSmall: PIG_DIR + "pig-rule/特小猪.jpg",
    pigBig: PIG_DIR + "pig-rule/特大猪.png"
  };
  var PIG_RESULT_WIN = [
    PIG_DIR + "profile-win/我以后天天笑(聪明版).png",
    PIG_DIR + "profile-win/猪名言(哼唧！).png"
  ];
  var PIG_RESULT_FAIL = [
    PIG_DIR + "profile-fail/笨猪.jpg",
    PIG_DIR + "profile-fail/鉴定为笨猪.jpg",
    PIG_DIR + "profile-fail/你已笨哭猪.jpg",
    PIG_DIR + "profile-fail/恶语相向 猪.jpg",
    PIG_DIR + "profile-fail/很遗憾地告诉你，你确诊了笨笨.jpg"
  ];
  var PIG_COLLECT_TOTAL = 5;                /* 共需收集 5 只小猪（①1 + ②3 + ③1） */
  var PIG_CAPTURE_MAX = 3;                  /* ②被捕捉的小猪最多贡献 3 只 */
  var pigProgress = loadPigProgress();      /* { menuClicked, captured, pigMade, best, passed } */
  var challengeKind = "owner";              /* 当前挑战种类：owner=我才是群主 | pig=小猪 */
  var pigChain = [];                        /* 小猪挑战的 12 位群友 */
  var pigUnlockActive = false;              /* 解锁流程：合成唱片猪的对局进行中 */
  var pigGlowBody = null;                   /* 解锁演出：先四周闪光的那只唱片猪 */
  var pigFly = null;                        /* 解锁演出：爆炸结束后小猪平移到正中间的动画状态 */
  var pigBlastActive = false;               /* 解锁演出：逐波爆炸进行中（暂停合成判定） */
  var pigSpawnSincePig = 0;                 /* 小猪挑战投放计数：每两只群友后释放一只小猪 */
  var spawnIsPig = false;                   /* 本次投放是否为小猪（小猪挑战交替投放） */
  /* ===== Q8: 特殊挑战「Erosion」 ===== */
  var ERO_TARGET_IMAGE = "challenge/erosion.png";   /* Erosion 头像/链顶球图（challenge/ 不加 assets/ 前缀） */
  var ERO_CHAIN_LENGTH = 12;                /* Erosion 挑战合成链长度：11 位群友 + 链顶 Erosion 球 */
  var ERO_IDLE_TRIGGER = 3;                 /* 异常局：合成出 10 级球后静止 3 秒开始上蔓延 */
  var ERO_RISE_DURATION = 7;                /* 黑色从底部蔓延到棋盘顶用时（秒） */
  var ERO_RETREAT_DURATION = 2.2;           /* 投放打断后黑色退回底部用时（秒） */
  var ERO_TEASE_PEAK = 0.12;                /* 10 级球合成瞬间：黑色试探上升高度（棋盘占比） */
  var ERO_TEASE_RISE = 0.4;                 /* 试探上升用时（秒） */
  var ERO_TEASE_DROP = 0.22;                /* 试探后突然落回用时（秒） */
  var eroTeaseAge = -1;                     /* 「先升一点后突然落下」演出计时（-1=未在演出） */
  var ERO_BASE_FRONT = 0.03;                /* 异常局底部初始黑色高度（棋盘高的 3%，遮挡小球） */
  var ERO_FOCUS_MAX_AGE = 2.2;              /* 单颗亮着的小球视野跟随时长上限（秒）：到点强制交棒 */
  var ERO_REVEAL_DURATION = 3.4;            /* 成功后黑色以目标为中心向外退散露出全场的时长（秒，缓慢） */
  var erodeProgress = loadErodeProgress();  /* { unlocked, passed, best, anomalies: [] } */
  var eroChain = [];                        /* Erosion 挑战的 11 位群友 */
  var eroGameActive = false;                /* 选择页异常群友的异常合成局进行中 */
  var eroAnomalyKey = null;                 /* 当前异常局对应的群友 key */
  var eroCurrentGameAnomalous = false;      /* 本局是否异常局（用于退出时是否累计异常） */
  var eroFront = 0;                         /* 黑色蔓延前沿 0~1（0=底部起始，1=棋盘顶） */
  var eroFrontState = "idle";               /* idle=静止 | rising=上蔓延 | retreating=回退 */
  var eroIdleTime = 0;                      /* 距上次投放的静止时长（秒） */
  var eroArmed = false;                     /* 已合成出 10 级球（蔓延机制已解锁） */
  var eroUnlocking = false;                 /* 解锁演出进行中 */
  var eroFocusBody = null;                  /* 挑战视野：当前亮着的小球 */
  var eroFocusStable = 0;                   /* 当前小球稳定计时（秒） */
  var eroFocusAge = 0;                      /* 当前小球视野跟随时长（秒） */
  var eroReveal = null;                     /* 成功：从目标球向外溶解的白幕 { x, y, r, age, duration } */
  var mainMenuVisitedOnce = false;          /* 主界面是否已出现过（②只在其后的返回时触发） */
  var muteToastTimer = 0;
  /* ===== Q6: 特殊挑战「我才是群主」 ===== */
  var challengeActive = false;              /* 挑战流程进行中 */
  var challengePhase = null;                /* intro | pick | playing | success | failed | null */
  var challengeMembers = [];                /* 挑战选中的 15 位群友（链序） */
  var challengeTargetKey = null;            /* 秘密合成目标 = 链顶（不显示是哪个） */
  var challengeChain = [];                  /* 15 级合成链（含目标，顺序即等级顺序） */
  var challengeDisplay = [];                /* 选择界面的展示顺序（与链序无关，防观察） */
  var challengeMutedKey = null;             /* 挑战中禁言的群友 */
  var challengeSkipLevel = -1;              /* 被禁言小球所在等级（-1 = 无跳过） */
  var challengePendingKey = null;           /* 待确认禁言的群友 */
  var challengeTimers = [];                 /* 终章/挑战时间线句柄 */
  var challengeProgress = loadChallengeProgress();  /* 挑战解锁进度（本地） */
  var challengeUnlocked = challengeProgress.unlocked;  /* 「我才是群主」是否已解锁（通过一次） */
  var challengeBest = challengeProgress.best;          /* 「我才是群主」历史最高分 */
  var challengeEntry = "egg";               /* 本次挑战入口：egg（彩蛋终章）| menu（特殊挑战菜单） */
  var menuToastTimer = null;                /* 主界面提示弹窗计时器 */
  var topbarHidden = false;                 /* 顶栏（标题/提示/分数）当前是否隐藏 */
  var reducedMotionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
  }

  function prefersReducedMotion() {
    return Boolean(reducedMotionQuery && reducedMotionQuery.matches);
  }

  function textOr(value, fallback) {
    return typeof value === "string" && value.trim() ? value : fallback;
  }

  function defaultLevels() {
    return DEFAULT_RADII.map(function (radius, index) {
      return {
        radius: radius,
        score: index === 0 ? 0 : Math.pow(2, index),
        color: DEFAULT_COLORS[index],
        image: ""
      };
    });
  }

  function normalizeImage(rawImage) {
    return typeof rawImage === "string" ? rawImage.trim() : "";
  }

  function normalizeCollege(rawCollege, index) {
    var college = rawCollege && typeof rawCollege === "object" ? rawCollege : {};
    return {
      key: textOr(college.key, "college-" + index),
      name: textOr(college.name, textOr(college.key, "书院 " + (index + 1))),
      short: textOr(college.short, textOr(college.name, "书院")),
      title: textOr(college.title, ""),
      color: textOr(college.color, DEFAULT_COLORS[index % DEFAULT_COLORS.length]),
      image: normalizeImage(college.image),
      offsetY: Number.isFinite(college.offsetY) ? clamp(college.offsetY, -0.35, 0.35) : 0,
      scale: Number.isFinite(college.scale) ? clamp(college.scale, 0.5, 1) : 1
    };
  }

  function normalizeRadii(rawRadii, count) {
    var radii = Array.isArray(rawRadii) ? rawRadii.filter(function (radius) {
      return Number.isFinite(radius) && radius >= 6 && radius <= MAX_ITEM_RADIUS;
    }).slice(0, count) : [];
    var previous = 0;
    var valid = radii.length === count && radii.every(function (radius) {
      var ok = radius > previous;
      previous = radius;
      return ok;
    });
    if (valid) {
      return radii;
    }
    if (window.console && console.warn) {
      console.warn("半径配置无效，已使用几何默认（13 → 115.4）。");
    }
    var minimum = 13;
    var maximum = Math.min(115.4, MAX_ITEM_RADIUS - 1);
    var ratio = count > 1 ? Math.pow(maximum / minimum, 1 / (count - 1)) : 1;
    var output = [];
    for (var i = 0; i < count; i += 1) {
      output.push(Math.round(minimum * Math.pow(ratio, i) * 10) / 10);
    }
    return output;
  }

  function normalizeScores(rawScores, count) {
    var scores = Array.isArray(rawScores) ? rawScores.slice(0, count) : [];
    while (scores.length < count) {
      scores.push(scores.length === 0 ? 0 : Math.min(MAX_SCORE, Math.pow(2, scores.length)));
    }
    return scores.map(function (value, index) {
      return Number.isFinite(value) && value >= 0
        ? Math.min(MAX_SCORE, Math.round(value))
        : (index === 0 ? 0 : Math.min(MAX_SCORE, Math.pow(2, index)));
    });
  }

  function normalizeConfig(input) {
    var source = input && typeof input === "object" ? input : {};

    var rawColleges = Array.isArray(source.colleges)
      ? source.colleges.filter(function (college) { return college && typeof college === "object"; })
      : [];
    var colleges = rawColleges.slice(0, 64).map(normalizeCollege);

    /* 合成链级数由 radii 配置决定（13 级）；colleges 是群友池（39 位），
     * 链上各级的群友在选定目标后由 buildLevelsFor 随机填充。
     * 模板阶段的占位群友仅用于初始显示，不影响实际对局。 */
    var levels;
    if (colleges.length >= 2) {
      var chainLength = Array.isArray(source.radii) && source.radii.length >= 2
        ? source.radii.length
        : Math.max(colleges.length, 2);
      var radii = normalizeRadii(source.radii, chainLength);
      var scores = normalizeScores(source.scores, chainLength);
      levels = radii.map(function (radius, index) {
        var college = colleges[index % colleges.length];
        return {
          key: college.key,
          name: college.name,
          short: college.short,
          radius: radius,
          score: scores[index],
          color: college.color,
          image: college.image,
          offsetY: college.offsetY,
          scale: college.scale
        };
      });
    } else {
      colleges = [];
      var hasCustomLevels = Array.isArray(source.levels) && source.levels.length >= 2;
      var rawLevels = (hasCustomLevels ? source.levels : defaultLevels()).slice();
      var previousConfiguredRadius = 0;
      var validRadii = rawLevels.length <= 32 && rawLevels.every(function (rawLevel) {
        var radius = rawLevel && rawLevel.radius;
        var valid = Number.isFinite(radius) && radius >= 6 && radius > previousConfiguredRadius && radius <= MAX_ITEM_RADIUS;
        previousConfiguredRadius = radius;
        return valid;
      });
      if (!validRadii) {
        if (hasCustomLevels && window.console && console.warn) {
          console.warn("等级半径配置无效，已回退到默认圆形主题。半径须严格递增且不能超过画板宽度。");
        }
        rawLevels = defaultLevels();
      }
      levels = rawLevels.map(function (rawLevel, index) {
        return {
          radius: rawLevel.radius,
          score: Number.isFinite(rawLevel.score) && rawLevel.score >= 0 ? Math.min(MAX_SCORE, Math.round(rawLevel.score)) : (index === 0 ? 0 : Math.min(MAX_SCORE, Math.pow(2, index))),
          color: textOr(rawLevel.color, DEFAULT_COLORS[index % DEFAULT_COLORS.length]),
          image: normalizeImage(rawLevel.image),
          key: textOr(rawLevel.key, ""),
          name: textOr(rawLevel.name, ""),
          short: textOr(rawLevel.short, ""),
          offsetY: Number.isFinite(rawLevel.offsetY) ? clamp(rawLevel.offsetY, -0.2, 0.2) : 0,
          scale: Number.isFinite(rawLevel.scale) ? clamp(rawLevel.scale, 0.5, 1) : 1
        };
      });
    }

    /* Q3: 无彩蛋 —— 合成链就是 radii 配置的全部级数（13 级），链顶即目标 */
    var chainLengthConfigured = levels.length;

    var rawUi = source.ui && typeof source.ui === "object" ? source.ui : {};
    var assetBase = textOr(source.assetBase, "");
    if (assetBase && !/[\\/]$/.test(assetBase)) {
      assetBase += "/";
    }
    var configId = textOr(source.id, "default");
    var requestedSpawnLevelCount = Number.isFinite(source.spawnLevelCount)
      ? Math.floor(source.spawnLevelCount)
      : DEFAULT_SPAWN_LEVEL_COUNT;

    var maxSpawnRadius = Number.isFinite(source.maxSpawnRadius) ? source.maxSpawnRadius : Number.POSITIVE_INFINITY;
    var maxSpawnLevelIndex = 0;
    for (var spawnScan = 0; spawnScan < levels.length; spawnScan += 1) {
      if (levels[spawnScan].radius <= maxSpawnRadius) {
        maxSpawnLevelIndex = spawnScan;
      }
    }
    maxSpawnLevelIndex = clamp(maxSpawnLevelIndex, 1, levels.length - 2);

    return {
      storageKey: textOr(source.storageKey, "merge-game:" + configId + ":best:v2"),
      collectionKey: textOr(source.collectionKey, "merge-game:" + configId + ":done:v2"),
      /* 全部版本升级：清空本地所有游玩记录（图鉴/最高分/禁言/彩蛋/挑战进度），供重新手动测试 */
      mutedKey: textOr(source.mutedKey, "merge-game:" + configId + ":muted:v5"),
      eggDoneKey: textOr(source.eggDoneKey, "merge-game:" + configId + ":eggdone:v4"),
      pigProgressKey: textOr(source.pigProgressKey, "merge-game:" + configId + ":pigs:v8"),
      erodeKey: textOr(source.erodeKey, "merge-game:" + configId + ":erode:v3"),
      /* ↑ pigs:v8：v7 的测试进度作废（再次回退到「我才是群主」解锁成功状态） */
      challengesKey: textOr(source.challengesKey, "merge-game:" + configId + ":challenges:v1"),
      assetBase: assetBase,
      levels: levels,
      colleges: colleges,
      selectable: colleges.length >= 2,
      radii: levels.slice(0, chainLengthConfigured).map(function (level) { return level.radius; }),
      scores: levels.slice(0, chainLengthConfigured).map(function (level) { return level.score; }),
      maxSpawnLevelIndex: maxSpawnLevelIndex,
      spawnLevelCount: clamp(requestedSpawnLevelCount, 1, levels.length),
      progressiveUnlock: source.progressiveUnlock === true,
      ui: {
        title: textOr(rawUi.title, "合成游戏"),
        description: textOr(rawUi.description, "无需安装，打开即玩的纯 JavaScript 合成小游戏。")
      }
    };
  }

  function resolveAssetUrl(source) {
    if (!source) {
      return "";
    }
    try {
      if (/^(?:data:|blob:|https?:|\/)/i.test(source)) {
        return new URL(source, document.baseURI).href;
      }
      /* challenge/ 等项目内资源不走 assets/ 前缀（否则 404，如唱片猪横幅） */
      if (/^challenge\//i.test(source)) {
        return new URL(source, document.baseURI).href;
      }
      return new URL(CONFIG.assetBase + source, document.baseURI).href;
    } catch (error) {
      return "";
    }
  }

  /* P2/Q2: 运行时头像圆形化兜底 —— 与 make-badges.ps1 同规格：512px 圆底 +
   * QQ 头像式截取（照片居中裁方、铺满整个圆，短边对齐裁掉长边多余部分）+
   * 统一黑色描边。
   * 已是圆形徽章（四角透明）的图直接跳过，避免二次处理；仅对未处理的原生图生效。
   * file:// 下 toDataURL 受限时会静默保留原图（预生成徽章本身已是圆形）。 */
  function isAlreadyCircular(image) {
    try {
      var probe = document.createElement("canvas");
      probe.width = 8;
      probe.height = 8;
      var probeContext = probe.getContext("2d");
      probeContext.drawImage(image, 0, 0, 8, 8);
      var corners = [[0, 0], [7, 0], [0, 7], [7, 7]];
      for (var i = 0; i < corners.length; i += 1) {
        var pixel = probeContext.getImageData(corners[i][0], corners[i][1], 1, 1).data;
        if (pixel[3] > 8) {
          return false;
        }
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  function processCircularBadge(image, level) {
    if (image.__wyBadgeDone || !image.complete || !image.naturalWidth) {
      return;
    }
    image.__wyBadgeDone = true;
    if (isAlreadyCircular(image)) {
      return;
    }
    try {
      var size = 512;
      var badge = document.createElement("canvas");
      badge.width = size;
      badge.height = size;
      var badgeContext = badge.getContext("2d");
      badgeContext.clearRect(0, 0, size, size);
      badgeContext.save();
      badgeContext.beginPath();
      badgeContext.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      badgeContext.clip();
      badgeContext.fillStyle = "#ffffff";
      badgeContext.fillRect(0, 0, size, size);
      var imageWidth = image.naturalWidth;
      var imageHeight = image.naturalHeight;
      /* QQ 头像截取：cover 铺满（短边对齐，裁掉长边超出部分） */
      var coverScale = Math.max(size / imageWidth, size / imageHeight);
      var drawWidth = imageWidth * coverScale;
      var drawHeight = imageHeight * coverScale;
      badgeContext.imageSmoothingEnabled = true;
      if ("imageSmoothingQuality" in badgeContext) {
        badgeContext.imageSmoothingQuality = "high";
      }
      badgeContext.drawImage(image, (size - drawWidth) / 2, (size - drawHeight) / 2, drawWidth, drawHeight);
      badgeContext.restore();
      var ringWidth = Math.max(10, size * 0.035);
      badgeContext.beginPath();
      badgeContext.arc(size / 2, size / 2, size / 2 - ringWidth / 2, 0, Math.PI * 2);
      badgeContext.lineWidth = ringWidth;
      badgeContext.strokeStyle = "#000000";  /* 与预生成徽章一致：统一黑色描边 */
      badgeContext.stroke();
      var dataUrl = badge.toDataURL("image/png");
      if (dataUrl && dataUrl.indexOf("data:image/png") === 0) {
        image.src = dataUrl;
      }
    } catch (error) {
      // 徽章处理失败时保留原图
    }
  }

  function preloadLevelAssets() {
    return LEVELS.map(function (level) {
      var image = new Image();
      if ("decoding" in image) {
        image.decoding = "async";
      }
      var source = resolveAssetUrl(level.image);
      if (source) {
        image.addEventListener("load", function () {
          processCircularBadge(image, level);
        });
        image.src = source;
      }
      return image;
    });
  }

  function applyUiConfig() {
    document.title = CONFIG.ui.title;
    pageDescription.setAttribute("content", CONFIG.ui.description);
    gameTitleElement.textContent = CONFIG.ui.title;
  }

  /* ================= P3: 可选合成目标 ================= */

  function collegeByKey(key) {
    var found = null;
    COLLEGES.forEach(function (college) {
      if (college.key === key) {
        found = college;
      }
    });
    return found;
  }

  /* 目标置于链顶（最高级），从未选中的其余群友中随机抽取（链级数 - 1）个组成合成链 */
  function buildLevelsFor(targetKey) {
    var target = collegeByKey(targetKey);
    if (!target) {
      target = COLLEGES[0];
    }
    var others = COLLEGES.filter(function (college) {
      return college.key !== targetKey;
    });
    for (var i = others.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var swap = others[i];
      others[i] = others[j];
      others[j] = swap;
    }
    /* Q3: 合成链固定 13 级（radii 配置）：随机抽 12 位 + 目标群友置于链顶（第 13 级） */
    var baseChainLength = Math.max(Array.isArray(CONFIG.radii) ? CONFIG.radii.length : 13, 2);
    var pickCount = Math.min(Math.max(baseChainLength - 1, 0), others.length);
    var chain = others.slice(0, pickCount).concat([target]);
    return chain.map(function (college, index) {
      var levelInfo = LEVELS[index] || {};
      return {
        key: college ? college.key : "",
        name: college ? college.name : "",
        short: college ? college.short : "",
        radius: levelInfo.radius,
        score: levelInfo.score,
        color: college ? college.color : DEFAULT_COLORS[index % DEFAULT_COLORS.length],
        image: college ? college.image : "",
        offsetY: college ? college.offsetY : 0,
        scale: college ? college.scale : 1
      };
    });
  }

  /* 标题规则（Q2）：无论合成哪个群友，统一「合成大群友」 */
  function targetGoalText() {
    return textOr(CONFIG.ui.title, "合成大群友");
  }

  /* 标题恒为「合成大群友」，选定目标后也不变 */
  function setGameTitle() {
    var title = targetGoalText();
    document.title = title;
    gameTitleElement.textContent = title;
  }

  function hexToRgb(hex) {
    var value = String(hex || "").replace("#", "");
    if (value.length === 3) {
      value = value[0] + value[0] + value[1] + value[1] + value[2] + value[2];
    }
    var number = Number.parseInt(value, 16);
    if (!Number.isFinite(number)) {
      return null;
    }
    return { r: (number >> 16) & 255, g: (number >> 8) & 255, b: number & 255 };
  }

  function mixWithWhite(rgb, amount) {
    var r = Math.round(rgb.r + (255 - rgb.r) * amount);
    var g = Math.round(rgb.g + (255 - rgb.g) * amount);
    var b = Math.round(rgb.b + (255 - rgb.b) * amount);
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }

  /* 渐变背景池：普通合成对局每次随机抽取一款（不再按群友色派生）；
   * 小猪挑战固定使用粉+肉色渐变 */
  var GRADIENT_POOL = ["#6f55c6", "#1f8fd0", "#39ad65", "#e8833a", "#d6496f", "#12a5a5", "#8a6cd8", "#c98a2e", "#5a7bd8", "#c65b8a"];
  var PIG_GRADIENT = {
    board: "linear-gradient(to top, #f9b8cd 0%, #f8dcc4 100%)",
    body: "linear-gradient(to bottom, #fdf3ec 0%, #fbe4ee 100%)"
  };

  /* 以随机渐变背景为主（不过深）；小猪挑战固定粉+肉色；
   * Erosion 挑战近黑；选择页异常群友的异常局底部带少量黑色 */
  function applyTheme(college) {
    var board = canvas.parentElement;
    if (eroChallengeActive()) {
      if (board && board.style) {
        board.style.background = "linear-gradient(to bottom, #0b0c10 0%, #17181d 100%)";
      }
      if (document.body && document.body.style) {
        document.body.style.background = "linear-gradient(to bottom, #060709 0%, #101116 100%)";
      }
      return;
    }
    if (eroGameActive) {
      /* 异常局：最下方有少量黑色（初始即遮挡小球），白色在上的渐变 */
      if (board && board.style) {
        board.style.background = "linear-gradient(to top, #101014 0%, #101014 2.5%, rgba(16,16,20,0) 11%, #f7fafc 28%, #eef2f6 100%)";
      }
      if (document.body && document.body.style) {
        document.body.style.background = "linear-gradient(to bottom, #fdfdfd 0%, #f2f4f7 100%)";
      }
      return;
    }
    if (pigChallengeActive()) {
      if (board && board.style) {
        board.style.background = PIG_GRADIENT.board;
      }
      if (document.body && document.body.style) {
        document.body.style.background = PIG_GRADIENT.body;
      }
      return;
    }
    var rgb = hexToRgb(GRADIENT_POOL[Math.floor(Math.random() * GRADIENT_POOL.length)]) || hexToRgb("#6f55c6");
    var dirBoard = ["to top", "to top right", "to top left", "to bottom"][Math.floor(Math.random() * 4)];
    var dirBody = ["to bottom", "to bottom left", "to bottom right", "to top"][Math.floor(Math.random() * 4)];
    var lowMix = 0.43 + Math.random() * 0.06;
    var highMix = 0.86 + Math.random() * 0.05;
    if (board && board.style) {
      board.style.background = "linear-gradient(" + dirBoard + ", " + mixWithWhite(rgb, lowMix) + " 0%, " + mixWithWhite(rgb, highMix) + " 100%)";
    }
    if (document.body && document.body.style) {
      document.body.style.background = "linear-gradient(" + dirBody + ", " + mixWithWhite(rgb, 0.96) + " 0%, " + mixWithWhite(rgb, Math.max(0.82, highMix - 0.04)) + " 100%)";
    }
  }

  function buildTargetGrid() {
    if (!targetGrid) {
      return;
    }
    targetGrid.innerHTML = "";
    var options = COLLEGES.slice();
    /* Q7: 收集完 ①② 小猪后，随机一位群友化身唱片猪（名称「猪」，不显示合成成功），
     * 合成出它即进入小猪挑战解锁流程；未合成可反复重试 */
    var pigMemberKey = pickPigMemberKey();
    options.forEach(function (college) {
      var option = document.createElement("button");
      option.type = "button";
      var isOwner = college.key === OWNER_KEY;
      var isMuted = !!mutedKeys[college.key];
      var isPigMember = !!pigMemberKey && college.key === pigMemberKey;
      /* Q8: 异常群友——选择卡出现黑色在下白色在上的渐变，黑住昵称与下半边头像 */
      var isEroAnomaly = !isPigMember && !isOwner && !eggMode
        && erodeProgress.anomalies.indexOf(college.key) >= 0;
      option.className = "badge-option" + (isMuted ? " muted" : "") + (eggMode && isOwner ? " egg-owner" : "") + (isPigMember ? " pig-member" : "") + (isEroAnomaly ? " target-ero" : "");
      option.setAttribute("data-key", college.key);
      option.setAttribute("title", isPigMember ? "猪" : (college.name || college.short || ""));
      var image = document.createElement("img");
      image.src = isPigMember ? PIG_TARGET_IMAGE : resolveAssetUrl(college.image);
      image.alt = isPigMember ? "猪" : college.name;
      var label = document.createElement("span");
      label.className = "nickname";
      label.textContent = isPigMember ? "猪" : college.short;
      option.appendChild(image);
      /* Q4: 已合成成功的群友卡片标记「合成成功」；Q6: 彩蛋展示态一律不显示；
       * Q7: 化身唱片猪的群友不显示「合成成功」 */
      if (synthesizedKeys[college.key] && !eggMode && !isPigMember) {
        var doneTag = document.createElement("span");
        doneTag.className = "done-tag";
        doneTag.textContent = "合成成功";
        option.appendChild(doneTag);
      }
      /* Q6: 已禁言（任何状态都显示「已禁言」）；彩蛋展示态——群主头像下方黄色
       * 「群主」框，其余未禁言群友红色「禁言」框 */
      if (isMuted) {
        var mutedTag = document.createElement("span");
        mutedTag.className = "mute-tag done";
        mutedTag.textContent = "已禁言";
        option.appendChild(mutedTag);
      } else if (eggMode && isOwner) {
        var ownerTag = document.createElement("span");
        ownerTag.className = "owner-tag";
        ownerTag.textContent = "群主";
        option.appendChild(ownerTag);
      } else if (eggMode && !isOwner) {
        var muteTag = document.createElement("span");
        muteTag.className = "mute-tag";
        muteTag.textContent = "禁言";
        muteTag.addEventListener("click", function (event) {
          if (event && event.stopPropagation) {
            event.stopPropagation();
          }
          muteMember(college.key);
        });
        option.appendChild(muteTag);
      }
      option.appendChild(label);
      option.addEventListener("click", function () {
        if (isPigMember) {
          startPigUnlockGame(college.key);
        } else if (isEroAnomaly) {
          startEroGame(college.key);   /* Q8: 点击异常群友 → 进入异常合成局 */
        } else {
          handleOptionClick(college.key);
        }
      });
      targetGrid.appendChild(option);
    });
    updateTargetStats();
  }

  /* Q4: 选择界面统计行 —— 已合成成功 N / 总数 位群友 */
  function updateTargetStats() {
    if (!targetStatsElement) {
      return;
    }
    targetStatsElement.textContent = "已合成成功 " + synthesizedCount() + " / " + COLLEGES.length + " 位群友";
  }

  function openTargetPicker() {
    if (challengeActive) {
      return;   /* 挑战「我才是群主」进行中不可换目标 */
    }
    if (mode !== "playing" && mode !== "selecting") {
      return;
    }
    if (mode === "playing") {
      eroNotifyNormalGameExit();   /* Q8: 对局中打开选择页 = 退出本次游玩（异常局不累计） */
      eroEndAnomalyGame();
    }
    closeMainMenu();   /* 主界面（若还开着）先收起 */
    refreshMenuPigElements();   /* 悬挂小猪只在主界面显示：选择页隐藏 */
    pickerCanCancel = mode === "playing";
    if (pickerCanCancel) {
      mode = "selecting";
      readyToDrop = false;
      activePointer = null;
      resetFrameClock();
    }
    resetEggSession();  /* Q6: 打开选择界面重置展示态（禁言记录保留，可继续禁言） */
    buildTargetGrid();  /* Q4: 打开时重建，统计与「合成成功」标记保持最新 */
    targetCancelButton.hidden = !pickerCanCancel;
    if (targetMenuButton) {
      targetMenuButton.textContent = "回到主界面";
    }
    targetOverlay.hidden = false;
    syncTopbarVisibility();
    updateControls();
  }

  /* 「回到主界面」：从选择菜单直接返回主界面（进行中的对局将被放弃，重新开始时重开） */
  function closeTargetPickerToMenu() {
    if (pigUnlockActive && !pigProgress.pigMade) {
      /* 放弃解锁对局回主界面：不计作尝试——旋转小猪重新化身选择页群友，菜单不出现吊猪传送门 */
      pigUnlockActive = false;
      pigProgress.attempted = false;
      savePigProgress();
    }
    targetOverlay.hidden = true;
    resetEggSession();
    pickerCanCancel = false;
    mode = "selecting";
    readyToDrop = false;
    activePointer = null;
    resetFrameClock();
    eroEndAnomalyGame();
    openMainMenu();
  }

  function closeTargetPicker() {
    targetOverlay.hidden = true;
    syncTopbarVisibility();
    resetEggSession();  /* Q6: 退出选择界面重置展示态（禁言记录保留） */
    if (pickerCanCancel) {
      pickerCanCancel = false;
      mode = "playing";
      resetFrameClock();
      updateControls();
    } else {
      /* 没有进行中的对局可回（主界面进入后的取消 / 彩蛋会话取消）→ 回主界面 */
      openMainMenu();
    }
  }

  /* 选定目标后，页面图标（favicon）与浏览器主题色跟随群友 */
  function updatePageIcons(college) {
    try {
      var iconLink = document.querySelector ? document.querySelector('link[rel="icon"]') : null;
      if (!iconLink) {
        iconLink = document.createElement("link");
        iconLink.setAttribute("rel", "icon");
        iconLink.setAttribute("type", "image/png");
        if (document.head && document.head.appendChild) {
          document.head.appendChild(iconLink);
        }
      }
      if (iconLink && iconLink.setAttribute) {
        iconLink.setAttribute("href", resolveAssetUrl(college.image));
      }
      var themeMeta = document.querySelector ? document.querySelector('meta[name="theme-color"]') : null;
      if (themeMeta && themeMeta.setAttribute) {
        themeMeta.setAttribute("content", college.color);
      }
    } catch (error) {
      // 图标更新是锦上添花，失败不影响游戏
    }
  }

  /* 横幅动画：select = 选定目标（单行）；achieve = 合成出目标球（两行“合成大群友 / 合成成功！”） */
  var targetBannerTimer = 0;
  function showTargetBanner(college, mode, dark) {
    if (!targetBanner || !college) {
      return;
    }
    mode = mode || "select";
    try {
      if (targetBannerImage) {
        targetBannerImage.src = resolveAssetUrl(college.image);
        targetBannerImage.alt = college.name || "";
      }
      if (targetBannerText) {
        targetBannerText.textContent = targetGoalText();
      }
      if (targetBannerSubtext) {
        if (mode === "achieve") {
          targetBannerSubtext.textContent = "合成成功！";
          targetBannerSubtext.hidden = false;
        } else {
          targetBannerSubtext.hidden = true;
        }
      }
      targetBanner.hidden = false;
      targetBanner.className = "target-banner" + (mode === "achieve" ? " achieve" : "")
        + (dark ? " target-banner-dark" : "");   /* Q8: Erosion 目标横幅黑底白字 */
      /* 强制重启动画：横幅已可见/隐藏后再次显示时 className 不变不会重播，
       * 会停在 100% 帧（opacity 0）而看似「没弹出」；主线程忙时动画启动还可能
       * 晚于隐藏定时器，导致淡入刚开始就被藏掉。none→reflow→"" 保证每次从头播。 */
      try {
        targetBanner.style.animation = "none";
        void targetBanner.offsetWidth;
        targetBanner.style.animation = "";
      } catch (error) { /* 桩环境无 reflow 能力，忽略 */ }
    } catch (error) {
      // 横幅是锦上添花，失败不影响游戏
    }
    if (typeof clearTimeout === "function") {
      clearTimeout(targetBannerTimer);
    }
    /* 定时器留 350ms 余量：动画启动稍有延迟也不会在淡入/展示阶段被提前隐藏 */
    var duration = (mode === "achieve" ? 2200 : 1900) + 350;
    targetBannerTimer = setTimeout(function () {
      targetBanner.hidden = true;
    }, duration);
  }

  /* 选定目标：重建随机合成链 → 换主题背景 → 开新局（标题恒为「合成大群友」） */
  function chooseTarget(key) {
    var requestedKey = String(key || "");
    var college = collegeByKey(requestedKey);
    if (!college) {
      /* 随机目标：跳过已禁言群友（Q6）；全员禁言时只会选到群主 */
      var pool = COLLEGES.filter(function (candidate) {
        return !mutedKeys[candidate.key];
      });
      if (pool.length === 0) {
        pool = COLLEGES.slice();
      }
      college = pool[Math.floor(Math.random() * pool.length)];
    }
    if (!college || mutedKeys[college.key]) {
      return;  /* 已禁言的群友不能被选为目标（点击无任何效果） */
    }
    if (pigUnlockActive && !pigProgress.pigMade) {
      /* 换目标放弃解锁对局：不计作尝试——旋转小猪重新化身选择页群友，菜单不出现吊猪传送门 */
      pigUnlockActive = false;
      pigProgress.attempted = false;
      savePigProgress();
    }
    resetEggSession();  /* Q6: 进入对局重置展示态（禁言记录保留，之后可回彩蛋继续禁言） */
    targetCollegeKey = college.key;
    eroCurrentGameAnomalous = false;   /* Q8: 新的普通对局 */
    LEVELS = buildLevelsFor(college.key);
    LEVEL_ASSETS = preloadLevelAssets();
    setGameTitle();
    applyTheme(college);
    updatePageIcons(college);
    targetOverlay.hidden = true;
    syncTopbarVisibility();
    pickerCanCancel = false;
    showTargetBanner(college, "select");
    startGame();
  }

  /* Q8: 点击异常群友 → 以其为目标的异常合成局：
   * 背景底部带少量黑色；合成出 10 级球后静止 5 秒黑色上蔓延，投放打断回退；
   * 黑色盖住标题栏 → 进入解锁挑战；直接合成完成该群友 → 异常消失 */
  function startEroGame(key) {
    var college = collegeByKey(key);
    if (!college || mutedKeys[college.key]) {
      return;
    }
    resetEggSession();
    targetCollegeKey = college.key;
    eroGameActive = true;
    eroAnomalyKey = college.key;
    eroCurrentGameAnomalous = true;
    eroFront = 0;
    eroFrontState = "idle";
    eroIdleTime = 0;
    eroArmed = false;
    eroTeaseAge = -1;
    eroUnlocking = false;
    LEVELS = buildLevelsFor(college.key);
    LEVEL_ASSETS = preloadLevelAssets();
    setGameTitle();
    applyTheme(college);
    updatePageIcons(college);
    targetOverlay.hidden = true;
    syncTopbarVisibility();
    pickerCanCancel = false;
    showTargetBanner(college, "select");
    startGame();
  }

  /* Erosion 解锁演出：黑幕完全盖住屏幕 → 直接在黑色屏幕上弹出头像与文字（金色 Erosion）
   * → 淡出后直接进入挑战对局（无规则页、无横幅） */
  function triggerEroUnlock() {
    if (eroUnlocking) {
      return;
    }
    eroUnlocking = true;
    eroFrontState = "idle";
    targetAchieved = true;   /* 冻结投放：演出期间不再投放/失败 */
    readyToDrop = false;
    erodeProgress.unlocked = true;
    erodeProgress.anomalies = [];   /* 解锁后选择页异常消失 */
    saveErodeProgress();
    try {
      if (document.body && document.body.classList) {
        document.body.classList.add("ero-title-covered");   /* 标题栏被黑色完全遮住 */
      }
    } catch (error) { /* 桩环境忽略 */ }
    scheduleChallengeStep(1300, function () {
      eroEndAnomalyGame();
      eroFront = 0;
      setTopbarHidden(true);   /* 弹头像与文字时「合成大群友」一栏不显示 */
      showChallengePanel("eroIntro");   /* 纯黑背景上仅头像 + 文字 */
      playVictorySound();
    });
    scheduleChallengeStep(3900, function () {
      if (challengeEroIntro) {
        challengeEroIntro.classList.add("challenge-fade-out");
      }
    });
    scheduleChallengeStep(5100, function () {
      startEroChallenge("unlock");
    });
  }

  /* Q7: 收集完成后——随机选一位（非群主、未禁言）群友化身唱片猪；无则不出现。
   * 进入过一次解锁对局后不再化身（此后只能从特殊挑战菜单的吊着小猪重进） */
  function pickPigMemberKey() {
    /* ①②收集完毕（还剩最后 1 只 = 合成唱片猪）即可开始解锁对局 */
    if (!challengeUnlocked || pigProgress.pigMade || pigProgress.attempted || !pigProgress.menuClicked
      || pigProgress.captured < PIG_CAPTURE_MAX) {
      return null;
    }
    var pool = COLLEGES.filter(function (college) {
      return college.key !== OWNER_KEY && !mutedKeys[college.key];
    });
    if (pool.length === 0) {
      return null;
    }
    return pool[Math.floor(Math.random() * pool.length)].key;
  }

  /* Q7: 点击「猪」卡片 / 菜单吊着小猪入口 → 正常合成对局（链顶变为唱片猪），合成出它进入解锁流程 */
  function startPigUnlockGame(memberKey) {
    var member = collegeByKey(memberKey) || COLLEGES[0];
    resetEggSession();
    pigUnlockActive = true;
    if (!pigProgress.attempted) {
      pigProgress.attempted = true;   /* 进入过解锁对局：旋转小猪不再出现在选择页，重进走菜单入口 */
      savePigProgress();
    }
    targetCollegeKey = "PIG_UNLOCK";
    LEVELS = buildLevelsFor(member.key);
    var lastIndex = LEVELS.length - 1;
    LEVELS[lastIndex] = {
      key: "PIG_UNLOCK",
      name: "猪",
      short: "猪",
      radius: LEVELS[lastIndex].radius,
      score: LEVELS[lastIndex].score,
      color: "#f2a0b5",
      image: PIG_TARGET_IMAGE,
      offsetY: 0,
      scale: 1
    };
    LEVEL_ASSETS = preloadLevelAssets();
    setGameTitle();
    applyTheme(member);
    updatePageIcons(member);
    targetOverlay.hidden = true;
    syncTopbarVisibility();
    pickerCanCancel = false;
    showTargetBanner({ key: "PIG_UNLOCK", name: "猪", short: "猪", image: PIG_TARGET_IMAGE, offsetY: 0, scale: 1 }, "select");
    startGame();
  }


  function loadBestScore() {
    try {
      var value = Number.parseInt(window.localStorage.getItem(CONFIG.storageKey), 10);
      return Number.isFinite(value) && value >= 0 ? value : 0;
    } catch (error) {
      return 0;
    }
  }

  function saveBestScore() {
    try {
      window.localStorage.setItem(CONFIG.storageKey, String(bestScore));
    } catch (error) {
      // Storage can be unavailable in private browsing. The game still works.
    }
  }

  /* ===== Q4: 合成图鉴 —— 已合成成功的群友（跨局累计） ===== */

  function synthesizedStorageKey() {
    return CONFIG.collectionKey;
  }

  function loadSynthesized() {
    try {
      var raw = window.localStorage.getItem(synthesizedStorageKey());
      var list = raw ? JSON.parse(raw) : [];
      var map = {};
      if (Array.isArray(list)) {
        list.forEach(function (key) {
          if (typeof key === "string" && key) {
            map[key] = true;
          }
        });
      }
      return map;
    } catch (error) {
      return {};
    }
  }

  function saveSynthesized() {
    try {
      window.localStorage.setItem(synthesizedStorageKey(), JSON.stringify(Object.keys(synthesizedKeys)));
    } catch (error) {
      // Storage unavailable — collection stays session-only
    }
  }

  function synthesizedCount() {
    return Object.keys(synthesizedKeys).length;
  }

  /* 合成出目标群友（胜利）时标记：写档并刷新选择界面（统计行 + 卡片「合成成功」标记） */
  function markSynthesized(key) {
    if (!key || synthesizedKeys[key]) {
      return;
    }
    synthesizedKeys[key] = true;
    saveSynthesized();
    buildTargetGrid();
  }

  /* ===== Q6: 群主彩蛋（Chespy = 群主） ===== */

  var OWNER_KEY = "Chespy";  /* 群主昵称 = profile/Chespy.jpg 的文件名，改名即解除彩蛋 */

  function mutedStorageKey() {
    return CONFIG.mutedKey;
  }

  function loadMuted() {
    try {
      var raw = window.localStorage.getItem(mutedStorageKey());
      var list = raw ? JSON.parse(raw) : [];
      var map = {};
      if (Array.isArray(list)) {
        list.forEach(function (key) {
          if (typeof key === "string" && key) {
            map[key] = true;
          }
        });
      }
      return map;
    } catch (error) {
      return {};
    }
  }

  function saveMuted() {
    try {
      window.localStorage.setItem(mutedStorageKey(), JSON.stringify(Object.keys(mutedKeys)));
    } catch (error) {
      // Storage unavailable — mute state stays session-only
    }
  }

  /* ===== 主界面/特殊挑战菜单：挑战解锁进度（我才是群主：是否解锁 + 最高分） ===== */
  function challengesStorageKey() {
    return CONFIG.challengesKey;
  }

  function loadChallengeProgress() {
    try {
      var raw = window.localStorage.getItem(challengesStorageKey());
      var data = raw ? JSON.parse(raw) : {};
      return {
        unlocked: !!(data && data.ownerUnlocked === true),
        best: data && typeof data.ownerBest === "number" && Number.isFinite(data.ownerBest) ? data.ownerBest : 0
      };
    } catch (error) {
      return { unlocked: false, best: 0 };
    }
  }

  function saveChallengeProgress() {
    try {
      window.localStorage.setItem(challengesStorageKey(), JSON.stringify({
        ownerUnlocked: challengeUnlocked === true,
        ownerBest: challengeBest
      }));
    } catch (error) {
      // Storage unavailable — challenge progress stays session-only
    }
  }

  /* 特殊挑战功能开关：任意成功合成一个群友后解锁 */
  function challengeFeatureUnlocked() {
    return synthesizedCount() > 0;
  }

  /* Q6: 结束一次选择界面会话（开局/取消/重新打开）——只重置会话内的展示态
   * （彩蛋展示、终章渐隐、弹窗），禁言记录本身保留，点 Chespy 可回去继续禁言 */
  function resetEggSession() {
    eggMode = false;
    eggFinaleStarted = false;
    setCinema(false);   /* 恢复顶栏/棋盘（终章电影模式可能仍生效） */
    if (muteToast) {
      if (typeof clearTimeout === "function") {
        clearTimeout(muteToastTimer);
      }
      muteToast.hidden = true;
    }
    /* 恢复上一次终章渐隐的标题/统计/操作按钮（卡片随网格重建自动恢复） */
    setEggFade(targetEyebrow, false);
    setEggFade(targetTitleElement, false);
    setEggFade(targetStatsElement, false);
    setEggFade(targetActions, false);
  }

  /* 彩蛋开关：图鉴中收入群主（以 Chespy 为目标胜利合成）后 armed */
  function eggUnlocked() {
    return !!synthesizedKeys[OWNER_KEY];
  }

  function enterEggMode() {
    eggMode = true;
    buildTargetGrid();
    /* 解锁前重新进入展示态时，若其余群友已全部处于禁言（如上次尝试中途放弃、
     * 记录经本地存档保留），直接触发终章，保证解锁前彩蛋始终可以触发 */
    if (allOthersMuted() && challengeFeatureUnlocked()) {
      startOwnerFinale();
    }
  }

  function exitEggMode() {
    if (!eggMode) {
      return;
    }
    eggMode = false;
    buildTargetGrid();
  }

  /* 选择界面卡片点击（统一入口：图鉴标记 / 彩蛋展示 / 正常开局） */
  function handleOptionClick(key) {
    if (eggFinaleStarted || mutedKeys[key]) {
      return;  /* 终章后全部失效；已禁言群友点击无任何效果 */
    }
    var isOwner = key === OWNER_KEY;
    if (eggMode) {
      if (isOwner) {
        exitEggMode();      /* 再次点击群主：正常开局，不触发彩蛋 */
        chooseTarget(key);
      }
      return;               /* 彩蛋展示态下其它卡片点击无效（只能点「禁言」框） */
    }
    if (isOwner && eggUnlocked() && (!eggDone || !challengeUnlocked)) {
      enterEggMode();       /* 点击群主：进入彩蛋展示。挑战成功解锁后永久关闭；
                             * 解锁之前即使失败过（eggDone 已置位）也始终可以重新进入触发 */
      return;
    }
    chooseTarget(key);
  }

  function allOthersMuted() {
    return COLLEGES.every(function (college) {
      return college.key === OWNER_KEY || !!mutedKeys[college.key];
    });
  }

  /* 点「禁言」：标记 → 卡片变淡显示「已禁言」→ 弹提示 → 满员触发终章。
   * 仅当特殊挑战功能已解锁（成功合成过任意群友）才允许触发解锁彩蛋终章 */
  function muteMember(key) {
    if (!eggMode || eggFinaleStarted || !key || key === OWNER_KEY || mutedKeys[key]) {
      return;
    }
    mutedKeys[key] = true;
    saveMuted();
    buildTargetGrid();
    showMuteToast();
    if (allOthersMuted() && challengeFeatureUnlocked()) {
      startOwnerFinale();
    }
  }

  function showMuteToast() {
    if (!muteToast) {
      return;
    }
    if (typeof clearTimeout === "function") {
      clearTimeout(muteToastTimer);
    }
    muteToast.hidden = false;
    /* 重启 CSS 动画：确保每次禁言都重新弹出「该群友已被禁言」 */
    try {
      muteToast.style.animation = "none";
      void muteToast.offsetWidth;  /* 强制回流后恢复动画 */
      muteToast.style.animation = "";
    } catch (error) {
      // 动画重启失败不影响提示显示
    }
    muteToastTimer = setTimeout(function () {
      muteToast.hidden = true;
    }, 1900);
  }

  /* 终章渐隐辅助：className 字符串操作（桩环境/浏览器均可用） */
  function setEggFade(element, faded) {
    if (!element) {
      return;
    }
    var has = (" " + element.className + " ").indexOf(" egg-fade ") >= 0;
    if (faded && !has) {
      element.className = (element.className + " egg-fade").trim();
    } else if (!faded && has) {
      element.className = element.className.replace(/\s*egg-fade(\s*)/g, " ").trim();
    }
  }

  function findOptionCard(key) {
    if (!targetGrid) {
      return null;
    }
    for (var i = 0; i < targetGrid.children.length; i += 1) {
      var card = targetGrid.children[i];
      if (card.getAttribute && card.getAttribute("data-key") === key) {
        return card;
      }
    }
    return null;
  }

  /* 终章：全员禁言后——慢速滚到群主（约 2.4s，居中停留）→ 整个游戏界面淡出、
   * 只剩群主卡片（含滑动条/其他群友/棋盘背景，全白；3s）→ 群主卡片最后渐隐（3s）
   * → 界面全白 → 弹出特殊挑战开场 */
  function startOwnerFinale() {
    if (eggFinaleStarted) {
      return;
    }
    eggFinaleStarted = true;
    animateScrollToOwner();
    scheduleChallengeStep(3200, function () {
      /* 第一次淡出：整个游戏界面只剩 Chespy 卡片（顶栏/棋盘/滑动条/其余内容全部渐隐，背景转白） */
      setCinema(true);
      setEggFade(targetEyebrow, true);
      setEggFade(targetTitleElement, true);
      setEggFade(targetStatsElement, true);
      setEggFade(targetActions, true);
      COLLEGES.forEach(function (college) {
        if (college.key !== OWNER_KEY) {
          setEggFade(findOptionCard(college.key), true);
        }
      });
    });
    scheduleChallengeStep(7600, function () {
      setEggFade(findOptionCard(OWNER_KEY), true);  /* 群主卡片最后渐隐 */
    });
    scheduleChallengeStep(11600, function () {
      startOwnerChallenge();                        /* 界面全白 → 特殊挑战开场 */
    });
  }

  /* ===== Q6: 特殊挑战「我才是群主」 ===== */

  function scheduleChallengeStep(delay, fn) {
    challengeTimers.push(setTimeout(fn, delay));
  }

  function clearChallengeTimers() {
    challengeTimers.forEach(function (timer) {
      if (typeof clearTimeout === "function") {
        clearTimeout(timer);
      }
    });
    challengeTimers = [];
  }

  /* 终章电影模式：顶栏与棋盘淡出，选择卡片只剩群主，页面全白 */
  function setCinema(on) {
    try {
      if (document.body && document.body.classList && document.body.classList.add && document.body.classList.remove) {
        if (on) {
          document.body.classList.add("egg-cinema");
        } else {
          document.body.classList.remove("egg-cinema");
        }
      }
    } catch (error) {
      // 视觉增强失败不影响流程
    }
    if (cinemaWhite) {
      cinemaWhite.hidden = false;
      cinemaWhite.style.opacity = on ? "1" : "0";
    }
  }

  /* 慢速滚动：约 2.4 秒匀速滚到群主卡片居中。
   * 优先 requestAnimationFrame（逐帧、无停顿）；不可用时退化为 40ms 细步长 */
  function animateScrollToOwner() {
    var ownerCard = findOptionCard(OWNER_KEY);
    var container = targetGrid ? targetGrid.parentElement : null;
    if (!ownerCard || !container || typeof ownerCard.getBoundingClientRect !== "function"
      || typeof container.getBoundingClientRect !== "function") {
      try {
        if (ownerCard && typeof ownerCard.scrollIntoView === "function") {
          ownerCard.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      } catch (error) { /* 滚动失败不影响流程 */ }
      return;
    }
    try {
      var rect = ownerCard.getBoundingClientRect();
      var box = container.getBoundingClientRect();
      var targetTop = container.scrollTop + rect.top - box.top - (box.height - rect.height) / 2;
      var startTop = container.scrollTop || 0;
      var duration = 2400;
      if (typeof requestAnimationFrame === "function") {
        var startTime = null;
        var scrollFrame = function (ts) {
          if (startTime === null) {
            startTime = ts;
          }
          var progress = clamp((ts - startTime) / duration, 0, 1);
          container.scrollTop = startTop + (targetTop - startTop) * progress;
          if (progress < 1) {
            requestAnimationFrame(scrollFrame);
          }
        };
        requestAnimationFrame(scrollFrame);
        return;
      }
      var steps = 60;
      var stepMs = 40;
      var scrollStep = function (progress) {
        return function () {
          container.scrollTop = startTop + (targetTop - startTop) * (progress / steps);
        };
      };
      for (var i = 1; i <= steps; i += 1) {
        scheduleChallengeStep(stepMs * i, scrollStep(i));
      }
    } catch (error) { /* 滚动失败不影响流程 */ }
  }

  function shuffleArray(list) {
    for (var i = list.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var swap = list[i];
      list[i] = list[j];
      list[j] = swap;
    }
    return list;
  }

  function resetBoardToIdle() {
    items = [];
    particles = [];
    celebrationParticles = [];
    failureBlasts = [];
    floaters = [];
    highestCelebration = null;
    failureSequence = null;
    victorySequence = null;
    targetAchieved = false;
    readyToDrop = false;
    activePointer = null;
  }

  /* 抽 15 位群友（不含群主）→ 全部排成 15 级合成链（链顶即秘密目标）。
   * 只准备数据，不设定阶段（phase 由调用方决定）；
   * 展示顺序单独再洗一次，避免从卡片位置猜出链序。 */
  function setupChallenge() {
    var pool = COLLEGES.filter(function (college) {
      return college.key !== OWNER_KEY;
    });
    shuffleArray(pool);
    challengeMembers = pool.slice(0, Math.min(15, pool.length));
    challengeChain = challengeMembers.slice();
    challengeTargetKey = challengeMembers[challengeMembers.length - 1].key;
    challengeDisplay = shuffleArray(challengeMembers.slice());
    challengeMutedKey = null;
    challengeSkipLevel = -1;
    challengePendingKey = null;
  }

  function renderChallengePick() {
    if (!challengeGrid) {
      return;
    }
    challengeGrid.innerHTML = "";
    challengeDisplay.forEach(function (college) {
      var option = document.createElement("button");
      option.type = "button";
      option.className = "badge-option";
      option.setAttribute("data-key", college.key);
      option.setAttribute("title", college.name || college.short || "");
      var image = document.createElement("img");
      image.src = resolveAssetUrl(college.image);
      image.alt = college.name;
      var muteTag = document.createElement("span");
      muteTag.className = "mute-tag";
      muteTag.textContent = "禁言";
      muteTag.addEventListener("click", function (event) {
        if (event && event.stopPropagation) {
          event.stopPropagation();
        }
        askChallengeMute(college.key);
      });
      var label = document.createElement("span");
      label.className = "nickname";
      label.textContent = college.short;
      option.appendChild(image);
      option.appendChild(muteTag);
      option.appendChild(label);
      challengeGrid.appendChild(option);
    });
  }

  function showChallengePanel(name) {
    if (!challengeOverlay) {
      return;
    }
    challengeOverlay.hidden = false;
    /* 小猪解锁演出（开场字幕/规则页）：背景纯白；Erosion 开场：背景纯黑——
     * 白底/黑底只作背景，小猪/Erosion 在方框内完整展示，不被底色盖住 */
    if (challengeOverlay.classList && challengeOverlay.classList.toggle) {
      challengeOverlay.classList.toggle("challenge-overlay-white", name === "pigIntro" || name === "pigRules");
      challengeOverlay.classList.toggle("challenge-overlay-black", name === "eroIntro");
    }
    challengeIntro.hidden = name !== "intro";
    challengePick.hidden = name !== "pick";
    challengeResult.hidden = name !== "result";
    if (challengePigIntro) {
      challengePigIntro.hidden = name !== "pigIntro";
      challengePigIntro.classList.toggle("challenge-fade-out", false);
    }
    if (challengePigRules) {
      challengePigRules.hidden = name !== "pigRules";
    }
    if (challengeEroIntro) {
      challengeEroIntro.hidden = name !== "eroIntro";
      challengeEroIntro.classList.toggle("challenge-fade-out", false);
    }
  }

  /* Q7: 解锁演出（模板 = demo-qinghua-settle 的目标达成庆祝）：
   * ①小猪四周闪光（模板同款扩散环 + 环绕星星，配色换小猪粉系）
   *   + 小猪配色彩带礼花（初始 108 粒 + 分段补发）；
   * ②其余小球像失败结算那样逐波缓慢爆炸；
   * ③全部结束后小猪才移至屏幕中上方居中展示挑战名 → 渐隐 → 规则分步慢速展示 */
  function startPigUnlockCinematic(body) {
    pigUnlockActive = false;
    pigProgress.pigMade = true;   /* 第 ⑤ 只小猪到手（合成唱片猪） */
    savePigProgress();
    targetAchieved = true;
    readyToDrop = false;
    activePointer = null;
    /* ①闪光：该小猪泛金色脉冲光晕 + 模板庆祝环/星星 */
    pigGlowBody = body;
    /* ②其余小球保留在场（与旋转小猪一起静止在画面上），闪光开始后
     * 才逐波移除并原地爆炸——绝不能合成瞬间就让球无特效消失 */
    var doomed = [];
    items.forEach(function (item) {
      if (item !== body) {
        doomed.push(item);
      }
    });
    startHighestCelebration(body, PIG_CELEBRATION_COLORS);
    pigBlastActive = true;   /* 爆炸期间暂停合成判定（球堆静待逐波爆炸） */
    var waveDelay = 180;           /* 每球间隔：缓慢连续爆炸 */
    doomed.forEach(function (info, index) {
      scheduleChallengeStep(500 + index * waveDelay, function () {
        var stillThere = items.indexOf(info) >= 0;
        items = items.filter(function (item) {
          return item !== info;
        });
        if (stillThere) {
          addBurst(info.x, info.y, LEVELS[info.level].color, info.level);
        }
      });
    });
    challengeKind = "pig";
    challengeEntry = "unlock";
    challengeActive = true;
    challengePhase = "intro";
    syncTopbarVisibility();
    challengeTargetKey = "PIG_TARGET";
    pigChain = [];
    pigMemberAssets = [];
    /* 闪光与逐波爆炸阶段画布必须可见：绝不进入终章白幕电影模式
     * （setCinema(true) 会立即盖上 cinemaWhite 白幕并让画布 3 秒淡出） */
    setCinema(false);
    /* ③闪光（3.2s）+ 爆炸全部结束后：小猪缓缓平移到正中间（平移中缓慢变大）
     * → 背景淡出直至消失 → 挑战名方框出现并将小猪框住（画布小猪淡出、动图接管） */
    var blastEnd = Math.max(3600, 700 + doomed.length * waveDelay + 600);
    scheduleChallengeStep(blastEnd, function () {
      pigBlastActive = false;
      pigGlowBody = null;
      items = [body];   /* 清掉万一残留的球，只剩旋转小猪 */
      pigFly = {
        body: body,
        fromX: body.x,
        fromY: body.y,
        toX: WORLD_WIDTH / 2,
        toY: WORLD_HEIGHT / 2,
        fromRadius: body.radius,
        toRadius: Math.min(92, body.radius * 1.5),
        age: 0,
        duration: 2.4,
        fading: false,
        fadeAge: 0,
        whiteout: false
      };
    });
    scheduleChallengeStep(blastEnd + 4000, function () {
      showChallengePanel("pigIntro");
      playVictorySound();
      if (pigFly) {
        pigFly.fading = true;   /* 画布小猪 0.8s 淡出，横幅方框内的动图淡入接管 */
      }
    });
    scheduleChallengeStep(blastEnd + 8200, function () {
      if (challengePigIntro) {
        challengePigIntro.classList.add("challenge-fade-out");
      }
    });
    scheduleChallengeStep(blastEnd + 9900, function () {
      showPigRules();
    });
  }

  /* 规则分步展示（慢速）：标题 → 两行文字 → 两行禁止组合 → 文字 + 合成示例 → 文字 → 开始挑战 */
  function showPigRules() {
    showChallengePanel("pigRules");
    var stages = ["pigRuleLine1", "pigRuleLine2", "pigRuleRow1", "pigRuleRow2", "pigRuleLine3", "pigRuleRow3", "pigRuleLine4", "pigRuleActions"];
    stages.forEach(function (elementId, index) {
      var element = document.getElementById(elementId);
      if (element) {
        element.hidden = true;
        element.classList.remove("pig-stage-shown");
      }
      scheduleChallengeStep(800 + index * 1000, function () {
        var target = document.getElementById(elementId);
        if (target) {
          target.hidden = false;
          try {
            void target.offsetWidth;   /* 先渲染初始态再过渡，保证渐显动画生效 */
          } catch (error) { /* 桩无 reflow 能力时忽略 */ }
          target.classList.add("pig-stage-shown");
        }
      });
    });
  }

  /* 进入小猪挑战：13 级链（12 群友 × 同级小猪 + 唱片猪），每两只群友后刷一只小猪。
   * skipIntroReplay=true（规则页「开始挑战」/失败「来！！！」/「重开」）直接开局；
   * 挑战成功后每次从菜单重进：重放标题（开场字幕）与规则说明再开局 */
  function startPigChallenge(skipIntroReplay) {
    clearChallengeTimers();
    pigUnlockActive = false;
    pigGlowBody = null;
    pigBlastActive = false;
    pigFly = null;
    if (pigCaptured) {
      /* 经悬挂小猪重试入口进入挑战后，左上角小猪隐藏（回主界面时刷新逻辑恢复） */
      pigCaptured.classList.remove("pig-captured-retry");
      pigCaptured.classList.remove("pig-captured-drop");
      pigCaptured.hidden = true;
    }
    challengeKind = "pig";
    challengeActive = true;
    challengeEntry = "menu";
    challengePhase = "intro";
    syncTopbarVisibility();
    setCinema(false);
    setupPigChallenge();
    if (!skipIntroReplay && pigProgress.passed) {
      /* 成功后重进：重放标题与规则说明（节奏与首次解锁一致） */
      showChallengePanel("pigIntro");
      scheduleChallengeStep(2600, function () {
        if (challengePigIntro) {
          challengePigIntro.classList.add("challenge-fade-out");
        }
      });
      scheduleChallengeStep(4300, function () {
        showPigRules();
      });
      return;
    }
    challengePhase = "playing";
    syncTopbarVisibility();
    startChallengeGame();
  }

  /* 组 13 级小猪合成链：随机 12 位群友（不含群主），每级配一只同大小小猪，链顶为唱片猪 */
  function setupPigChallenge() {
    var pool = COLLEGES.filter(function (college) {
      return college.key !== OWNER_KEY;
    });
    shuffleArray(pool);
    pigChain = pool.slice(0, Math.min(12, pool.length));
    pigMemberAssets = [];   /* 链条重排 → 重建群友头像预载 */
    challengeTargetKey = "PIG_TARGET";
    challengeSkipLevel = -1;
    challengeMembers = pigChain.slice();
    challengeDisplay = shuffleArray(pigChain.slice());
    challengeMutedKey = null;
    challengePendingKey = null;
  }

  /* ===== 主界面：标题 + pig 图 + 开始游玩/特殊挑战 ===== */
  /* 主界面/挑战菜单/挑战开场与选择阶段隐藏顶栏（标题/游玩提示/分数/按钮） */
  function setTopbarHidden(hidden) {
    topbarHidden = !!hidden;
    try {
      if (document.body && document.body.classList && document.body.classList.toggle) {
        document.body.classList.toggle("menu-open", topbarHidden);
      }
    } catch (error) { /* 桩无 classList 时跳过 */ }
  }

  /* 依当前界面状态推导顶栏可见性：主界面、特殊挑战菜单、选择界面（含换目标）、
   * 挑战开场/选择阶段 → 隐藏；正式游玩（对局/结算）→ 显示 */
  function syncTopbarVisibility() {
    var covered = !!(mainMenuOverlay && !mainMenuOverlay.hidden)
      || !!(challengeMenuOverlay && !challengeMenuOverlay.hidden)
      || !!(targetOverlay && !targetOverlay.hidden)
      || (challengeActive && (challengePhase === "intro" || challengePhase === "pick"));
    setTopbarHidden(covered);
  }

  function openMainMenu() {
    var returning = mainMenuVisitedOnce;   /* ②仅「从其它界面回到主界面」时触发 */
    if (mainMenuOverlay) {
      mainMenuOverlay.hidden = false;
    }
    if (challengeMenuOverlay) {
      challengeMenuOverlay.hidden = true;
    }
    syncTopbarVisibility();
    refreshMenuChallengeButton();
    if (menuTitle) {
      menuTitle.textContent = "合成大群友";
    }
    if (menuStartButton) {
      menuStartButton.textContent = "开始游玩";
    }
    if (challengeMenuTitle) {
      challengeMenuTitle.textContent = "选择挑战";
    }
    if (mainMenuOverlay) {
      mainMenuOverlay.hidden = false;
    }
    if (challengeMenuOverlay) {
      challengeMenuOverlay.hidden = true;
    }
    refreshMenuPigElements();
    if (returning) {
      maybeSpawnCapturedPig();   /* 收集阶段：20% 概率被捕捉的小猪从上方落下 */
    }
    mainMenuVisitedOnce = true;
  }

  function closeMainMenu() {
    dismissCapturedPig();   /* 切换到其它页面：正在掉落/悬停的小猪自动消失 */
    if (mainMenuOverlay) {
      mainMenuOverlay.hidden = true;
    }
    syncTopbarVisibility();
  }

  function refreshMenuChallengeButton() {
    if (!menuChallengeButton) {
      return;
    }
    var unlocked = challengeFeatureUnlocked();
    menuChallengeButton.textContent = unlocked ? "特殊挑战" : "🔒 特殊挑战";
    try {
      if (menuChallengeButton.classList && menuChallengeButton.classList.toggle) {
        menuChallengeButton.classList.toggle("locked", !unlocked);
      }
    } catch (error) { /* 桩无 classList 时跳过 */ }
  }

  function showMenuToast(text) {
    if (!menuToast) {
      return;
    }
    if (menuToastText) {
      menuToastText.textContent = text;
    }
    menuToast.hidden = false;
    if (typeof clearTimeout === "function") {
      clearTimeout(menuToastTimer);
    }
    try {
      menuToast.style.animation = "none";
      void menuToast.offsetWidth;
      menuToast.style.animation = "";
    } catch (error) { /* 重启动画失败不影响显示 */ }
    if (typeof setTimeout === "function") {
      menuToastTimer = setTimeout(function () {
        menuToast.hidden = true;
      }, 2200);
    }
  }

  /* ===== 特殊挑战菜单：我才是群主（第一位）+ 三个空白占位挑战 ===== */
  function openChallengeMenu() {
    renderChallengeMenu();
    closeMainMenu();
    if (challengeMenuOverlay) {
      challengeMenuOverlay.hidden = false;
    }
    syncTopbarVisibility();
    refreshMenuPigElements();   /* 悬挂小猪只在主界面显示：挑战菜单中隐藏 */
  }

  function closeChallengeMenu() {
    if (challengeMenuOverlay) {
      challengeMenuOverlay.hidden = true;
    }
    syncTopbarVisibility();
  }

  function buildChallengeMenuEntry(options) {
    var entry = document.createElement("button");
    var unlocked = !!options.unlocked;
    entry.type = "button";
    entry.className = "challenge-menu-entry" + (unlocked ? "" : " challenge-menu-entry-locked")
      + (options.eroLocked ? " challenge-menu-entry-ero" : "")
      + (options.eroFull ? " challenge-menu-entry-ero-full" : "");
    var avatar = document.createElement("span");
    avatar.className = "challenge-menu-avatar";
    if (options.avatarImage) {
      var customImage = document.createElement("img");
      customImage.src = options.avatarImage;   /* Q7: 小猪挑战槽位的自定义头像 */
      customImage.alt = options.name || "";
      avatar.appendChild(customImage);
    } else if (unlocked && options.image) {
      var image = document.createElement("img");
      image.src = options.image;   /* challenge/1.jpg 为项目内资源，不走 assets/ 前缀（否则 404 无头像） */
      image.alt = options.name;
      avatar.appendChild(image);
    } else if (options.showAvatarLocked) {
      avatar.textContent = "🔒";   /* 未解锁的普通挑战显示上锁头像 */
    } /* 我才是群主解锁前：不显示其头像（保留空占位） */
    var text = document.createElement("span");
    text.className = "challenge-menu-text";
    var name = document.createElement("span");
    name.className = "challenge-menu-name";
    name.textContent = options.name;
    var hint = document.createElement("span");
    hint.className = "challenge-menu-hint";
    hint.textContent = options.hintText !== undefined ? options.hintText
      : (unlocked ? options.unlockedHint : options.lockedHint);
    text.appendChild(name);
    text.appendChild(hint);
    entry.appendChild(avatar);
    entry.appendChild(text);
    if (options.onSelect) {
      entry.addEventListener("click", function (event) {
        if (event && event.stopPropagation) {
          event.stopPropagation();
        }
        options.onSelect();
      });
    } else {
      entry.disabled = true;   /* 未解锁：点击不可进入 */
    }
    return entry;
  }

  function renderChallengeMenu() {
    if (!challengeMenuList) {
      return;
    }
    challengeMenuList.innerHTML = "";
    /* 第一位：我才是群主（解锁前头像位显示 🔒；名称与解锁方式可见，点击不可进入） */
    challengeMenuList.appendChild(buildChallengeMenuEntry({
      unlocked: challengeUnlocked,
      name: "我才是群主",
      lockedHint: "解锁方式：群主，恣意禁言群友者也",
      unlockedHint: "最高分：" + challengeBest,
      image: "challenge/1.jpg",
      showAvatarLocked: true,
      onSelect: challengeUnlocked ? function () {
        closeChallengeMenu();
        startOwnerChallenge("menu");
      } : null
    }));
    /* 第二位：直到群友变成一群小猪——
     * 未通过「我才是群主」：空白占位；
     * 收集中：头像「猪呢」+ ？？？ + 「还剩N只」（实时）；
     * 已收集未通关：？？？ + 「快去玩解锁挑战吧，哼唧~」（可点击进入挑战）；
     * 通关后：挑战名 + 唱片猪头像 + 最高分（可反复游玩） */
    if (!challengeUnlocked) {
      challengeMenuList.appendChild(buildChallengeMenuEntry({
        unlocked: false,
        name: "？？？",
        lockedHint: "解锁方式：？？？",
        image: "",
        showAvatarLocked: true,
        onSelect: null
      }));
    } else {
      var pigPassed = pigProgress.passed;
      var collecting = !pigCollectionDone();
      /* 解锁对局失败后的重进入口：只能点特殊挑战菜单里吊着的小猪（进入后旋转小猪不再出现在选择页） */
      var pigPortal = collecting && pigProgress.attempted && !pigProgress.pigMade
        && pigProgress.menuClicked && pigProgress.captured >= PIG_CAPTURE_MAX;
      challengeMenuList.appendChild(buildChallengeMenuEntry({
        unlocked: true,
        /* 头像：收集阶段「猪呢」；解锁（第⑤只唱片猪到手）后变为唱片猪动图 */
        avatarImage: pigProgress.pigMade ? PIG_TARGET_IMAGE : PIG_ASSETS.where,
        name: pigPassed ? "直到群友变成一群小猪" : "？？？",
        /* 解锁提示：三栏进度 🐖|🐖|🐖🐖🐖
         * 第一栏 = 主界面小猪（①），第二栏 = 旋转小猪（③），第三栏 = 三只被吊着的小猪（②）；
         * 收集到哪只，哪一栏的小猪就消失；进入过解锁对局后旋转小猪一栏不再显示，
         * 重进入口 = 三只被吊着的小猪（点击直接进入解锁对局）；通关后显示最高分 */
        hintText: collecting ? (pigPortal ? "🐖🐖🐖" : [
          pigProgress.menuClicked ? "" : "🐖",
          pigProgress.pigMade || pigProgress.attempted ? "" : "🐖",
          new Array(Math.max(0, PIG_CAPTURE_MAX - pigProgress.captured) + 1).join("🐖")
        ].join("|"))
          : (pigPassed ? "最高分：" + pigProgress.best : "快去玩解锁挑战吧，哼唧~"),
        onSelect: pigPortal ? function () {
          var pool = COLLEGES.filter(function (candidate) {
            return candidate.key !== OWNER_KEY && !mutedKeys[candidate.key];
          });
          var member = pool.length > 0
            ? pool[Math.floor(Math.random() * pool.length)].key
            : COLLEGES[0].key;
          closeChallengeMenu();
          startPigUnlockGame(member);
        } : (collecting || !pigPassed ? null : function () {
          /* 未通关（pigMade 未 passed）：菜单不提供入口——重进只能走左下角悬挂小猪；
           * 通关后可从菜单反复游玩 */
          closeChallengeMenu();
          startPigChallenge();
        })
      }));
    }
    /* 第三位：Erosion——前置为解锁「直到群友变成一群小猪」。
     * 前置未满足：空白占位；
     * 已解锁小猪挑战：异常卡（黑色在下白色在上的渐变盖住解锁提示与半边🔒头像，标题「？？？」）；
     * 本挑战解锁后：Erosion 头像 + 挑战名 + 最高分（可反复游玩） */
    if (!challengeUnlocked || !pigProgress.passed) {
      challengeMenuList.appendChild(buildChallengeMenuEntry({
        unlocked: false,
        name: "？？？",
        lockedHint: "解锁方式：？？？",
        image: "",
        showAvatarLocked: true,
        onSelect: null
      }));
    } else if (!erodeProgress.unlocked) {
      challengeMenuList.appendChild(buildChallengeMenuEntry({
        unlocked: false,
        name: "？？？",
        hintText: "解锁方式：？？？",   /* 与底部占位示例一致（被黑色渐变遮住） */
        image: "",
        showAvatarLocked: true,
        eroLocked: true,        /* 卡片黑渐变遮罩（CSS） */
        onSelect: null
      }));
    } else if (erodeProgress.unlocked && erodeProgress.failed) {
      /* 失败后重试入口：选项全黑，点击询问是否重新挑战（选项与小猪挑战一致） */
      challengeMenuList.appendChild(buildChallengeMenuEntry({
        unlocked: true,
        avatarImage: ERO_TARGET_IMAGE,
        name: "？？？",
        hintText: "",
        eroFull: true,
        onSelect: function () {
          if (eroRetryOverlay) {
            eroRetryOverlay.hidden = false;
          }
        }
      }));
    } else {
      challengeMenuList.appendChild(buildChallengeMenuEntry({
        unlocked: true,
        avatarImage: ERO_TARGET_IMAGE,
        name: "Erosion",
        hintText: erodeProgress.passed ? "最高分：" + erodeProgress.best : "快去玩解锁挑战吧",
        onSelect: function () {
          closeChallengeMenu();
          startEroChallenge();
        }
      }));
    }
    /* 剩余默认空白挑战占位 */
    challengeMenuList.appendChild(buildChallengeMenuEntry({
      unlocked: false,
      name: "？？？",
      lockedHint: "解锁方式：？？？",
      image: "",
      showAvatarLocked: true,
      onSelect: null
    }));
  }

  /* ===== Q8 Erosion 挑战 ===== */
  /* 组 12 级合成链：随机 11 位群友（不含群主），链顶为 Erosion 球 */
  function setupEroChallenge() {
    var pool = COLLEGES.filter(function (college) {
      return college.key !== OWNER_KEY;
    });
    shuffleArray(pool);
    eroChain = pool.slice(0, ERO_CHAIN_LENGTH - 1);
    challengeTargetKey = "ERO_TARGET";
    challengeSkipLevel = -1;
    challengeMembers = eroChain.slice();
    challengeDisplay = shuffleArray(eroChain.slice());
    challengeMutedKey = null;
    challengePendingKey = null;
  }

  /* 进入 Erosion 挑战：无规则页，开场后直接开局（黑底标题栏 + 视野圆环） */
  function startEroChallenge(entry) {
    clearChallengeTimers();
    pigUnlockActive = false;
    pigGlowBody = null;
    pigBlastActive = false;
    pigFly = null;
    eroGameActive = false;
    eroAnomalyKey = null;
    eroCurrentGameAnomalous = false;
    challengeKind = "ero";
    challengeActive = true;
    /* entry = "unlock"：异常局黑色蔓延触发的首次解锁对局（重开/退出禁用）；
     * entry = "menu"：解锁后从菜单/重试进入（重开/退出恢复可用） */
    challengeEntry = entry === "unlock" ? "unlock" : "menu";
    challengePhase = "intro";
    syncTopbarVisibility();
    setCinema(false);
    setupEroChallenge();
    challengePhase = "playing";
    syncTopbarVisibility();
    startChallengeGame();
  }

  /* 终章结束（界面全白）→ 挑战开场：头像 + 「特殊挑战 / 我才是群主」→ 淡出 → 选择禁言 */
  function startOwnerChallenge(entry) {
    challengeEntry = entry === "menu" ? "menu" : "egg";
    clearChallengeTimers();
    challengeKind = "owner";   /* 显式重置：防止小猪挑战残留的 kind 把群主挑战劫持成小猪对局 */
    challengeActive = true;
    setupChallenge();
    challengePhase = "intro";
    syncTopbarVisibility();
    targetOverlay.hidden = true;
    showChallengePanel("intro");
    scheduleChallengeStep(3000, function () {
      challengeIntro.className = "challenge-intro challenge-fade-out";  /* 开场淡出 */
    });
    scheduleChallengeStep(4100, function () {
      challengeIntro.className = "challenge-intro";
      enterChallengePick();
    });
  }

  function enterChallengePick() {
    challengePhase = "pick";
    syncTopbarVisibility();
    challengeConfirm.hidden = true;
    challengePickTitle.textContent = "选择禁言一个群友";
    challengeNote.innerHTML = "<p>选项当中有一个是合成目标</p><p>如果禁言合成目标，则挑战成功</p><p>否则，需正常完成目标合成</p>";
    renderChallengePick();
    showChallengePanel("pick");
    try {
      challengePick.style.opacity = "0";
      void challengePick.offsetWidth;  /* 强制回流后淡入 */
      challengePick.style.opacity = "1";
    } catch (error) {
      // 淡入是锦上添花
    }
  }

  function askChallengeMute(key) {
    if (challengePhase !== "pick") {
      return;
    }
    challengePendingKey = key;
    var college = collegeByKey(key);
    challengeConfirmText.textContent = "确定禁言「" + (college ? college.short : key) + "」？";
    challengeConfirm.hidden = false;
  }

  function cancelChallengeMute() {
    challengePendingKey = null;
    challengeConfirm.hidden = true;
  }

  function confirmChallengeMute() {
    if (challengePhase !== "pick" || !challengePendingKey) {
      return;
    }
    var key = challengePendingKey;
    challengePendingKey = null;
    challengeConfirm.hidden = true;
    challengeMutedKey = key;
    if (key === challengeTargetKey) {
      /* 禁言到合成目标：直接挑战成功 */
      challengePhase = "success";
      startChallengeCelebration(null);
      showChallengeResult(true);
      return;
    }
    /* 被禁言小球所在等级跳过（干扰项不在链上则无跳过），其余等级与半径不变 */
    challengeSkipLevel = -1;
    for (var i = 0; i < challengeChain.length; i += 1) {
      if (challengeChain[i].key === key) {
        challengeSkipLevel = i;
        break;
      }
    }
    startChallengeGame();
  }

  /* 挑战链的半径/分数：原 13 级配置向几何延伸两级。
   * 第 14 级 99（两球并排 396px < 400 可合成），第 15 级 116 为链顶目标 */
  function challengeLevelRadii() {
    return (Array.isArray(CONFIG.radii) ? CONFIG.radii : []).concat([99, 116]);
  }

  function challengeLevelScores() {
    return (Array.isArray(CONFIG.scores) ? CONFIG.scores : []).concat([2000, 2250]);
  }

  function startChallengeGame() {
    clearChallengeTimers();
    challengePhase = "playing";
    syncTopbarVisibility();
    if (challengeKind === "ero") {
      /* Erosion 挑战：12 级链（11 位群友 + 链顶 Erosion 球），黑底标题栏 + 白色警戒线 */
      var eroRadii = challengeLevelRadii();
      var eroScores = challengeLevelScores();
      LEVELS = eroChain.map(function (member, index) {
        return {
          key: member.key,
          name: member.name,
          short: member.short,
          radius: eroRadii[index] !== undefined ? eroRadii[index] : CONFIG.radii[index],
          score: eroScores[index] !== undefined ? eroScores[index] : CONFIG.scores[index],
          color: member.color,
          image: member.image,
          offsetY: member.offsetY || 0,
          scale: member.scale || 1
        };
      });
      LEVELS.push({
        key: "ERO_TARGET",
        name: "Erosion",
        short: "黑",
        radius: CONFIG.radii[CONFIG.radii.length - 1],
        score: CONFIG.scores[CONFIG.scores.length - 1],
        color: "#17181c",
        image: ERO_TARGET_IMAGE,
        offsetY: 0,
        scale: 1
      });
      LEVEL_ASSETS = preloadLevelAssets();
      targetCollegeKey = challengeTargetKey;
      applyTheme(null);
      setGameTitle();
      if (gameTitleElement) {
        gameTitleElement.textContent = "Erosion";   /* Q8: 挑战对局标题为挑战名 */
      }
      setCinema(false);
      startGame();
      challengeOverlay.hidden = true;
      updateScoreDisplay(false);
      showTargetBanner({ key: "ERO_TARGET", name: "Erosion", image: ERO_TARGET_IMAGE }, "select", true);
      try {
        if (document.body && document.body.classList) {
          document.body.classList.add("ero-title-dark");   /* 标题栏黑底白字 */
        }
      } catch (error) { /* 桩环境忽略 */ }
      return;
    }
    if (challengeKind === "pig") {
      /* 小猪挑战：13 级链（每级 = 群友与同级小猪，链顶唱片猪），半径/分数沿用 13 级配置 */
      LEVELS = PIG_LEVEL_DEFS.map(function (def, index) {
        return {
          key: "PIG_" + index,
          name: def.name,
          short: "猪",
          radius: CONFIG.radii[index],
          score: CONFIG.scores[index],
          color: def.color,
          image: def.image,
          offsetY: 0,
          scale: 1
        };
      });
      LEVELS.push({
        key: "PIG_TARGET",
        name: "唱片猪(旋转猪)",
        short: "猪",
        radius: CONFIG.radii[CONFIG.radii.length - 1],
        score: CONFIG.scores[CONFIG.scores.length - 1],
        color: "#f0a0c8",
        image: PIG_TARGET_IMAGE,
        offsetY: 0,
        scale: 1
      });
      LEVEL_ASSETS = preloadLevelAssets();
      targetCollegeKey = challengeTargetKey;
      var pigTheme = collegeByKey(pigChain.length > 0 ? pigChain[0].key : "") || COLLEGES[0];
      applyTheme(pigTheme);
      setGameTitle();
      if (gameTitleElement) {
        gameTitleElement.textContent = "🐖🐖🐖🐖🐖";
      }
      setCinema(false);
      startGame();
      challengeOverlay.hidden = true;
      updateScoreDisplay(false);
      return;
    }
    var target = collegeByKey(challengeTargetKey) || COLLEGES[0];
    var radii = challengeLevelRadii();
    var scores = challengeLevelScores();
    LEVELS = challengeChain.map(function (college, index) {
      var levelInfo = LEVELS[index] || {};
      return {
        key: college ? college.key : "",
        name: college ? college.name : "",
        short: college ? college.short : "",
        radius: radii[index] !== undefined ? radii[index] : levelInfo.radius,
        score: scores[index] !== undefined ? scores[index] : levelInfo.score,
        color: college ? college.color : DEFAULT_COLORS[index % DEFAULT_COLORS.length],
        image: college ? college.image : "",
        offsetY: college ? college.offsetY : 0,
        scale: college ? college.scale : 1
      };
    });
    LEVEL_ASSETS = preloadLevelAssets();
    targetCollegeKey = challengeTargetKey;
    applyTheme(target);
    setGameTitle();
    if (gameTitleElement) {
      gameTitleElement.textContent = "我才是群主";   /* Q6: 挑战对局左上角标题 */
    }
    setCinema(false);              /* 对局恢复完整游戏界面 */
    startGame();
    challengeOverlay.hidden = true;
  }

  function startChallengeCelebration(body) {
    startHighestCelebration({
      id: body ? body.id : -1,
      x: body ? body.x : WORLD_WIDTH / 2,
      y: body ? body.y : WORLD_HEIGHT / 2
    });
  }

  /* 挑战结算：success = 「恭喜，挑战成功！」+ 礼花，继续键居中；
   * failed = 「很遗憾，挑战失败······」，重来（白底红字）在左、继续（白底蓝字）在右 */
  function showChallengeResult(success) {
    /* Q8: Erosion 结算面板不再使用纯黑背景（成功已溶白 / 失败回到正常底色） */
    if (challengeOverlay) {
      challengeOverlay.classList.remove("challenge-overlay-black");
    }
    challengeResultTitle.textContent = success ? "恭喜，挑战成功！" : "很遗憾，挑战失败······";
    challengeRetryButton.hidden = success;
    if (challengeResultImage) {
      if (challengeKind === "pig") {
        /* 小猪挑战：文字与按键之间展示随机胜/败图片 */
        var pool = success ? PIG_RESULT_WIN : PIG_RESULT_FAIL;
        challengeResultImage.src = pool[Math.floor(Math.random() * pool.length)];
        challengeResultImage.hidden = false;
      } else {
        challengeResultImage.hidden = true;
      }
    }
    if (challengeResultActions) {
      challengeResultActions.className = "confirm-actions " + (success ? "result-actions-center" : "result-actions-split");
    }
    setCinema(false);
    showChallengePanel("result");
    if (success) {
      playVictorySound();
    }
  }

  function challengeSuccess(body) {
    if (challengePhase !== "playing") {
      return;
    }
    challengePhase = "success";
    targetAchieved = true;   /* 冻结投放，警戒线不再触发失败 */
    readyToDrop = false;
    updateControls();   /* 结算等待期锁定重开/退出，防止清除结算定时器 */
    if (challengeKind === "ero") {
      /* Erosion 挑战成功：以合成目标为中心，四周黑色缓慢向外退散露出小球与棋盘
       * （不变白），完全露出后才弹出结算画面 */
      erodeProgress.passed = true;
      erodeProgress.failed = false;
      if (score > erodeProgress.best) {
        erodeProgress.best = score;
      }
      saveErodeProgress();
      eroReveal = {
        x: body ? body.x : WORLD_WIDTH / 2,
        y: body ? body.y : WORLD_HEIGHT / 2,
        r: body ? body.radius : 40,
        age: 0,
        duration: ERO_REVEAL_DURATION
      };
      eroClearTitleThemes();
      startChallengeCelebration(body);
      scheduleChallengeStep(ERO_REVEAL_DURATION * 1000 + 500, function () {
        showChallengeResult(true);
      });
      return;
    }
    if (challengeKind === "pig") {
      /* 小猪挑战成功：记录最高分与通关标记（菜单槽位显示挑战名 + 最高分） */
      pigProgress.passed = true;
      if (score > pigProgress.best) {
        pigProgress.best = score;
      }
      savePigProgress();
      startChallengeCelebration(body);
      if (!prefersReducedMotion()) {
        var pigRibbons = ["#e8506e", "#f5a623", "#2bb3a3", "#4f7df9", "#9b59d0"];
        addCelebrationBurst(body.x - 70, body.y + 40, 90, 240, 420, pigRibbons, true);
        addCelebrationBurst(body.x + 70, body.y + 40, 90, 240, 420, pigRibbons, true);
        addCelebrationBurst(body.x, body.y - 70, 70, 200, 460, pigRibbons, true);
      }
      scheduleChallengeStep(2600, function () {
        showChallengeResult(true);
      });
      return;
    }
    /* 通过一次 → 解锁该挑战并记录最高分（可在特殊挑战菜单重复游玩） */
    challengeUnlocked = true;
    if (score > challengeBest) {
      challengeBest = score;
    }
    saveChallengeProgress();
    startChallengeCelebration(body);
    /* 礼花彩带：左右下三向三连爆发，缎带配色适配白色结算背景（区别于合成大院系的金紫双色） */
    if (!prefersReducedMotion()) {
      var ribbonColors = ["#e8506e", "#f5a623", "#2bb3a3", "#4f7df9", "#9b59d0"];
      addCelebrationBurst(body.x - 70, body.y + 40, 90, 240, 420, ribbonColors, true);
      addCelebrationBurst(body.x + 70, body.y + 40, 90, 240, 420, ribbonColors, true);
      addCelebrationBurst(body.x, body.y - 70, 70, 200, 460, ribbonColors, true);
    }
    /* 稍作停留（约 2.6s）：让玩家看清合成的秘密目标与礼花绽放，再弹出结算面板 */
    scheduleChallengeStep(2600, function () {
      showChallengeResult(true);
    });
  }

  /* 重来：小猪挑战 → 直接重开（重新随机 12 位群友链）；
   * 我才是群主 → 从选择禁言小球开始，重新随机一条合成链 */
  function retryChallenge() {
    clearChallengeTimers();
    resetBoardToIdle();
    mode = "playing";
    if (challengeKind === "pig") {
      startPigChallenge(true);   /* 结算面板「重来」：不重放标题与规则，直接开局 */
      return;
    }
    if (challengeKind === "ero") {
      startEroChallenge();   /* Erosion「重来」：直接重开（重新随机 11 位群友链） */
      return;
    }
    challengeKind = "owner";   /* 群主挑战重来：显式重置种类 */
    mode = "selecting";
    challengeActive = true;
    setupChallenge();
    enterChallengePick();
  }

  /* 继续：小猪挑战 → 回主界面（成功=通关；失败=可从左下角动图重试）；
   * 我才是群主：失败 → 回主界面；成功 → 按入口回特殊挑战菜单或选择界面。
   * 任何情况下都清空所有禁言记录；解锁成功后彩蛋永久关闭 */
  function finishChallenge() {
    var succeeded = challengePhase === "success";
    var wasPig = challengeKind === "pig";
    challengeKind = "owner";   /* 重置种类，避免残留 pig 影响下一场挑战 */
    clearChallengeTimers();
    challengeActive = false;
    challengePhase = null;
    challengeSkipLevel = -1;
    challengeMembers = [];
    challengeChain = [];
    challengeDisplay = [];
    challengeMutedKey = null;
    challengeTargetKey = null;
    eggDone = true;
    saveEggDone();
    mutedKeys = {};
    saveMuted();
    resetBoardToIdle();
    mode = "playing";
    challengeOverlay.hidden = true;
    setCinema(false);
    setGameTitle();
    if (wasPig) {
      refreshMenuPigElements();  /* 通关后左下角动图消失 */
      openMainMenu();            /* 小猪挑战无论成败都回主界面 */
    } else if (!succeeded) {
      openMainMenu();            /* 挑战失败 + 继续 → 回主界面（禁言已清空） */
    } else if (challengeEntry === "menu") {
      openChallengeMenu();       /* 从特殊挑战菜单进入且成功 → 回到菜单（可重复游玩） */
    } else {
      openTargetPicker();        /* 彩蛋终章进入且成功 → 回到初始选择界面 */
    }
  }

  /* 挑战中途退出：清理挑战状态（禁言清空）→ 回到「特殊挑战」选择菜单 */
  function exitChallengeToMenu() {
    var wasPig = challengeKind === "pig";
    challengeKind = "owner";   /* 重置种类，避免残留 pig 影响下一场挑战 */
    clearChallengeTimers();
    challengeActive = false;
    challengePhase = null;
    challengeSkipLevel = -1;
    challengeMembers = [];
    challengeChain = [];
    challengeDisplay = [];
    challengeMutedKey = null;
    challengeTargetKey = null;
    pigBlastActive = false;
    pigGlowBody = null;
    pigFly = null;
    mutedKeys = {};
    saveMuted();
    resetBoardToIdle();
    mode = "playing";
    challengeOverlay.hidden = true;
    setCinema(false);
    setGameTitle();
    eroClearTitleThemes();
    if (wasPig) {
      refreshMenuPigElements();
    }
    updateControls();
    openChallengeMenu();
  }

  function eggDoneStorageKey() {
    return CONFIG.eggDoneKey;
  }

  function loadEggDone() {
    try {
      return window.localStorage.getItem(eggDoneStorageKey()) === "1";
    } catch (error) {
      return false;
    }
  }

  function saveEggDone() {
    try {
      window.localStorage.setItem(eggDoneStorageKey(), "1");
    } catch (error) {
      // Storage unavailable — egg stays available this session
    }
  }

  /* ===== Q7 小猪挑战：收集进度存档 ===== */
  function pigProgressStorageKey() {
    return CONFIG.pigProgressKey;
  }

  function loadPigProgress() {
    var fallback = { menuClicked: false, captured: 0, pigMade: false, attempted: false, best: 0, passed: false };
    try {
      var raw = window.localStorage.getItem(CONFIG.pigProgressKey || "merge-game:qunyou:pigs:v8");
      if (!raw) {
        return fallback;
      }
      var parsed = JSON.parse(raw);
      return {
        menuClicked: !!parsed.menuClicked,
        captured: clamp(Number(parsed.captured) || 0, 0, PIG_CAPTURE_MAX),
        pigMade: !!parsed.pigMade,
        attempted: !!parsed.attempted,   /* 进入过解锁对局：此后只能从特殊挑战菜单的吊着小猪重进 */
        best: Math.max(0, Number(parsed.best) || 0),
        passed: !!parsed.passed
      };
    } catch (error) {
      return fallback;
    }
  }

  function savePigProgress() {
    try {
      window.localStorage.setItem(pigProgressStorageKey(), JSON.stringify(pigProgress));
    } catch (error) {
      // Storage unavailable — progress stays in memory this session
    }
  }

  function pigChallengeActive() {
    return challengeActive && challengeKind === "pig";
  }

  /* ===== Q8 Erosion：进度存档与异常群友管理 ===== */
  function erodeStorageKey() {
    return CONFIG.erodeKey;
  }

  function loadErodeProgress() {
    var fallback = { unlocked: false, passed: false, best: 0, failed: false, anomalies: [] };
    try {
      var raw = window.localStorage.getItem(CONFIG.erodeKey || "merge-game:qunyou:erode:v3");
      if (!raw) {
        return fallback;
      }
      var parsed = JSON.parse(raw);
      return {
        unlocked: !!parsed.unlocked,
        passed: !!parsed.passed,
        best: Math.max(0, Number(parsed.best) || 0),
        failed: !!parsed.failed,
        anomalies: Array.isArray(parsed.anomalies)
          ? parsed.anomalies.filter(function (key) {
            return typeof key === "string" && key !== OWNER_KEY;
          }).slice(0, COLLEGES.length)
          : []
      };
    } catch (error) {
      return fallback;
    }
  }

  function saveErodeProgress() {
    try {
      window.localStorage.setItem(erodeStorageKey(), JSON.stringify(erodeProgress));
    } catch (error) {
      // Storage unavailable — progress stays in memory this session
    }
  }

  function eroChallengeActive() {
    return challengeActive && challengeKind === "ero";
  }

  /* 每次退出「无异常」的正常合成游玩：随机一位群友的选择卡出现黑色渐变异常
   * （前置：小猪挑战已解锁；解锁 Erosion 后机制继续：异常群友随机抽取，
   *   其合成局以该群友为特殊挑战式合成目标） */
  /* 每次退出「无异常」的正常合成游玩：随机一位群友的选择卡出现黑色渐变异常
   * （前置：小猪挑战已通关；Erosion 解锁后异常触发清除，不再累积） */
  function eroAddAnomaly() {
    if (!challengeFeatureUnlocked() || !pigProgress.passed || erodeProgress.unlocked) {
      return false;
    }
    var pigMemberKey = pickPigMemberKey();
    var pool = COLLEGES.filter(function (candidate) {
      return candidate.key !== OWNER_KEY
        && !mutedKeys[candidate.key]
        && candidate.key !== pigMemberKey
        && erodeProgress.anomalies.indexOf(candidate.key) < 0;
    });
    if (pool.length === 0) {
      return false;
    }
    erodeProgress.anomalies.push(pool[Math.floor(Math.random() * pool.length)].key);
    saveErodeProgress();
    return true;
  }

  /* 退出正常合成对局时调用：异常局不累计；正常局每次退出/重开/换目标各累计一位
   * （多出口同帧防重由调用方保证：继续键先切 selecting 再开选择页） */
  function eroNotifyNormalGameExit() {
    if (challengeActive || eroCurrentGameAnomalous || eggMode || mode === "selecting") {
      return;
    }
    eroAddAnomaly();
  }

  function eroEndAnomalyGame() {
    eroGameActive = false;
    eroAnomalyKey = null;
  }

  /* 黑底标题栏主题（Erosion 挑战对局中），失败/结束时清除 */
  function eroClearTitleThemes() {
    try {
      if (document.body && document.body.classList) {
        document.body.classList.remove("ero-title-dark");
        document.body.classList.remove("ero-title-covered");
        document.body.classList.remove("ero-title-fail");
      }
    } catch (error) { /* 桩环境忽略 */ }
  }

  /* 小猪图片预载（下标与 13 级链对齐：0-11 = 各级小猪，12 = 唱片猪） */
  var pigLevelAssets = null;
  function pigAssetFor(levelIndex) {
    if (!pigLevelAssets) {
      pigLevelAssets = PIG_LEVEL_DEFS.concat([{ image: PIG_TARGET_IMAGE }]).map(function (def) {
        var img = new Image();
        img.src = def.image;
        return img;
      });
    }
    return pigLevelAssets[levelIndex] || null;
  }

  /* 小猪挑战中各等级群友头像预载（下标 = 链等级；重建链条时刷新） */
  var pigMemberAssets = [];
  function pigMemberAssetFor(levelIndex) {
    if (pigChain.length === 0) {
      return null;
    }
    if (pigMemberAssets.length !== pigChain.length) {
      pigMemberAssets = pigChain.map(function (college) {
        var img = new Image();
        img.src = resolveAssetUrl(college.image);
        return img;
      });
    }
    return pigMemberAssets[levelIndex] || null;
  }

  /* 已收集小猪数（①菜单图 1 只 + ②被捕捉的小猪 ≤3 只 + ③合成唱片猪 1 只） */
  function pigCollectedCount() {
    return (pigProgress.menuClicked ? 1 : 0) + pigProgress.captured + (pigProgress.pigMade ? 1 : 0);
  }

  function pigsRemaining() {
    return Math.max(PIG_COLLECT_TOTAL - pigCollectedCount(), 0);
  }

  function pigCollectionDone() {
    return pigCollectedCount() >= PIG_COLLECT_TOTAL;
  }

  /* 主界面小猪元素状态：①被群友包围了（解锁「我才是群主」后出现）
   * ②被捕捉的小猪（收集中 20% 概率从上方落下；解锁后失败 → 左下角常驻重试入口） */
  function refreshMenuPigElements() {
    if (menuPigSurround) {
      menuPigSurround.hidden = false;   /* 主界面小猪图片从一开始就存在（点击收集仍需先解锁我才是群主） */
      if (challengeUnlocked && pigProgress.menuClicked) {
        menuPigSurround.classList.remove("pig-surround-shake");   /* 兜底：已收集过不再抖动 */
      }
    }
    if (pigCaptured) {
      var retryMode = challengeUnlocked && pigProgress.pigMade && !pigProgress.passed;
      var fallActive = pigCaptured.classList.contains("pig-captured-drop");
      var menuVisible = !!(mainMenuOverlay && !mainMenuOverlay.hidden);
      /* 悬挂小猪只在主界面显示：选择页 / 对局 / 挑战菜单等其它界面一律隐藏 */
      pigCaptured.hidden = !menuVisible || (!retryMode && !fallActive);
      pigCaptured.classList.toggle("pig-captured-retry", retryMode);
    }
  }

  /* ②：每次从其它界面回到主界面，20% 概率「被捕捉的小猪」从上方慢速掉落，
   * 悬停在屏幕左上角；force=true 供测试钩子跳过概率 */
  var pigCapturedFalling = false;      /* 小猪是否仍在下降途中 */
  var pigCapturedFallTimer = null;

  function maybeSpawnCapturedPig(force) {
    if (!challengeUnlocked || pigProgress.pigMade || pigProgress.captured >= PIG_CAPTURE_MAX) {
      return;
    }
    if (!pigCaptured || !pigCaptured.hidden || (!force && Math.random() >= 0.2)) {
      return;
    }
    pigCaptured.classList.remove("pig-captured-leave");
    pigCaptured.classList.remove("pig-captured-return");
    pigCaptured.hidden = false;
    try {
      void pigCaptured.offsetWidth;   /* 先以屏幕上方外渲染一帧，再播放掉落动画 */
    } catch (error) { /* 桩无 reflow 能力时忽略 */ }
    pigCaptured.classList.add("pig-captured-drop");
    pigCapturedFalling = true;   /* 下降途中被点到 → 计数后小猪原路返回 */
    if (pigCapturedFallTimer) {
      clearTimeout(pigCapturedFallTimer);
    }
    pigCapturedFallTimer = setTimeout(function () {
      pigCapturedFalling = false;   /* 落地悬停后点击 → 走常规向上移出动画 */
    }, 2800);
  }

  /* 从当前位置平滑飞回（下降途中被点到时的动画） */
  function flyCapturedPigBack() {
    var currentTransform = "";
    try {
      if (typeof window.getComputedStyle === "function") {
        currentTransform = window.getComputedStyle(pigCaptured).transform || "";
      }
    } catch (error) { /* 桩环境无 getComputedStyle */ }
    pigCaptured.classList.remove("pig-captured-drop");
    pigCaptured.classList.add("pig-captured-return");
    pigCaptured.style.animation = "none";
    pigCaptured.style.transform = (currentTransform && currentTransform !== "none")
      ? currentTransform
      : "translateY(-16%)";
    try {
      void pigCaptured.offsetWidth;   /* 冻结当前帧后再启动返回过渡 */
    } catch (error) { /* 桩无 reflow 能力时忽略 */ }
    pigCaptured.style.transition = "transform 0.95s ease-in, opacity 0.95s ease-in";
    pigCaptured.style.transform = "translateY(-80%) rotate(-8deg)";
    pigCaptured.style.opacity = "0.1";
    setTimeout(function () {
      pigCaptured.hidden = true;
      pigCaptured.style.animation = "";
      pigCaptured.style.transform = "";
      pigCaptured.style.transition = "";
      pigCaptured.style.opacity = "";
      pigCaptured.classList.remove("pig-captured-drop");
      pigCaptured.classList.remove("pig-captured-return");
      pigCaptured.classList.remove("pig-captured-leave");
    }, 1000);
  }

  /* 切换到其它页面：正在掉落/悬停/返回中的小猪自动消失（不计入收集） */
  function dismissCapturedPig() {
    if (!pigCaptured || pigCaptured.classList.contains("pig-captured-retry")) {
      return;
    }
    pigCapturedFalling = false;
    if (pigCapturedFallTimer) {
      clearTimeout(pigCapturedFallTimer);
      pigCapturedFallTimer = null;
    }
    pigCaptured.classList.remove("pig-captured-drop");
    pigCaptured.classList.remove("pig-captured-leave");
    pigCaptured.classList.remove("pig-captured-return");
    pigCaptured.hidden = true;
  }

  function collectCapturedPig() {
    var wasFalling = pigCapturedFalling;   /* 下降途中点到：计数照常，动画改为原路返回 */
    pigCapturedFalling = false;
    if (pigCapturedFallTimer) {
      clearTimeout(pigCapturedFallTimer);
      pigCapturedFallTimer = null;
    }
    if (pigProgress.captured < PIG_CAPTURE_MAX && !pigProgress.pigMade) {
      pigProgress.captured += 1;
      savePigProgress();
      playMergeSound(1);
      renderChallengeMenu();
    }
    if (wasFalling) {
      flyCapturedPigBack();
      return;
    }
    pigCaptured.classList.remove("pig-captured-drop");   /* 向上移出屏幕 */
    pigCaptured.classList.add("pig-captured-leave");
    window.setTimeout(function () {
      pigCaptured.hidden = true;
      pigCaptured.classList.remove("pig-captured-drop");
      pigCaptured.classList.remove("pig-captured-leave");
    }, 1050);
  }

  function clickMenuPigSurround() {
    if (!challengeUnlocked || pigProgress.menuClicked) {
      return;   /* 已收集过：点击不再产生效果 */
    }
    pigProgress.menuClicked = true;
    savePigProgress();
    playMergeSound(1);
    try {
      if (menuPigSurround.classList) {
        menuPigSurround.classList.remove("pig-surround-shake");
        void menuPigSurround.offsetWidth;
        menuPigSurround.classList.add("pig-surround-shake");
        /* 动画结束后立即移除：类残留会在每次 hidden→显示 时重播抖动 */
        window.setTimeout(function () {
          menuPigSurround.classList.remove("pig-surround-shake");
        }, 700);
      }
    } catch (error) { /* 桩无 classList/reflow 时忽略 */ }
    renderChallengeMenu();
  }

  /* P1: 投放解锁 —— 可投上限 = min(最高已合成级, 投放半径上限级)，
   * 夹在 1..倒数第二级；三档权重全部随合成进度增长，且最高档增长最快：
   *   顶部两级 1.0→1.5 / 次两级 0.7→1.1 / 其余 0.35→0.65（合成等级越高大球越多）。
   * 危险自适应：堆顶进入警戒线上方 2.5 倍范围即生效，与最高处球同级的球
   * 权重 ×(1 + 危险度×1.6)，最高 ×2.6——堆越危险，自救球刷得越多。
   * maxSpawnRadius 限定可投球不超过最大球的一半；合成到哪级就解锁投到哪级。
   * forceFullRange（小猪挑战的群友）：忽略解锁进度与「最大球一半」上限，
   * 在 0..当前合成出的最大小猪等级之间按同一权重抽取（开局只能抽最小级）。 */
  function takeRandomLevel(forceFullRange) {
    var maximumLevel;
    if (forceFullRange) {
      /* 小猪挑战的群友：各等级都可抽取，但不超过当前合成出的最大小猪等级 */
      maximumLevel = clamp(highestMergedLevel, 0, LEVELS.length - 2);
    } else if (CONFIG.progressiveUnlock) {
      var unlockCap = clamp(highestMergedLevel, 1, LEVELS.length - 2);
      /* 挑战链 15 级：投放上限按「不超过最大球一半」的规则重新推导 */
      var spawnCap = CONFIG.maxSpawnLevelIndex;
      if (challengeActive) {
        /* 投放上限按当前对局实际链推导（我才是群主 15 级 / 小猪挑战 13 级）：
         * 「不超过最大球一半」——小猪可刷新的等级限制与群友一致 */
        var challengeRadii = LEVELS.map(function (entry) { return entry.radius; });
        var halfMax = challengeRadii[challengeRadii.length - 1] / 2;
        for (var scan = challengeRadii.length - 1; scan >= 0; scan -= 1) {
          if (challengeRadii[scan] <= halfMax) {
            spawnCap = scan;
            break;
          }
        }
      }
      maximumLevel = Math.min(unlockCap, spawnCap);
    } else {
      maximumLevel = clamp(CONFIG.spawnLevelCount - 1, 0, LEVELS.length - 1);
    }
    currentMaxDropLevel = maximumLevel;
    var progress = clamp(highestMergedLevel / Math.max(LEVELS.length - 2, 1), 0, 1);
    var topWeight = 1.0 + progress * 0.5;
    var midWeight = 0.7 + progress * 0.4;
    var lowWeight = 0.35 + progress * 0.3;
    /* 危险自适应：堆顶越接近警戒线，越偏向刷出与最高处球同级的球，
     * 方便玩家合成削平堆顶自救（最高 ×2.6，随危险度线性） */
    var dangerBoost = 1;
    var nearDangerLevels = null;
    if (items.length > 0) {
      var topGap = Number.POSITIVE_INFINITY;
      items.forEach(function (body) {
        var top = body.y - body.radius;
        if (top < topGap) {
          topGap = top;
        }
      });
      if (topGap < DANGER_LINE * 2.5) {
        var danger = clamp((DANGER_LINE * 2.5 - topGap) / (DANGER_LINE * 1.5), 0, 1);
        dangerBoost = 1 + danger * 1.6;
        var tops = items.slice().sort(function (a, b) {
          return (a.y - a.radius) - (b.y - b.radius);
        }).slice(0, 3);
        nearDangerLevels = {};
        tops.forEach(function (body) {
          nearDangerLevels[body.level] = true;
        });
      }
    }
    var weights = [];
    var weightLevels = [];
    var total = 0;
    for (var i = 0; i <= maximumLevel; i += 1) {
      /* 特殊挑战：被禁言小球所在等级不投放 */
      if (challengeActive && i === challengeSkipLevel) {
        continue;
      }
      var weight = i >= maximumLevel - 1 ? topWeight : (i >= maximumLevel - 3 ? midWeight : lowWeight);
      if (nearDangerLevels && nearDangerLevels[i]) {
        weight *= dangerBoost;
      }
      weights.push(weight);
      weightLevels.push(i);
      total += weight;
    }
    if (weightLevels.length === 0) {
      return maximumLevel;
    }
    var roll = Math.random() * total;
    for (var j = 0; j < weightLevels.length; j += 1) {
      roll -= weights[j];
      if (roll <= 0) {
        return weightLevels[j];
      }
    }
    return weightLevels[weightLevels.length - 1];
  }

  function makeItem(level, x, y, vx, vy, source) {
    var radius = LEVELS[level].radius;
    var mass = radius * radius;
    return {
      id: nextItemId++,
      level: level,
      radius: radius,
      mass: mass,
      invMass: 1 / mass,
      x: x,
      y: y,
      vx: vx || 0,
      vy: vy || 0,
      age: 0,
      dangerGrace: source === "drop" ? 0.72 : 0.16,
      popTime: source === "merge" ? 0.18 : 0
    };
  }

  function syncCanvasResolution() {
    dpr = clamp(window.devicePixelRatio || 1, 1, 4);
    var rectangle = canvas.getBoundingClientRect();
    var cssWidth = rectangle.width || WORLD_WIDTH;
    var cssHeight = rectangle.height || WORLD_HEIGHT;
    var renderScale = Math.max(
      MIN_CANVAS_WIDTH / WORLD_WIDTH,
      cssWidth * dpr / WORLD_WIDTH,
      cssHeight * dpr / WORLD_HEIGHT
    );
    var nextWidth = Math.round(WORLD_WIDTH * renderScale);
    var nextHeight = Math.round(WORLD_HEIGHT * renderScale);
    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      canvas.width = nextWidth;
      canvas.height = nextHeight;
    }
    canvasScaleX = canvas.width / WORLD_WIDTH;
    canvasScaleY = canvas.height / WORLD_HEIGHT;
    ctx.imageSmoothingEnabled = true;
    if ("imageSmoothingQuality" in ctx) {
      ctx.imageSmoothingQuality = "high";
    }
  }

  function updateControls() {
    /* 挑战对局中「换目标」变为「退出」（移到「重开」右边）；
     * 「重开」：小猪挑战与「从特殊挑战菜单重新游玩的我才是群主」可用；
     * Erosion 仅解锁演出的首局禁用重开和退出，解锁后从菜单进入恢复正常；
     * 彩蛋首入的群主挑战禁用重开和退出（解锁对局一锤定音）；
     * 未通关的小猪挑战禁用重开和退出（通关后从菜单重进恢复正常）；
     * 结算等待期（成功礼花 / 失败定格 → 结算面板弹出前）锁定重开与退出，
     * 防止点击清除结算定时器导致结算面板不再弹出；
     * 各挑战最高分独立计算 */
    var ownerFromMenu = challengeActive && challengeKind === "owner" && challengeEntry === "menu";
    var pigUnpassed = challengeActive && challengeKind === "pig" && !pigProgress.passed;
    var restartAllowed = (!challengeActive || challengeKind === "pig" || ownerFromMenu
      || (challengeKind === "ero" && challengeEntry !== "unlock")) && !pigUnpassed;
    var resultPending = challengeActive && (challengePhase === "success" || challengePhase === "failed");
    var ownerEggEntry = challengeActive && challengeKind === "owner" && challengeEntry === "egg";
    if (challengeActive) {
      targetButton.textContent = "退出";
      if (headerActions && headerActions.appendChild) {
        headerActions.appendChild(targetButton);   /* 顺序：声音 / 重开 / 退出 */
      }
    } else {
      targetButton.textContent = "换目标";
      if (headerActions && headerActions.insertBefore && restartButton) {
        headerActions.insertBefore(targetButton, restartButton);   /* 顺序：声音 / 换目标 / 重开 */
      }
    }
    restartButton.disabled = mode !== "playing" || !restartAllowed || resultPending;
    targetButton.disabled = mode !== "playing"
      || (challengeActive && challengeKind === "ero" && challengeEntry === "unlock")
      || ownerEggEntry
      || pigUnpassed
      || resultPending;
  }

  function updateSoundControl() {
    soundIcon.classList.toggle("is-muted", !soundEnabled);
    soundButton.setAttribute("aria-label", soundEnabled ? "关闭声音" : "开启声音");
    soundButton.setAttribute("aria-pressed", String(soundEnabled));
  }

  function updateScoreDisplay(animate) {
    scoreElement.textContent = String(score);
    /* 挑战对局中「最高」显示该挑战内的最高分（本次实时超越时同步抬高），普通对局仍显示常规最高分 */
    var challengeBestNow = challengeKind === "pig" ? pigProgress.best : challengeBest;
    bestScoreElement.textContent = String(challengeActive ? Math.max(challengeBestNow, score) : bestScore);
    if (animate && !prefersReducedMotion() && typeof scoreElement.animate === "function") {
      scoreElement.animate(
        [
          { transform: "scale(1)", color: "#6650b7" },
          { transform: "scale(1.22)", color: "#df4d5d" },
          { transform: "scale(1)", color: "#6650b7" }
        ],
        { duration: 220, easing: "ease-out" }
      );
    }
  }

  function showHighestItem(levelIndex) {
    highestItemImage.src = LEVEL_ASSETS[levelIndex].src;
  }

  function startGame() {
    items = [];
    particles = [];
    celebrationParticles = [];
    failureBlasts = [];
    floaters = [];
    highestCelebration = null;
    failureSequence = null;
    victorySequence = null;
    pigGlowBody = null;   /* 重开时清理解锁演出闪光引用 */
    pigFly = null;
    pigBlastActive = false;
    try {
      if (boardWhiteout) {
        boardWhiteout.hidden = true;
        boardWhiteout.style.opacity = "0";   /* 重开时恢复棋盘背景 */
      }
    } catch (error) { /* 桩环境忽略 */ }
    pigSpawnSincePig = 0;   /* 节奏投放从头开始 */
    eroFront = 0;           /* Q8: 异常局黑色前沿复位 */
    eroFrontState = "idle";
    eroIdleTime = 0;
    eroArmed = false;
    eroTeaseAge = -1;
    eroUnlocking = false;
    eroFocusBody = null;
    eroFocusStable = 0;
    eroFocusAge = 0;
    eroReveal = null;
    eroClearTitleThemes();  /* 标题栏主题（黑底/黑化）复位 */
    try {
      if (eroBlackout) {
        eroBlackout.hidden = true;
        eroBlackout.style.opacity = "0";
      }
    } catch (error) { /* 桩环境忽略 */ }
    score = 0;
    bestBeforeGame = bestScore;
    maxLevelReached = 0;
    targetAchieved = false;
    highestMergedLevel = 0;
    currentMaxDropLevel = 1;
    nextItemId = 1;
    dangerTimer = 0;
    dangerIsNear = false;
    dangerIsCrossed = false;
    shake = 0;
    resetFrameClock();
    currentLevel = takeRandomLevel();
    aimX = WORLD_WIDTH / 2;
    readyToDrop = true;
    dropCooldown = 0;
    mode = "playing";

    gameOverOverlay.hidden = true;
    restartConfirmOverlay.hidden = true;
    newRecordElement.hidden = true;
    updateScoreDisplay(false);
    updateControls();
    refreshMenuPigElements();   /* 悬挂小猪只在主界面显示：开局即隐藏 */
  }

  function startFailureExplosion() {
    if (mode !== "playing") {
      return;
    }

    var queue = items.slice().sort(function (a, b) {
      return (a.y - a.radius) - (b.y - b.radius) || a.x - b.x || a.id - b.id;
    });
    var firstTop = queue.length > 0 ? queue[0].y - queue[0].radius : 0;
    var lastTop = queue.length > 0 ? queue[queue.length - 1].y - queue[queue.length - 1].radius : firstTop;
    var verticalSpan = Math.max(1, lastTop - firstTop);

    queue = queue.map(function (body, index) {
      var verticalProgress = (body.y - body.radius - firstTop) / verticalSpan;
      return {
        body: body,
        explodeAt: 0.06 + verticalProgress * FAILURE_SWEEP_DURATION + index * 0.008
      };
    });

    mode = "ending";
    readyToDrop = false;
    activePointer = null;
    highestCelebration = null;
    celebrationParticles = [];
    failureBlasts = [];
    failureSequence = {
      age: 0,
      nextIndex: 0,
      queue: queue,
      firstTop: firstTop,
      lastTop: lastTop,
      finishAt: (queue.length > 0 ? queue[queue.length - 1].explodeAt : 0) + FAILURE_SETTLE_DURATION
    };
    updateControls();
  }

  function finishGame() {
    if (mode !== "ending") {
      return;
    }

    mode = "gameover";
    failureSequence = null;
    if (challengeActive) {
      /* 特殊挑战失败：不弹常规结算卡，改走挑战结算（重来 / 继续）；同样记录最高分 */
      challengePhase = "failed";
      updateControls();   /* 结算等待期锁定重开/退出（Erosion 失败有 2.4s 黑化等待） */
      if (challengeKind === "ero") {
        /* Erosion 挑战失败：警戒线/标题栏/画面逐渐黑化 → 弹出失败说明；
         * 记录失败标记 → 特殊挑战菜单第三栏变全黑，点击询问是否重新挑战 */
        if (score > erodeProgress.best) {
          erodeProgress.best = score;
        }
        erodeProgress.failed = true;
        saveErodeProgress();
        saveChallengeProgress();
        try {
          if (document.body && document.body.classList) {
            document.body.classList.add("ero-title-fail");   /* 标题栏文字和框由下往上变黑 */
          }
          if (eroBlackout) {
            eroBlackout.hidden = false;
            eroBlackout.style.opacity = "1";   /* 整个画面逐渐变为黑色（CSS 1.6s） */
          }
        } catch (error) { /* 桩环境忽略 */ }
        scheduleChallengeStep(2400, function () {
          showChallengeResult(false);
          playGameOverSound();
        });
        return;
      }
      if (challengeKind === "pig") {
        if (score > pigProgress.best) {
          pigProgress.best = score;
        }
        savePigProgress();
      } else if (score > challengeBest) {
        challengeBest = score;
      }
      saveChallengeProgress();
      showChallengeResult(false);
      playGameOverSound();
      return;
    }
    var madeRecord = score > bestBeforeGame && score > 0;

    finalScoreElement.textContent = String(score);
    showHighestItem(maxLevelReached);
    /* 失败结算文案（胜利结算走 finishVictoryGame，文案为「合成成功！」） */
    gameOverMessage.textContent = "差一点就更大了";
    newRecordElement.hidden = !madeRecord;
    gameOverOverlay.hidden = false;
    playGameOverSound();
  }

  /* Q1: 胜利结算 —— 合成出目标群友、庆祝动画结束后弹出结算卡 */
  function finishVictoryGame() {
    if (mode !== "playing") {
      return;
    }

    mode = "gameover";
    victorySequence = null;
    var madeRecord = score > bestBeforeGame && score > 0;

    finalScoreElement.textContent = String(score);
    showHighestItem(maxLevelReached);
    gameOverMessage.textContent = "合成成功！";
    newRecordElement.hidden = !madeRecord;
    gameOverOverlay.hidden = false;
    updateControls();
    playVictorySound();
  }

  function limitAimX(value) {
    var radius = LEVELS[currentLevel].radius;
    return clamp(value, LEFT_WALL + radius, RIGHT_WALL - radius);
  }

  function eventToWorldX(event) {
    var rectangle = canvas.getBoundingClientRect();
    if (rectangle.width <= 0) {
      return WORLD_WIDTH / 2;
    }
    return (event.clientX - rectangle.left) * WORLD_WIDTH / rectangle.width;
  }

  function moveAimFromEvent(event) {
    if (mode !== "playing" || !readyToDrop) {
      return;
    }
    aimX = limitAimX(eventToWorldX(event));
  }

  function dropCurrentItem() {
    if (mode !== "playing" || !readyToDrop) {
      return;
    }

    aimX = limitAimX(aimX);
    var dropped = makeItem(currentLevel, aimX, SPAWN_Y, 0, 20, "drop");
    dropped.isPig = spawnIsPig;
    items.push(dropped);
    maxLevelReached = Math.max(maxLevelReached, currentLevel);
    readyToDrop = false;
    dropCooldown = 0.42;
    playDropSound(currentLevel);
    if (eroGameActive) {
      /* 异常局：投放重置静止计时；黑色上蔓延途中 → 向下退回 */
      eroIdleTime = 0;
      if (eroFrontState === "rising") {
        eroFrontState = "retreating";
      }
    }
    if (eroChallengeActive()) {
      /* Erosion 挑战：视野跟随当前释放的小球 */
      eroFocusBody = dropped;
      eroFocusStable = 0;
      eroFocusAge = 0;
    }
  }

  function prepareNextItem() {
    if (pigChallengeActive()) {
      /* 节奏投放：每释放两只群友后才释放一只小猪（群友↔群友↔小猪 循环）；
       * 小猪保持「不超过最大球一半」的抽取上限，
       * 群友可抽到当前合成出的最大小猪等级（随进度解锁更大群友） */
      if (pigSpawnSincePig >= 2) {
        spawnIsPig = true;
        pigSpawnSincePig = 0;
      } else {
        spawnIsPig = false;
        pigSpawnSincePig += 1;
      }
      currentLevel = spawnIsPig ? takeRandomLevel() : takeRandomLevel(true);
    } else {
      spawnIsPig = false;
      currentLevel = takeRandomLevel();
    }
    aimX = limitAimX(aimX);
    readyToDrop = true;
  }

  function getContact(a, b, extra) {
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    var limit = a.radius + b.radius + (extra || 0);
    var distanceSquared = dx * dx + dy * dy;

    if (distanceSquared > limit * limit) {
      return null;
    }

    var distance;
    var nx;
    var ny;
    if (distanceSquared < 0.000001) {
      nx = a.id < b.id ? 1 : -1;
      ny = 0;
      distance = 0.001;
    } else {
      distance = Math.sqrt(distanceSquared);
      nx = dx / distance;
      ny = dy / distance;
    }

    return {
      nx: nx,
      ny: ny,
      penetration: a.radius + b.radius - distance
    };
  }

  function projectBoundary(body, nx, ny, penetration, grounded) {
    body.x += nx * penetration;
    body.y += ny * penetration;

    var normalVelocity = body.vx * nx + body.vy * ny;
    if (normalVelocity < 0) {
      var restitution = -normalVelocity < 70 ? 0 : WALL_RESTITUTION;
      body.vx -= (1 + restitution) * normalVelocity * nx;
      body.vy -= (1 + restitution) * normalVelocity * ny;
    }

    if (ny < 0) {
      grounded.add(body.id);
    }
  }

  function solveBounds(body, grounded) {
    var penetration;

    if (body.x - body.radius < LEFT_WALL) {
      penetration = LEFT_WALL - (body.x - body.radius);
      projectBoundary(body, 1, 0, penetration, grounded);
    }
    if (body.x + body.radius > RIGHT_WALL) {
      penetration = body.x + body.radius - RIGHT_WALL;
      projectBoundary(body, -1, 0, penetration, grounded);
    }
    if (body.y + body.radius > FLOOR) {
      penetration = body.y + body.radius - FLOOR;
      projectBoundary(body, 0, -1, penetration, grounded);
    }
  }

  function solveCircleCollision(a, b, contact) {
    if (!contact || contact.penetration <= 0) {
      return;
    }

    var inverseMassSum = a.invMass + b.invMass;
    /* slop 0.12→0.05、松弛 0.72→0.85：重压堆叠（某球正上方压着大量小球）时，
     * 残余穿透不再累积到肉眼可见的程度 */
    var correctionDepth = Math.max(contact.penetration - 0.05, 0);
    var correction = correctionDepth * 0.85 / inverseMassSum;

    a.x -= contact.nx * correction * a.invMass;
    a.y -= contact.ny * correction * a.invMass;
    b.x += contact.nx * correction * b.invMass;
    b.y += contact.ny * correction * b.invMass;

    var relativeX = b.vx - a.vx;
    var relativeY = b.vy - a.vy;
    var normalSpeed = relativeX * contact.nx + relativeY * contact.ny;
    if (normalSpeed >= 0) {
      return;
    }

    var restitution = -normalSpeed < 70 ? 0 : CIRCLE_RESTITUTION;
    var impulse = -(1 + restitution) * normalSpeed / inverseMassSum;
    var impulseX = contact.nx * impulse;
    var impulseY = contact.ny * impulse;

    a.vx -= impulseX * a.invMass;
    a.vy -= impulseY * a.invMass;
    b.vx += impulseX * b.invMass;
    b.vy += impulseY * b.invMass;

    relativeX = b.vx - a.vx;
    relativeY = b.vy - a.vy;
    var tangentX = relativeX - (relativeX * contact.nx + relativeY * contact.ny) * contact.nx;
    var tangentY = relativeY - (relativeX * contact.nx + relativeY * contact.ny) * contact.ny;
    var tangentLength = Math.hypot(tangentX, tangentY);

    if (tangentLength > 0.000001) {
      tangentX /= tangentLength;
      tangentY /= tangentLength;
      var frictionImpulse = -(relativeX * tangentX + relativeY * tangentY) / inverseMassSum;
      var frictionLimit = FRICTION * Math.abs(impulse);
      frictionImpulse = clamp(frictionImpulse, -frictionLimit, frictionLimit);

      a.vx -= tangentX * frictionImpulse * a.invMass;
      a.vy -= tangentY * frictionImpulse * a.invMass;
      b.vx += tangentX * frictionImpulse * b.invMass;
      b.vy += tangentY * frictionImpulse * b.invMass;
    }
  }

  function collectMergeCandidate(a, b, candidates, contact) {
    if (a.level !== b.level) {
      return;
    }
    if (a.level === LEVELS.length - 1) {
      return;
    }
    /* 小猪挑战：群友+群友、小猪+小猪不能合成，仅群友+同级小猪 → 更大的小猪 */
    if (pigChallengeActive() && a.isPig === b.isPig) {
      return;
    }

    contact = contact || getContact(a, b, 0.12);
    if (!contact) {
      return;
    }

    var firstId = Math.min(a.id, b.id);
    var secondId = Math.max(a.id, b.id);
    var key = firstId + ":" + secondId;
    var depth = contact.penetration;
    var existing = candidates.get(key);

    if (!existing || depth > existing.depth) {
      candidates.set(key, {
        firstId: firstId,
        secondId: secondId,
        depth: depth
      });
    }
  }

  function addMergeScore(level, x, y) {
    var points = LEVELS[level].score;
    var previousScore = score;
    score = Math.min(MAX_SCORE, score + points);
    var awardedPoints = score - previousScore;

    if (score > bestScore) {
      bestScore = score;
      saveBestScore();
    }

    floaters.push({
      x: x,
      y: y,
      text: "+" + awardedPoints,
      life: 0.72,
      maxLife: 0.72
    });
    updateScoreDisplay(true);
  }

  function addBurst(x, y, color, level) {
    if (prefersReducedMotion()) {
      return;
    }
    var count = Math.min(7 + level, 15);
    for (var i = 0; i < count; i += 1) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 45 + Math.random() * (75 + level * 7);
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 28,
        radius: 2 + Math.random() * 3.5,
        color: color,
        life: 0.42 + Math.random() * 0.25,
        maxLife: 0.67
      });
    }

    if (particles.length > 180) {
      particles.splice(0, particles.length - 180);
    }
  }

  function addCelebrationBurst(x, y, count, minimumSpeed, speedRange, palette, ribbon) {
    var colors = palette || CELEBRATION_COLORS;
    for (var i = 0; i < count; i += 1) {
      var angle = Math.PI * 2 * i / count + (Math.random() - 0.5) * 0.16;
      var speed = minimumSpeed + Math.random() * speedRange;
      var life = 1.35 + Math.random() * 0.95;
      celebrationParticles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 90,
        gravity: ribbon ? 140 + Math.random() * 120 : 220 + Math.random() * 150,
        width: ribbon ? 7 + Math.random() * 7 : 4 + Math.random() * 6,
        height: ribbon ? 16 + Math.random() * 18 : 8 + Math.random() * 13,
        rotation: Math.random() * Math.PI,
        spin: ribbon ? (Math.random() - 0.5) * 8 : (Math.random() - 0.5) * 12,
        shape: ribbon ? 0 : i % 3,
        color: colors[i % colors.length],
        life: life,
        maxLife: life
      });
    }
  }

  /* 达成目标的庆祝（Q1：合成出目标群友时触发，也是全游戏唯一的全屏庆祝） */
  function startHighestCelebration(body, palette) {
    var reduced = prefersReducedMotion();
    highestCelebration = {
      bodyId: body.id,
      x: body.x,
      y: body.y,
      age: 0,
      duration: reduced ? 0.7 : HIGHEST_CELEBRATION_DURATION,
      burstIndex: 0,
      reduced: reduced,
      palette: palette || null   /* 模板默认彩带色；小猪解锁演出传入粉系配色 */
    };
    celebrationParticles = [];
    playHighestCelebrationSound();

    if (reduced) {
      return;
    }

    shake = Math.max(shake, 16);
    addCelebrationBurst(body.x, body.y, 108, 180, 330, highestCelebration.palette);
  }

  function applyMerges(candidates) {
    if (candidates.size === 0) {
      return;
    }

    var orderedCandidates = Array.from(candidates.values());
    orderedCandidates.sort(function (a, b) {
      return b.depth - a.depth || a.firstId - b.firstId || a.secondId - b.secondId;
    });

    var byId = new Map();
    var consumed = new Set();
    var created = [];

    items.forEach(function (body) {
      byId.set(body.id, body);
    });

    orderedCandidates.forEach(function (candidate) {
      var a = byId.get(candidate.firstId);
      var b = byId.get(candidate.secondId);
      if (!a || !b || consumed.has(a.id) || consumed.has(b.id) || a.level !== b.level) {
        return;
      }

      consumed.add(a.id);
      consumed.add(b.id);

      var totalMass = a.mass + b.mass;
      var x = (a.x * a.mass + b.x * b.mass) / totalMass;
      var y = (a.y * a.mass + b.y * b.mass) / totalMass;
      var vx = (a.vx * a.mass + b.vx * b.mass) / totalMass;
      var vy = (a.vy * a.mass + b.vy * b.mass) / totalMass;
      var newLevel = a.level + 1;
      /* 特殊挑战：被禁言小球所在等级被跳过，其余等级（及其半径）不变 */
      if (challengeActive && newLevel === challengeSkipLevel) {
        newLevel += 1;
      }

      addMergeScore(newLevel, x, y);
      addBurst(x, y, LEVELS[a.level].color, a.level);
      playMergeSound(newLevel);
      if (!prefersReducedMotion()) {
        shake = Math.max(shake, Math.min(1.5 + newLevel * 0.42, 5.5));
      }

      var radius = LEVELS[newLevel].radius;
      x = clamp(x, LEFT_WALL + radius, RIGHT_WALL - radius);
      y = Math.min(y, FLOOR - radius);
      var mergedBody = makeItem(newLevel, x, y, vx, vy, "merge");
      if (pigChallengeActive()) {
        mergedBody.isPig = true;   /* 群友+小猪 → 合成出的一定是更大的小猪 */
      } else if (LEVELS[newLevel] && LEVELS[newLevel].key === "PIG_UNLOCK") {
        mergedBody.isPig = true;   /* 解锁对局的唱片猪：圆形裁剪铺满显示 */
      }
      created.push(mergedBody);
      if (eroChallengeActive() && (a === eroFocusBody || b === eroFocusBody)) {
        /* Q8: 亮着的小球参与合成 → 新合成的小球变亮，视野继续跟随，直至小球堆趋于稳定 */
        eroFocusBody = mergedBody;
        eroFocusAge = 0;
        eroFocusStable = 0;
      }
      /* Q1: 达成目标——合成出目标群友的球：两行横幅 + 庆祝，
       * 并锁定投放、启动胜利计时，庆祝结束后弹出结算卡结束本局 */
      if (LEVELS[newLevel] && LEVELS[newLevel].key === targetCollegeKey) {
        if (!targetAchieved) {
          if (pigUnlockActive) {
            /* Q7: 解锁流程——合成出唱片猪 → 其余球爆炸 → 小猪居中 + 挑战名 → 规则 → 开始挑战 */
            startPigUnlockCinematic(mergedBody);
          } else if (challengeActive) {
            /* 特殊挑战：合成出秘密目标 → 挑战成功（礼花 + 结算面板，不走常规胜利结算） */
            challengeSuccess(mergedBody);
          } else {
            targetAchieved = true;
            readyToDrop = false;
            if (eroGameActive && eroAnomalyKey) {
              /* Q8: 直接完成异常群友的合成 → 该群友选择卡异常消失（本局也不累计新异常） */
              var eroIndex = erodeProgress.anomalies.indexOf(eroAnomalyKey);
              if (eroIndex >= 0) {
                erodeProgress.anomalies.splice(eroIndex, 1);
                saveErodeProgress();
              }
            }
            var goalCollege = collegeByKey(targetCollegeKey);
            if (goalCollege) {
              showTargetBanner(goalCollege, "achieve");
              startHighestCelebration(mergedBody);
            }
            /* Q4: 只有合成目标才入鉴——胜利一次记一位（跨局累计） */
            markSynthesized(targetCollegeKey);
            victorySequence = {
              age: 0,
              duration: prefersReducedMotion() ? 0.8 : HIGHEST_CELEBRATION_DURATION
            };
          }
        }
      }
      /* 出生分离：新球半径比原两球大，生成瞬间会把重叠邻居沿法线温和推开
       * （只调位置不动速度），把大部分生成重叠就地消解，避免后续多帧挤开引发抖动 */
      items.forEach(function (neighbour) {
        if (neighbour === mergedBody || consumed.has(neighbour.id)) {
          return;
        }
        var dnx = neighbour.x - mergedBody.x;
        var dny = neighbour.y - mergedBody.y;
        var overlap = mergedBody.radius + neighbour.radius - Math.hypot(dnx, dny);
        if (overlap <= 0) {
          return;
        }
        var distance = Math.hypot(dnx, dny);
        var nx;
        var ny;
        if (distance < 0.001) {
          nx = 1;
          ny = 0;
        } else {
          nx = dnx / distance;
          ny = dny / distance;
        }
        var push = overlap * 0.8;
        var neighbourShare = neighbour.invMass / (mergedBody.invMass + neighbour.invMass);
        neighbour.x += nx * push * neighbourShare;
        neighbour.y += ny * push * neighbourShare;
      });
      maxLevelReached = Math.max(maxLevelReached, newLevel);
      if (eroGameActive && newLevel === 10 && !eroArmed) {
        /* Q8 异常局：合成出 10 级球 → 黑色蔓延机制解锁；
         * 先来一段「上升一点 → 突然落回」的试探演出，落定后才开始无操作计时 */
        eroArmed = true;
        eroIdleTime = 0;
        eroFront = 0;
        eroFrontState = "idle";
        eroTeaseAge = 0;
      }
      highestMergedLevel = Math.max(highestMergedLevel, newLevel);
    });

    if (consumed.size > 0) {
      items = items.filter(function (body) {
        return !consumed.has(body.id);
      });
      Array.prototype.push.apply(items, created);
    }
  }

  function triggerFailureBlast(body) {
    var color = LEVELS[body.level].color;
    failureBlasts.push({
      x: body.x,
      y: body.y,
      radius: body.radius,
      level: body.level,
      color: color,
      age: 0,
      duration: 0.4 + Math.min(body.radius / 800, 0.12)
    });
    if (failureBlasts.length > 12) {
      failureBlasts.splice(0, failureBlasts.length - 12);
    }

    if (!prefersReducedMotion()) {
      var sparkCount = Math.min(10 + body.level, 20);
      for (var i = 0; i < sparkCount; i += 1) {
        var angle = Math.PI * 2 * i / sparkCount + Math.random() * 0.18;
        var speed = 105 + Math.random() * (135 + body.radius * 1.2);
        var life = 0.42 + Math.random() * 0.38;
        particles.push({
          x: body.x,
          y: body.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 35,
          radius: 2 + Math.random() * 2.7,
          color: i % 4 === 0 ? "#ffffff" : color,
          life: life,
          maxLife: life
        });
      }
      if (particles.length > 150) {
        particles.splice(0, particles.length - 150);
      }
    }

    shake = Math.max(shake, Math.min(3.5 + body.radius * 0.038, 7));
  }

  function updateFailureExplosion(dt) {
    if (!failureSequence) {
      return;
    }

    failureSequence.age += dt;
    var explodedIds = new Set();
    var soundLevel = -1;

    while (
      failureSequence.nextIndex < failureSequence.queue.length &&
      failureSequence.age >= failureSequence.queue[failureSequence.nextIndex].explodeAt
    ) {
      var entry = failureSequence.queue[failureSequence.nextIndex];
      triggerFailureBlast(entry.body);
      explodedIds.add(entry.body.id);
      soundLevel = Math.max(soundLevel, entry.body.level);
      failureSequence.nextIndex += 1;
    }

    if (explodedIds.size > 0) {
      items = items.filter(function (body) {
        return !explodedIds.has(body.id);
      });
      playFailureExplosionSound(soundLevel);
    }

    if (failureSequence.age >= failureSequence.finishAt) {
      finishGame();
    }
  }

  function updateEffects(dt) {
    for (var i = particles.length - 1; i >= 0; i -= 1) {
      var particle = particles[i];
      particle.life -= dt;
      if (particle.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      particle.vy += 280 * dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
    }

    for (var j = floaters.length - 1; j >= 0; j -= 1) {
      var floater = floaters[j];
      floater.life -= dt;
      floater.y -= 34 * dt;
      if (floater.life <= 0) {
        floaters.splice(j, 1);
      }
    }

    if (highestCelebration) {
      for (var celebrationBodyIndex = 0; celebrationBodyIndex < items.length; celebrationBodyIndex += 1) {
        if (items[celebrationBodyIndex].id === highestCelebration.bodyId) {
          highestCelebration.x = items[celebrationBodyIndex].x;
          highestCelebration.y = items[celebrationBodyIndex].y;
          break;
        }
      }
      highestCelebration.age += dt;
      while (
        highestCelebration.burstIndex < CELEBRATION_BURST_TIMES.length &&
        highestCelebration.age >= CELEBRATION_BURST_TIMES[highestCelebration.burstIndex]
      ) {
        var burstIndex = highestCelebration.burstIndex;
        var burstAngle = -2.35 + burstIndex * 1.72;
        var burstDistance = 115 + burstIndex % 2 * 42;
        var burstX = clamp(highestCelebration.x + Math.cos(burstAngle) * burstDistance, 42, WORLD_WIDTH - 42);
        var burstY = clamp(highestCelebration.y + Math.sin(burstAngle) * burstDistance, 72, WORLD_HEIGHT - 62);
        addCelebrationBurst(burstX, burstY, 36, 125, 235, highestCelebration.palette);
        shake = Math.max(shake, 8.5);
        highestCelebration.burstIndex += 1;
      }
      if (highestCelebration.age >= highestCelebration.duration) {
        highestCelebration = null;
      }
    }

    if (pigFly && pigFly.body) {
      /* 解锁演出③：小猪缓缓平移到正中间，平移过程中缓慢变大；到位后背景淡出 */
      pigFly.age += dt;
      var flyT = clamp(pigFly.age / pigFly.duration, 0, 1);
      var flyEase = flyT * flyT * (3 - 2 * flyT);   /* smoothstep：缓入缓出 */
      pigFly.body.x = pigFly.fromX + (pigFly.toX - pigFly.fromX) * flyEase;
      pigFly.body.y = pigFly.fromY + (pigFly.toY - pigFly.fromY) * flyEase;
      pigFly.body.radius = pigFly.fromRadius + (pigFly.toRadius - pigFly.fromRadius) * flyEase;
      if (!pigFly.fading && flyT >= 1 && !pigFly.whiteout) {
        pigFly.whiteout = true;
        try {
          if (boardWhiteout) {
            boardWhiteout.hidden = false;
            boardWhiteout.style.opacity = "1";   /* 背景淡出直至消失（CSS 1.4s 过渡） */
          }
        } catch (error) { /* 桩环境忽略 */ }
      }
      if (pigFly.fading) {
        pigFly.fadeAge += dt;
        if (pigFly.fadeAge >= 0.8) {
          pigFly = null;   /* 画布小猪淡出完毕，由挑战名方框内的动图接管 */
        }
      }
    }

    for (var k = celebrationParticles.length - 1; k >= 0; k -= 1) {
      var celebrationParticle = celebrationParticles[k];
      celebrationParticle.life -= dt;
      if (celebrationParticle.life <= 0) {
        celebrationParticles.splice(k, 1);
        continue;
      }
      celebrationParticle.vy += celebrationParticle.gravity * dt;
      celebrationParticle.vx *= Math.pow(0.985, dt * 60);
      celebrationParticle.x += celebrationParticle.vx * dt;
      celebrationParticle.y += celebrationParticle.vy * dt;
      celebrationParticle.rotation += celebrationParticle.spin * dt;
    }

    for (var blastIndex = failureBlasts.length - 1; blastIndex >= 0; blastIndex -= 1) {
      failureBlasts[blastIndex].age += dt;
      if (failureBlasts[blastIndex].age >= failureBlasts[blastIndex].duration) {
        failureBlasts.splice(blastIndex, 1);
      }
    }
  }

  function updateDanger(dt) {
    dangerIsNear = false;
    dangerIsCrossed = false;
    items.forEach(function (body) {
      if (body.age < body.dangerGrace) {
        return;
      }
      var itemTop = body.y - body.radius;
      if (itemTop <= DANGER_LINE + DANGER_PROXIMITY) {
        dangerIsNear = true;
      }
      if (itemTop < DANGER_LINE) {
        dangerIsCrossed = true;
      }
    });

    if (dangerIsCrossed) {
      dangerTimer += dt;
    } else {
      dangerTimer = Math.max(0, dangerTimer - dt * 2.8);
    }

    /* Q1: 已达成目标（庆祝/挑战成功期间）不再触发失败爆炸，胜利必胜 */
    if (dangerTimer >= DANGER_DELAY && !victorySequence && !targetAchieved) {
      startFailureExplosion();
    }
  }

  function physicsStep(dt) {
    if (mode === "ending") {
      updateFailureExplosion(dt);
      updateEffects(dt);
      return;
    }
    if (mode !== "playing") {
      return;
    }

    if (!readyToDrop) {
      dropCooldown -= dt;
      /* Q1: 目标达成后不再补充新球，等待胜利结算 */
      if (dropCooldown <= 0 && !targetAchieved) {
        prepareNextItem();
      }
    }

    if (eroGameActive && !eroUnlocking) {
      /* Q8 异常局：合成出 10 级球 → 黑色先上升一点随即突然落回（试探演出），
       * 落定后静止 3 秒 → 黑色上蔓延；到达棋盘顶 → 进入解锁挑战；
       * 蔓延途中投放 → 退回底部（投放时已切换状态） */
      if (eroTeaseAge >= 0) {
        eroTeaseAge += dt;
        if (eroTeaseAge < ERO_TEASE_RISE) {
          eroFront = ERO_TEASE_PEAK * (eroTeaseAge / ERO_TEASE_RISE);          /* 先上升一点 */
        } else if (eroTeaseAge < ERO_TEASE_RISE + ERO_TEASE_DROP) {
          eroFront = Math.max(0, ERO_TEASE_PEAK
            * (1 - (eroTeaseAge - ERO_TEASE_RISE) / ERO_TEASE_DROP));          /* 随即突然下降 */
        } else {
          eroFront = 0;
          eroTeaseAge = -1;
          eroIdleTime = 0;   /* 落定后才开始 3 秒无操作计时 */
        }
      } else if (eroFrontState === "rising") {
        eroFront = Math.min(1.06, eroFront + dt / ERO_RISE_DURATION);
        if (eroFront >= 1) {
          triggerEroUnlock();
        }
      } else if (eroFrontState === "retreating") {
        eroFront = Math.max(0, eroFront - dt / ERO_RETREAT_DURATION);
        if (eroFront <= 0) {
          eroFrontState = "idle";
          eroIdleTime = 0;
        }
      } else if (eroArmed) {
        eroIdleTime += dt;
        if (eroIdleTime >= ERO_IDLE_TRIGGER) {
          eroFrontState = "rising";
        }
      }
    }
    if (eroChallengeActive() && challengePhase === "playing" && eroFocusBody) {
      /* 视野跟随当前亮着的小球：小球堆趋于稳定（速度趋零片刻）或超过单球跟随上限 →
       * 当前球变暗，下一个待释放小球立即点亮（中间无停顿）；
       * 期间小球参与合成 → 新合成的小球变亮并重新计时 */
      var eroSpeed = Math.hypot(eroFocusBody.vx, eroFocusBody.vy);
      if (eroSpeed < 6) {
        eroFocusStable += dt;
      } else {
        eroFocusStable = 0;
      }
      eroFocusAge += dt;
      if (eroFocusStable >= 0.45 || eroFocusAge >= ERO_FOCUS_MAX_AGE) {
        eroFocusBody = null;
        eroFocusStable = 0;
        eroFocusAge = 0;
      }
    }
    if (eroReveal) {
      eroReveal.age += dt;
    }

    var damping = Math.pow(AIR_DAMPING, dt * 60);
    items.forEach(function (body) {
      body.age += dt;
      body.popTime = Math.max(0, body.popTime - dt);
      body.vy += GRAVITY * dt;
      body.vx *= damping;

      var speed = Math.hypot(body.vx, body.vy);
      if (speed > MAX_SPEED) {
        var factor = MAX_SPEED / speed;
        body.vx *= factor;
        body.vy *= factor;
      }

      body.x += body.vx * dt;
      body.y += body.vy * dt;
    });

    var candidates = new Map();
    var grounded = new Set();
    /* 优化：底部球先求解（y 降序），堆叠链自下而上收敛，减少层间穿透与抖动 */
    var ordered = items.slice().sort(function (p, q) { return q.y - p.y; });

    for (var iteration = 0; iteration < SOLVER_ITERATIONS; iteration += 1) {
      items.forEach(function (body) {
        solveBounds(body, grounded);
      });

      /* 优化：x 投影分离的两圆必不重叠（充分条件），跳过精确检测。
       * 与全对求解数学等价、零漏检，只省掉 sqrt 与接触对象分配。 */
      for (var i = 0; i < ordered.length; i += 1) {
        var a = ordered[i];
        for (var j = i + 1; j < ordered.length; j += 1) {
          var b = ordered[j];
          var dxSorted = b.x - a.x;
          var reach = a.radius + b.radius;
          if (dxSorted > reach || -dxSorted > reach) {
            continue;
          }
          var contact = getContact(a, b, 0);
          if (!pigBlastActive) {
            collectMergeCandidate(a, b, candidates, contact);   /* 解锁爆炸期间不合成 */
          }
          solveCircleCollision(a, b, contact);
        }
      }

      items.forEach(function (body) {
        solveBounds(body, grounded);
      });
    }

    /* 最终去穿透清扫：极端堆叠下（某球正上方压着大量小球，各接触点修正互相抵消）
     * 仍可能残留 >0.5 的可见重叠；这里做最多 4 轮纯位置修正（不留 slop、不含冲量），
     * 把残余重叠彻底推开。常规堆叠残差 <0.5 时整段跳过，不影响静止堆的稳定。 */
    for (var sweep = 0; sweep < 4; sweep += 1) {
      var deepestPenetration = 0;
      for (var pi = 0; pi < ordered.length; pi += 1) {
        var pairA = ordered[pi];
        for (var qi = pi + 1; qi < ordered.length; qi += 1) {
          var pairB = ordered[qi];
          var sweepDx = pairB.x - pairA.x;
          var sweepReach = pairA.radius + pairB.radius;
          if (sweepDx > sweepReach || -sweepDx > sweepReach) {
            continue;
          }
          var sweepDistSq = sweepDx * sweepDx + (pairB.y - pairA.y) * (pairB.y - pairA.y);
          if (sweepDistSq >= sweepReach * sweepReach) {
            continue;
          }
          var sweepDist = Math.sqrt(sweepDistSq) || 0.001;
          var sweepPen = sweepReach - sweepDist;
          if (sweepPen <= 0.5) {
            continue;
          }
          if (sweepPen > deepestPenetration) {
            deepestPenetration = sweepPen;
          }
          var sweepNx = sweepDx / sweepDist;
          var sweepNy = (pairB.y - pairA.y) / sweepDist;
          var sweepInvSum = pairA.invMass + pairB.invMass;
          var sweepPush = sweepPen / sweepInvSum;
          pairA.x -= sweepNx * sweepPush * pairA.invMass;
          pairA.y -= sweepNy * sweepPush * pairA.invMass;
          pairB.x += sweepNx * sweepPush * pairB.invMass;
          pairB.y += sweepNy * sweepPush * pairB.invMass;
        }
      }
      items.forEach(function (body) {
        solveBounds(body, grounded);
      });
      if (deepestPenetration === 0) {
        break;
      }
    }

    if (!pigBlastActive) {
      for (var first = 0; first < items.length; first += 1) {
        for (var second = first + 1; second < items.length; second += 1) {
          collectMergeCandidate(items[first], items[second], candidates);
        }
      }
    }

    var groundFactor = Math.exp(-GROUND_DRAG * dt);
    items.forEach(function (body) {
      if (grounded.has(body.id)) {
        body.vx *= groundFactor;
        if (Math.abs(body.vy) < 9) {
          body.vy = 0;
        }
      }
    });

    applyMerges(candidates);
    updateEffects(dt);
    updateDanger(dt);

    /* Q1: 胜利计时 —— 庆祝动画播完后弹出结算卡，结束本局 */
    if (victorySequence) {
      victorySequence.age += dt;
      if (victorySequence.age >= victorySequence.duration) {
        finishVictoryGame();
      }
    }
  }

  function drawDangerLine(now) {
    var pulse = (Math.sin(now / 90) + 1) / 2;
    /* Q8: Erosion 挑战警戒线为白色 */
    var eroLine = eroChallengeActive();
    var crossGlow = eroLine ? "rgba(240, 244, 248, 0.9)" : "rgba(220, 63, 76, 0.88)";
    var crossSoft = eroLine ? "rgba(240, 244, 248, " : "rgba(220, 63, 76, ";
    var crossCore = eroLine ? "rgba(255, 255, 255, " : "rgba(220, 63, 76, ";
    var nearColor = eroLine ? "rgba(240, 244, 248, 0.7)" : "rgba(220, 63, 76, 0.62)";
    var idleColor = eroLine ? "rgba(240, 244, 248, 0.62)" : "rgba(174, 159, 140, 0.55)";
    ctx.save();
    ctx.lineCap = "round";
    ctx.setLineDash(dangerIsCrossed ? [10, 4] : [7, 7]);
    ctx.lineDashOffset = dangerIsCrossed ? -(now / 24) % 14 : 0;
    ctx.beginPath();
    ctx.moveTo(LEFT_WALL + 10, DANGER_LINE);
    ctx.lineTo(RIGHT_WALL - 10, DANGER_LINE);

    if (dangerIsCrossed) {
      ctx.shadowColor = crossGlow;
      ctx.shadowBlur = 12 + pulse * 8;
      ctx.lineWidth = 9 + pulse * 4;
      ctx.strokeStyle = crossSoft + (0.16 + pulse * 0.14) + ")";
      ctx.stroke();

      ctx.shadowBlur = 5 + pulse * 5;
      ctx.lineWidth = 3.4 + pulse * 1.4;
      ctx.strokeStyle = crossCore + (0.84 + pulse * 0.16) + ")";
      ctx.stroke();
    } else {
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = dangerIsNear ? nearColor : idleColor;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawAimGuide() {
    if (mode !== "playing" || !readyToDrop) {
      return;
    }

    var radius = LEVELS[currentLevel].radius;
    ctx.save();
    ctx.strokeStyle = "rgba(111, 85, 198, 0.26)";
    ctx.lineWidth = 1.4;
    ctx.setLineDash([4, 8]);
    ctx.beginPath();
    ctx.moveTo(aimX, SPAWN_Y + radius + 7);
    ctx.lineTo(aimX, FLOOR - 8);
    ctx.stroke();
    ctx.restore();
  }

  function drawLevelImage(levelIndex, radius, imageOverride, circularCover) {
    var image = imageOverride || LEVEL_ASSETS[levelIndex];
    if (!image || !image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0) {
      return;
    }

    var level = LEVELS[levelIndex];
    var box = radius * 2 * (level && level.scale ? level.scale : 1);
    var offsetY = (level && level.offsetY ? level.offsetY : 0) * box;
    /* 小猪照片/动图为方形原图：圆形 clip + 铺满裁剪（cover），与群友圆形徽章形状一致 */
    if (circularCover) {
      var coverScale = Math.max(box / image.naturalWidth, box / image.naturalHeight);
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        image,
        -image.naturalWidth * coverScale / 2,
        -image.naturalHeight * coverScale / 2 + offsetY,
        image.naturalWidth * coverScale,
        image.naturalHeight * coverScale
      );
      ctx.restore();
      return;
    }
    var fitScale = Math.min(box / image.naturalWidth, box / image.naturalHeight);
    var width = image.naturalWidth * fitScale;
    var height = image.naturalHeight * fitScale;

    ctx.drawImage(image, -width / 2, -height / 2 + offsetY, width, height);
  }

  function drawItemBackground(radius) {
    var angle = 120 * Math.PI / 180;
    var reach = radius * Math.SQRT2;
    var dx = Math.sin(angle) * reach;
    var dy = -Math.cos(angle) * reach;
    var gradient = ctx.createLinearGradient(-dx, -dy, dx, dy);
    gradient.addColorStop(0, "#fdfbfb");
    gradient.addColorStop(1, "#ebedee");
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  function drawItem(body, alpha, preview) {
    var radius = body.radius;
    var scale = 1;
    if (body.popTime > 0) {
      var progress = 1 - body.popTime / 0.18;
      scale = 1 + Math.sin(progress * Math.PI) * 0.13;
    }
    if (highestCelebration && body.id === highestCelebration.bodyId && !highestCelebration.reduced) {
      var celebrationProgress = clamp(highestCelebration.age / highestCelebration.duration, 0, 1);
      var iconPopProgress = clamp(celebrationProgress / 0.3, 0, 1);
      scale *= 1 + Math.sin(iconPopProgress * Math.PI) * 0.52 * (1 - iconPopProgress * 0.28);
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(body.x, body.y);
    ctx.scale(scale, scale);

    if (!preview) {
      ctx.shadowColor = "rgba(54, 45, 35, 0.16)";
      ctx.shadowBlur = 5;
      ctx.shadowOffsetY = 2;
    }

    if (body === pigGlowBody) {
      /* 解锁演出①：金色脉冲光晕（四周闪光） */
      var pulse = 0.5 + 0.5 * Math.sin(Date.now() / 120);
      ctx.save();
      ctx.shadowColor = "rgba(255, 202, 58, 0.95)";
      ctx.shadowBlur = radius * (1.1 + 1.1 * pulse);
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 213, 79, 0.5)";
      ctx.fill();
      ctx.restore();
    }
    drawItemBackground(radius);
    ctx.shadowColor = "transparent";
    var pigImage = null;
    if (body.isPig) {
      pigImage = pigAssetFor(body.level);                 /* 小猪球：方形原图圆形裁剪铺满 */
    } else if (pigChallengeActive()) {
      pigImage = pigMemberAssetFor(body.level);           /* 群友球：显示真实群友圆形徽章 */
    }
    drawLevelImage(body.level, radius, pigImage, !!body.isPig);
    if (body.isPig) {
      /* 小猪球加黑色圆形描边，与群友徽章的黑色圆边一致 */
      ctx.beginPath();
      ctx.arc(0, 0, radius - Math.max(1.5, radius * 0.03), 0, Math.PI * 2);
      ctx.lineWidth = Math.max(2, radius * 0.055);
      ctx.strokeStyle = "#101418";
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawFailureSweep() {
    if (!failureSequence || failureSequence.queue.length === 0) {
      return;
    }

    var progress = clamp((failureSequence.age - 0.06) / FAILURE_SWEEP_DURATION, 0, 1);
    var sweepY = failureSequence.firstTop + (failureSequence.lastTop - failureSequence.firstTop) * progress;
    var sweepFade = 1 - clamp((failureSequence.age - 0.06 - FAILURE_SWEEP_DURATION) / 0.28, 0, 1);
    var band = ctx.createLinearGradient(0, sweepY - 38, 0, sweepY + 38);
    band.addColorStop(0, "rgba(255, 102, 122, 0)");
    band.addColorStop(0.38, "rgba(255, 93, 126, 0.12)");
    band.addColorStop(0.5, "rgba(255, 245, 176, 0.42)");
    band.addColorStop(0.62, "rgba(255, 143, 91, 0.18)");
    band.addColorStop(1, "rgba(255, 143, 91, 0)");

    ctx.save();
    ctx.globalAlpha = sweepFade;
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = band;
    ctx.fillRect(LEFT_WALL, sweepY - 38, RIGHT_WALL - LEFT_WALL, 76);
    ctx.restore();
  }

  function drawFailureBlasts() {
    var reduced = prefersReducedMotion();

    failureBlasts.forEach(function (blast) {
      var progress = clamp(blast.age / blast.duration, 0, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var alpha = Math.pow(1 - progress, 0.72);
      var glowRadius = blast.radius * (0.9 + eased * 1.75);

      ctx.save();
      ctx.translate(blast.x, blast.y);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = alpha * 0.44;
      ctx.fillStyle = progress < 0.45 ? "#fff4bd" : blast.color;
      ctx.beginPath();
      ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = alpha * 0.9;
      ctx.strokeStyle = "#fff3a5";
      ctx.lineWidth = Math.max(2.5, blast.radius * 0.085 * (1 - progress));
      ctx.beginPath();
      ctx.arc(0, 0, blast.radius * (0.82 + eased * 1.85), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = alpha * 0.55;
      ctx.strokeStyle = blast.color;
      ctx.lineWidth = Math.max(1.8, blast.radius * 0.045);
      ctx.beginPath();
      ctx.arc(0, 0, blast.radius * (0.65 + eased * 1.25), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(blast.x, blast.y);
      if (reduced) {
        ctx.globalAlpha = alpha;
        ctx.scale(1 + eased * 0.18, 1 + eased * 0.18);
        drawItemBackground(blast.radius);
        drawLevelImage(blast.level, blast.radius);
      } else {
        var shardCount = 4;
        for (var shard = 0; shard < shardCount; shard += 1) {
          var startAngle = Math.PI * 2 * shard / shardCount - 0.06;
          var endAngle = Math.PI * 2 * (shard + 1) / shardCount + 0.06;
          var middleAngle = (startAngle + endAngle) / 2;
          var shardDistance = eased * blast.radius * (0.62 + shard % 2 * 0.2);
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, blast.radius * 1.12, startAngle, endAngle);
          ctx.closePath();
          ctx.clip();
          ctx.translate(Math.cos(middleAngle) * shardDistance, Math.sin(middleAngle) * shardDistance);
          ctx.rotate((shard % 2 === 0 ? 1 : -1) * eased * (0.18 + shard * 0.012));
          ctx.globalAlpha = alpha;
          drawItemBackground(blast.radius);
          drawLevelImage(blast.level, blast.radius);
          ctx.restore();
        }
      }
      ctx.restore();
    });
  }

  function drawParticles() {
    ctx.save();
    particles.forEach(function (particle) {
      ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    floaters.forEach(function (floater) {
      ctx.save();
      ctx.globalAlpha = clamp(floater.life / floater.maxLife, 0, 1);
      ctx.fillStyle = "#4e3c88";
      ctx.font = "800 16px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(floater.text, floater.x, floater.y);
      ctx.restore();
    });
  }

  function drawHighestCelebrationBackdrop() {
    if (!highestCelebration) {
      return;
    }

    var age = highestCelebration.age;
    var progress = clamp(age / highestCelebration.duration, 0, 1);
    var expansion = 1 - Math.pow(1 - progress, 3);
    var fade = 1 - clamp((progress - 0.66) / 0.34, 0, 1);
    var glowRadius = 95 + expansion * 285;

    ctx.save();
    var vignette = ctx.createRadialGradient(
      highestCelebration.x,
      highestCelebration.y,
      42,
      highestCelebration.x,
      highestCelebration.y,
      430
    );
    vignette.addColorStop(0, "rgba(63, 32, 123, 0)");
    vignette.addColorStop(0.5, "rgba(63, 32, 123, " + (0.12 * fade) + ")");
    vignette.addColorStop(1, "rgba(37, 17, 88, " + (0.38 * fade) + ")");
    ctx.fillStyle = vignette;
    ctx.fillRect(LEFT_WALL, 0, RIGHT_WALL - LEFT_WALL, FLOOR);

    ctx.globalCompositeOperation = "lighter";
    var verticalBeam = ctx.createLinearGradient(
      highestCelebration.x - 115,
      0,
      highestCelebration.x + 115,
      0
    );
    verticalBeam.addColorStop(0, "rgba(165, 110, 255, 0)");
    verticalBeam.addColorStop(0.42, "rgba(203, 172, 255, " + (0.2 * fade) + ")");
    verticalBeam.addColorStop(0.5, "rgba(255, 255, 255, " + (0.58 * fade) + ")");
    verticalBeam.addColorStop(0.58, "rgba(255, 226, 91, " + (0.26 * fade) + ")");
    verticalBeam.addColorStop(1, "rgba(255, 226, 91, 0)");
    ctx.fillStyle = verticalBeam;
    ctx.fillRect(highestCelebration.x - 115, 0, 230, FLOOR);

    var horizontalBeam = ctx.createLinearGradient(
      0,
      highestCelebration.y - 54,
      0,
      highestCelebration.y + 54
    );
    horizontalBeam.addColorStop(0, "rgba(140, 231, 255, 0)");
    horizontalBeam.addColorStop(0.5, "rgba(255, 255, 255, " + (0.34 * fade) + ")");
    horizontalBeam.addColorStop(1, "rgba(197, 163, 255, 0)");
    ctx.fillStyle = horizontalBeam;
    ctx.fillRect(LEFT_WALL, highestCelebration.y - 54, RIGHT_WALL - LEFT_WALL, 108);

    ctx.translate(highestCelebration.x, highestCelebration.y);

    var glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
    glow.addColorStop(0, "rgba(255, 255, 255, " + fade + ")");
    glow.addColorStop(0.18, "rgba(255, 244, 113, " + (0.92 * fade) + ")");
    glow.addColorStop(0.5, "rgba(174, 123, 255, " + (0.58 * fade) + ")");
    glow.addColorStop(1, "rgba(177, 139, 255, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(-glowRadius, -glowRadius, glowRadius * 2, glowRadius * 2);

    if (!highestCelebration.reduced) {
      for (var echoIndex = 0; echoIndex < 3; echoIndex += 1) {
        var echoProgress = clamp((age - echoIndex * 0.17) / 1.05, 0, 1);
        if (echoProgress <= 0 || echoProgress >= 1) {
          continue;
        }
        ctx.save();
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = Math.sin(echoProgress * Math.PI) * (0.34 - echoIndex * 0.065);
        ctx.rotate((echoIndex - 1) * 0.045);
        drawLevelImage(LEVELS.length - 1, 112 + echoProgress * (150 + echoIndex * 28));
        ctx.restore();
      }

      ctx.rotate(progress * Math.PI * 1.15);
      for (var i = 0; i < 24; i += 1) {
        var rayLength = 135 + expansion * (95 + i % 3 * 22);
        var rayWidth = 4 + i % 2 * 3;
        ctx.fillStyle = i % 2
          ? "rgba(255, 255, 255, " + (0.66 * fade) + ")"
          : "rgba(255, 219, 65, " + (0.58 * fade) + ")";
        ctx.beginPath();
        ctx.moveTo(34, -rayWidth);
        ctx.lineTo(rayLength, 0);
        ctx.lineTo(34, rayWidth);
        ctx.closePath();
        ctx.fill();
        ctx.rotate(Math.PI * 2 / 24);
      }
    }

    ctx.restore();
  }

  function drawHighestCelebrationForeground() {
    celebrationParticles.forEach(function (particle) {
      var lifeRatio = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.save();
      ctx.globalAlpha = Math.min(0.78, lifeRatio * 1.35);
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = Math.max(1.2, particle.width * 0.38);
      ctx.beginPath();
      ctx.moveTo(particle.x, particle.y);
      ctx.lineTo(particle.x - particle.vx * 0.045, particle.y - particle.vy * 0.045);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = Math.min(1, lifeRatio * 1.8);
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.fillStyle = particle.color;
      if (particle.shape === 0) {
        ctx.fillRect(-particle.width / 2, -particle.height / 2, particle.width, particle.height);
      } else if (particle.shape === 1) {
        ctx.beginPath();
        ctx.moveTo(0, -particle.height / 2);
        ctx.lineTo(particle.width / 2, 0);
        ctx.lineTo(0, particle.height / 2);
        ctx.lineTo(-particle.width / 2, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -particle.height / 2);
        ctx.lineTo(particle.width * 0.22, -particle.width * 0.22);
        ctx.lineTo(particle.width / 2, 0);
        ctx.lineTo(particle.width * 0.22, particle.width * 0.22);
        ctx.lineTo(0, particle.height / 2);
        ctx.lineTo(-particle.width * 0.22, particle.width * 0.22);
        ctx.lineTo(-particle.width / 2, 0);
        ctx.lineTo(-particle.width * 0.22, -particle.width * 0.22);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    });

    if (!highestCelebration) {
      return;
    }

    var age = highestCelebration.age;
    var progress = clamp(age / highestCelebration.duration, 0, 1);
    var fade = 1 - clamp((progress - 0.78) / 0.22, 0, 1);
    var ringColors = highestCelebration.palette || CELEBRATION_COLORS;

    ctx.save();
    ctx.translate(highestCelebration.x, highestCelebration.y);
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < 7; i += 1) {
      var ringProgress = clamp((age - i * 0.12) / 1.35, 0, 1);
      if (ringProgress <= 0) {
        continue;
      }
      ctx.globalAlpha = (1 - ringProgress) * fade;
      ctx.strokeStyle = ringColors[i % ringColors.length];
      ctx.lineWidth = Math.max(3, 12 - i);
      ctx.beginPath();
      ctx.arc(0, 0, 50 + ringProgress * (275 + i * 20), 0, Math.PI * 2);
      ctx.stroke();
    }

    if (!highestCelebration.reduced) {
      for (var starIndex = 0; starIndex < 14; starIndex += 1) {
        var starAngle = age * (1.8 + starIndex % 3 * 0.22) + starIndex * Math.PI * 2 / 14;
        var starOrbit = 118 + starIndex % 4 * 28 + Math.sin(age * 4 + starIndex) * 10;
        var starSize = 4 + starIndex % 3 * 2.2;
        ctx.save();
        ctx.globalAlpha = fade * (0.55 + 0.35 * Math.sin(age * 8 + starIndex));
        ctx.translate(Math.cos(starAngle) * starOrbit, Math.sin(starAngle) * starOrbit);
        ctx.rotate(starAngle);
        ctx.fillStyle = ringColors[starIndex % ringColors.length];
        ctx.beginPath();
        ctx.moveTo(0, -starSize * 2.2);
        ctx.lineTo(starSize * 0.55, -starSize * 0.55);
        ctx.lineTo(starSize * 2.2, 0);
        ctx.lineTo(starSize * 0.55, starSize * 0.55);
        ctx.lineTo(0, starSize * 2.2);
        ctx.lineTo(-starSize * 0.55, starSize * 0.55);
        ctx.lineTo(-starSize * 2.2, 0);
        ctx.lineTo(-starSize * 0.55, -starSize * 0.55);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();

    if (!highestCelebration.reduced && age < 1.38) {
      var firstFlash = Math.max(0, 1 - age / 0.18);
      var secondFlash = Math.max(0, 1 - Math.abs(age - 0.56) / 0.12);
      var thirdFlash = Math.max(0, 1 - Math.abs(age - 1.18) / 0.14);
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = "rgba(255, 255, 255, " + Math.min(0.78, firstFlash * 0.74 + secondFlash * 0.38 + thirdFlash * 0.3) + ")";
      ctx.fillRect(LEFT_WALL, 0, RIGHT_WALL - LEFT_WALL, FLOOR);
      if (secondFlash > 0 || thirdFlash > 0) {
        ctx.fillStyle = "rgba(194, 112, 255, " + (secondFlash * 0.16 + thirdFlash * 0.12) + ")";
        ctx.fillRect(LEFT_WALL, 0, RIGHT_WALL - LEFT_WALL, FLOOR);
      }
      ctx.restore();
    }
  }

  function render(now) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(canvasScaleX, 0, 0, canvasScaleY, 0, 0);
    ctx.save();

    if (highestCelebration && !highestCelebration.reduced) {
      var cameraAge = highestCelebration.age;
      var firstZoom = cameraAge < 0.9 ? Math.sin(cameraAge / 0.9 * Math.PI) : 0;
      var secondZoom = cameraAge >= 0.9 && cameraAge < 1.7
        ? Math.sin((cameraAge - 0.9) / 0.8 * Math.PI)
        : 0;
      var cameraScale = 1 + firstZoom * 0.09 + secondZoom * 0.035;
      ctx.translate(highestCelebration.x, highestCelebration.y);
      ctx.scale(cameraScale, cameraScale);
      ctx.translate(-highestCelebration.x, -highestCelebration.y);
    }

    if (shake > 0.08) {
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
      shake *= 0.87;
    } else {
      shake = 0;
    }

    drawDangerLine(now);
    drawAimGuide();
    drawHighestCelebrationBackdrop();
    drawFailureSweep();

    items.forEach(function (body) {
      var bodyAlpha = 1;
      if (pigFly && pigFly.body === body && pigFly.fading) {
        bodyAlpha = Math.max(0, 1 - pigFly.fadeAge / 0.8);   /* 画布小猪在方框出现时淡出 */
      }
      drawItem(body, bodyAlpha, false);
    });

    drawFailureBlasts();

    if (mode === "playing" && readyToDrop) {
      drawItem({
        level: currentLevel,
        radius: LEVELS[currentLevel].radius,
        x: aimX,
        y: SPAWN_Y,
        popTime: 0,
        isPig: spawnIsPig   /* 小猪挑战：预览球与实际投放一致（群友/小猪 50/50） */
      }, 0.76, true);
    }

    drawParticles();
    drawHighestCelebrationForeground();
    drawEroFront();
    drawEroVision();
    drawEroReveal();
    if (eroChallengeActive()) {
      drawDangerLine(now);   /* Q8: 挑战中警戒线不被视野黑幕遮挡（顶层重绘） */
    }
    ctx.restore();
  }

  /* Q8 异常局：底部黑色（初始即遮挡小球）缓慢向上蔓延的前沿（保持黑下白上的渐变形式） */
  function drawEroFront() {
    if (!eroGameActive) {
      return;
    }
    var worldH = WORLD_HEIGHT;
    var front = Math.max(eroFront, ERO_BASE_FRONT);   /* 初始底部黑色也遮挡小球，但不高 */
    var frontY = worldH * (1 - Math.min(front, 1));
    var fade = worldH * 0.08;
    var solidTop = Math.max(0, frontY);
    ctx.fillStyle = "rgba(10, 10, 13, 0.99)";
    ctx.fillRect(0, solidTop, WORLD_WIDTH, worldH - solidTop);
    if (frontY > 0.001) {
      var band = Math.min(fade, frontY);
      var gradient = ctx.createLinearGradient(0, frontY - band, 0, frontY);
      gradient.addColorStop(0, "rgba(10, 10, 13, 0)");
      gradient.addColorStop(1, "rgba(10, 10, 13, 0.99)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, frontY - band, WORLD_WIDTH, band);
    }
  }

  /* Q8 Erosion 挑战：只看得见当前释放的小球与周围一圈（宽度 = 半径一半）圆环内的景象 */
  function drawEroVision() {
    if (!eroChallengeActive() || challengePhase !== "playing" || eroReveal) {
      return;
    }
    var focus = eroFocusInfo();
    if (!focus) {
      ctx.fillStyle = "rgba(7, 8, 10, 0.99)";
      ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      return;
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    ctx.arc(focus.x, focus.y, focus.r, 0, Math.PI * 2, true);
    ctx.fillStyle = "rgba(7, 8, 10, 0.99)";
    ctx.fill("evenodd");
    ctx.restore();
  }

  function eroFocusInfo() {
    if (eroFocusBody) {
      var liveIndex = items.indexOf(eroFocusBody);
      if (liveIndex < 0) {
        /* 兜底：亮着的小球被移除（未走合成接管）→ 立即切到下一个待释放小球 */
        eroFocusBody = null;
        eroFocusStable = 0;
        eroFocusAge = 0;
      } else {
        /* 可见范围 = 小球 + 周围一圈圆环（圆环宽度 = 半径的 1.5 倍）→ 半径 2.5r */
        return { x: eroFocusBody.x, y: eroFocusBody.y, r: eroFocusBody.radius * 2.5 };
      }
    }
    if (mode === "playing" && readyToDrop) {
      var radius = LEVELS[currentLevel].radius;
      return { x: aimX, y: SPAWN_Y, r: radius * 2.5 };
    }
    return null;
  }

  /* Q8 挑战成功：以目标球为中心，白色向外溶解四周黑色 */
  function drawEroReveal() {
    if (!eroReveal) {
      return;
    }
    /* Q8: 成功演出——以合成目标为中心的圆孔缓慢扩大，圆孔外的黑色遮罩逐步退散，
     * 露出孔内的小球与棋盘（不变白）；孔扩到全屏后遮罩完全消失 */
    var progress = clamp(eroReveal.age / eroReveal.duration, 0, 1);
    var eased = progress * progress * (3 - 2 * progress);
    if (progress >= 1) {
      return;
    }
    var revealRadius = eroReveal.r + eased * Math.hypot(WORLD_WIDTH, WORLD_HEIGHT) * 0.62;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    ctx.arc(eroReveal.x, eroReveal.y, revealRadius, 0, Math.PI * 2, true);
    ctx.fillStyle = "rgba(8, 8, 10, 0.99)";
    ctx.fill("evenodd");
    ctx.restore();
  }

  function animationFrame(now) {
    var nextDpr = clamp(window.devicePixelRatio || 1, 1, 4);
    if (nextDpr !== dpr) {
      syncCanvasResolution();
    }
    var elapsed = Math.min((now - lastFrameTime) / 1000, 0.05);
    lastFrameTime = now;

    if ((mode === "playing" || mode === "ending") && !document.hidden) {
      accumulator += elapsed;
      var steps = 0;
      while (accumulator >= FIXED_STEP && steps < MAX_STEPS) {
        physicsStep(FIXED_STEP);
        accumulator -= FIXED_STEP;
        steps += 1;
      }
      if (steps === MAX_STEPS) {
        accumulator = Math.min(accumulator, FIXED_STEP);
      }
    }

    render(now);
    window.requestAnimationFrame(animationFrame);
  }

  function ensureAudio() {
    if (!soundEnabled) {
      return;
    }
    try {
      var AudioConstructor = window.AudioContext || window.webkitAudioContext;
      if (!audioContext && AudioConstructor) {
        audioContext = new AudioConstructor();
      }
      if (audioContext && audioContext.state === "suspended") {
        var resumeResult = audioContext.resume();
        if (resumeResult && typeof resumeResult.catch === "function") {
          resumeResult.catch(function () {});
        }
      }
    } catch (error) {
      audioContext = null;
    }
  }

  function playTone(frequency, duration, volume, type, delay) {
    if (!soundEnabled) {
      return;
    }
    ensureAudio();
    if (!audioContext) {
      return;
    }

    try {
      var startAt = audioContext.currentTime + (delay || 0);
      var oscillator = audioContext.createOscillator();
      var gain = audioContext.createGain();
      oscillator.type = type || "sine";
      oscillator.frequency.setValueAtTime(frequency, startAt);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + duration + 0.02);
    } catch (error) {
      // Audio feedback is optional.
    }
  }

  function playDropSound(level) {
    playTone(185 + level * 20, 0.08, 0.035, "sine", 0);
  }

  function playMergeSound(level) {
    var frequency = 285 * Math.pow(1.115, Math.min(level, 10));
    playTone(frequency, 0.13, 0.055, "sine", 0);
    playTone(frequency * 1.5, 0.1, 0.032, "triangle", 0.055);
  }

  function playHighestCelebrationSound() {
    playTone(523.25, 0.28, 0.052, "triangle", 0.02);
    playTone(659.25, 0.3, 0.05, "triangle", 0.12);
    playTone(783.99, 0.34, 0.048, "sine", 0.23);
    playTone(1046.5, 0.55, 0.055, "sine", 0.36);
  }

  function playFailureExplosionSound(level) {
    var frequency = 105 + Math.min(level, 10) * 13;
    playTone(frequency, 0.11, 0.036, "square", 0);
    playTone(frequency * 0.56, 0.16, 0.028, "triangle", 0.025);
  }

  function playGameOverSound() {
    playTone(245, 0.2, 0.045, "sine", 0);
    playTone(185, 0.28, 0.04, "sine", 0.16);
  }

  /* Q1: 胜利结算音（上行三音，区别于失败的下沉音） */
  function playVictorySound() {
    playTone(523.25, 0.18, 0.05, "triangle", 0);
    playTone(659.25, 0.2, 0.05, "triangle", 0.12);
    playTone(783.99, 0.34, 0.05, "sine", 0.24);
  }

  function makeMachineError(code, message) {
    var error = new Error(message);
    error.code = code;
    return error;
  }

  function machineVersion() {
    return MACHINE_VERSION;
  }

  function machineLevels() {
    return LEVELS.map(function (level) {
      return {
        radius: level.radius,
        score: level.score,
        image: level.image,
        name: level.name
      };
    });
  }

  function machineLegalActions() {
    if (mode !== "playing" || !readyToDrop) {
      return [];
    }
    var radius = LEVELS[currentLevel].radius;
    return [{
      type: "drop",
      minX: LEFT_WALL + radius,
      maxX: RIGHT_WALL - radius
    }];
  }

  function machineObservation() {
    return {
      mode: mode,
      target: targetCollegeKey,
      canAct: mode === "playing" && readyToDrop,
      score: score,
      nextLevel: mode === "playing" && readyToDrop ? currentLevel : null,
      maxDropLevel: currentMaxDropLevel,
      dropCooldown: Math.max(0, dropCooldown),
      synthesized: {  /* Q4: 合成图鉴进度 */
        count: synthesizedCount(),
        keys: Object.keys(synthesizedKeys)
      },
      egg: {  /* Q6: 群主彩蛋状态 */
        unlocked: eggUnlocked(),
        mode: eggMode,
        mutedCount: Object.keys(mutedKeys).length,
        mutedKeys: Object.keys(mutedKeys),
        finale: eggFinaleStarted,
        eggDone: eggDone
      },
      challenge: {  /* Q6: 特殊挑战状态 */
        active: challengeActive,
        phase: challengePhase,
        kind: challengeKind,
        entry: challengeEntry,
        targetKey: challengeTargetKey,
        chainKeys: challengeChain.map(function (college) { return college.key; }),
        skipLevel: challengeSkipLevel,
        mutedKey: challengeMutedKey,
        memberCount: challengeMembers.length
      },
      ero: {  /* Q8: Erosion 挑战状态 */
        unlocked: erodeProgress.unlocked,
        passed: erodeProgress.passed,
        best: erodeProgress.best,
        failed: erodeProgress.failed,
        retryAvailable: erodeProgress.unlocked && erodeProgress.failed,
        anomalies: erodeProgress.anomalies.slice(),
        anomalyCount: erodeProgress.anomalies.length,
        gameActive: eroGameActive,
        front: eroFront,
        frontState: eroFrontState,
        armed: eroArmed,
        teasing: eroTeaseAge >= 0,
        unlocking: eroUnlocking,
        focusBall: !!eroFocusBody,
        revealing: !!eroReveal,
        chainLength: eroChain.length > 0 ? eroChain.length + 1 : 0
      },
      pig: {  /* Q7: 小猪挑战收集与解锁状态 */
        menuClicked: pigProgress.menuClicked,
        captured: pigProgress.captured,
        pigMade: pigProgress.pigMade,
        attempted: pigProgress.attempted,
        passed: pigProgress.passed,
        best: pigProgress.best,
        collected: pigCollectedCount(),
        remaining: pigsRemaining(),
        collectionDone: pigCollectionDone(),
        pigMemberActive: pigUnlockActive,
        surroundVisible: !!(menuPigSurround && !menuPigSurround.hidden),
        capturedVisible: !!(pigCaptured && !pigCaptured.hidden),
        capturedRetry: !!(pigCaptured && pigCaptured.classList && pigCaptured.classList.contains("pig-captured-retry"))
      },
      menu: {  /* 主界面/特殊挑战菜单状态 */
        main: !mainMenuOverlay.hidden,
        challengeMenu: !challengeMenuOverlay.hidden,
        topbarHidden: topbarHidden,
        featureUnlocked: challengeFeatureUnlocked(),
        ownerUnlocked: challengeUnlocked,
        ownerBest: challengeBest
      },
      danger: {
        near: dangerIsNear,
        crossed: dangerIsCrossed,
        timer: dangerTimer
      },
      board: {
        width: WORLD_WIDTH,
        height: WORLD_HEIGHT,
        dangerLine: DANGER_LINE,
        levels: machineLevels()
      },
      items: items.map(function (body) {
        return {
          id: body.id,
          level: body.level,
          x: body.x,
          y: body.y,
          vx: body.vx,
          vy: body.vy,
          isPig: !!body.isPig
        };
      })
    };
  }

  function machineAct(action) {
    if (!action || typeof action !== "object" || Array.isArray(action)) {
      throw makeMachineError("INVALID_ARGUMENT", "action 必须是对象。");
    }
    if (action.type !== "drop") {
      throw makeMachineError("UNSUPPORTED_ACTION", "当前只支持 drop 动作。");
    }
    if (mode !== "playing" || !readyToDrop) {
      throw makeMachineError("ILLEGAL_ACTION", "当前状态不能投放物体。");
    }
    if (!Number.isFinite(action.x)) {
      throw makeMachineError("INVALID_ARGUMENT", "drop.x 必须是有限数字。");
    }

    var minimumX = LEFT_WALL + LEVELS[currentLevel].radius;
    var maximumX = RIGHT_WALL - LEVELS[currentLevel].radius;
    if (action.x < minimumX || action.x > maximumX) {
      throw makeMachineError("INVALID_ARGUMENT", "drop.x 超出当前物体的合法范围。");
    }

    aimX = action.x;
    dropCurrentItem();
    return machineObservation();
  }

  function machineReset() {
    startGame();
    return machineObservation();
  }

  function machineChooseTarget(key) {
    chooseTarget(typeof key === "string" ? key : "");
    return machineObservation();
  }

  function addPointerClickListener(element, listener) {
    element.addEventListener("click", function (event) {
      if (event.detail > 0) {
        listener();
      }
    });
  }

  /* 结算卡（合成成功/失败共用）三个选项，自上而下：
   * 继续合成 → 选择界面（重选目标）；再玩一次 → 原目标重开；回到主界面 → 主菜单 */
  addPointerClickListener(continueMergeButton, function () {
    gameOverOverlay.hidden = true;
    restartConfirmOverlay.hidden = true;
    eroNotifyNormalGameExit();   /* Q8: 结束本次游玩 → 无异常局累计一位异常群友 */
    eroEndAnomalyGame();
    resetBoardToIdle();
    mode = "selecting";
    readyToDrop = false;
    activePointer = null;
    resetFrameClock();
    openTargetPicker();
  });

  addPointerClickListener(againButton, function () {
    eroNotifyNormalGameExit();   /* Q8: 再玩一次 = 结束本局游玩，累计一位异常群友 */
    eroEndAnomalyGame();
    startGame();
  });

  addPointerClickListener(menuReturnButton, function () {
    gameOverOverlay.hidden = true;
    restartConfirmOverlay.hidden = true;
    eroNotifyNormalGameExit();
    eroEndAnomalyGame();
    resetBoardToIdle();
    mode = "selecting";
    readyToDrop = false;
    activePointer = null;
    resetFrameClock();
    openMainMenu();
  });

  addPointerClickListener(targetButton, function () {
    if (targetButton.disabled) {
      return;   /* 解锁对局 / 结算等待期：退出不可用 */
    }
    if (challengeActive) {
      /* 退出前确认：取消（红底白字）/ 退出（蓝底白字） */
      mode = "confirming";
      updateControls();
      if (challengeExitOverlay) {
        challengeExitOverlay.hidden = false;
      }
      return;
    }
    openTargetPicker();
  });
  addPointerClickListener(challengeExitCancelButton, function () {
    if (challengeExitOverlay) {
      challengeExitOverlay.hidden = true;
    }
    mode = "playing";
    updateControls();
  });
  addPointerClickListener(challengeExitConfirmButton, function () {
    if (challengeExitOverlay) {
      challengeExitOverlay.hidden = true;
    }
    if (challengeActive && (challengePhase === "success" || challengePhase === "failed")) {
      mode = "playing";
      updateControls();
      return;   /* 结算等待期不允许退出（结算面板即将弹出） */
    }
    exitChallengeToMenu();   /* 确认退出 → 回到「特殊挑战」选择菜单 */
  });

  addPointerClickListener(targetRandomButton, function () {
    chooseTarget("");
  });

  addPointerClickListener(targetCancelButton, function () {
    closeTargetPicker();
  });

  /* 选择界面：回到主界面 */
  addPointerClickListener(targetMenuButton, function () {
    closeTargetPickerToMenu();
  });

  /* ===== 主界面 / 特殊挑战菜单按钮 ===== */
  addPointerClickListener(menuStartButton, function () {
    closeMainMenu();
    openTargetPicker();
  });

  addPointerClickListener(menuChallengeButton, function () {
    if (!challengeFeatureUnlocked()) {
      showMenuToast("先合成一个群友再来解锁吧！");
      return;
    }
    closeMainMenu();
    openChallengeMenu();
  });

  addPointerClickListener(challengeMenuBackButton, function () {
    closeChallengeMenu();
    openMainMenu();
  });

  /* Q6: 特殊挑战按钮 */
  addPointerClickListener(challengeConfirmYesButton, function () {
    confirmChallengeMute();
  });
  addPointerClickListener(challengeConfirmNoButton, function () {
    cancelChallengeMute();
  });
  addPointerClickListener(challengeRetryButton, function () {
    retryChallenge();
  });
  addPointerClickListener(challengeContinueButton, function () {
    finishChallenge();
  });

  /* ===== Q7 小猪挑战：主界面收集 + 解锁演出 + 重试弹窗 ===== */
  addPointerClickListener(menuPigSurround, function () {
    clickMenuPigSurround();   /* ①被群友包围了：抖动 + 声音 = 一只小猪（仅一次） */
  });
  addPointerClickListener(pigCaptured, function () {
    if (!pigCaptured.classList.contains("pig-captured-retry")) {
      collectCapturedPig();   /* 点击即计数；下降途中点到 → 小猪原路返回 */
      return;
    }
    /* 失败重试入口：弹出 🐖要重新挑战吗？🐖 */
    if (pigRetryOverlay) {
      pigRetryOverlay.hidden = false;
    }
  });
  addPointerClickListener(pigRetryExitButton, function () {
    if (pigRetryOverlay) {
      pigRetryOverlay.hidden = true;   /* 退出：关闭弹窗，留在主界面 */
    }
  });
  addPointerClickListener(pigRetryGoButton, function () {
    if (pigRetryOverlay) {
      pigRetryOverlay.hidden = true;
    }
    closeMainMenu();
    startPigChallenge(true);   /* 来！！！：直接重新进入小猪挑战（不重放规则） */
  });
  addPointerClickListener(pigStartChallengeButton, function () {
    startPigChallenge(true);   /* 规则页「开始挑战」 */
  });

  /* Q8 Erosion 失败重试弹窗：退出留在菜单；来！！！全黑直接进入挑战 */
  addPointerClickListener(eroRetryExitButton, function () {
    if (eroRetryOverlay) {
      eroRetryOverlay.hidden = true;
    }
  });
  addPointerClickListener(eroRetryGoButton, function () {
    if (eroRetryOverlay) {
      eroRetryOverlay.hidden = true;
    }
    closeChallengeMenu();
    startEroChallenge();
  });

  function resetFrameClock() {
    lastFrameTime = performance.now();
    accumulator = 0;
    activePointer = null;
  }

  function closeRestartConfirm(shouldRestart) {
    if (mode !== "confirming") {
      return;
    }
    restartConfirmOverlay.hidden = true;
    if (shouldRestart) {
      if (challengeActive && challengeKind === "pig") {
        startPigChallenge(true);   /* 小猪挑战内「重开」：重开一局小猪挑战 */
        return;
      }
      if (challengeActive && challengeKind === "ero") {
        startEroChallenge();   /* Erosion 内「重开」：重开一局 */
        return;
      }
      if (challengeActive && challengeKind === "owner" && challengeEntry === "menu") {
        retryChallenge();   /* 菜单重玩的群主挑战「重开」：回到禁言选择，重新随机链条 */
        return;
      }
      eroNotifyNormalGameExit();   /* Q8: 普通对局重开 = 退出本次游玩，累计一位异常群友 */
      eroEndAnomalyGame();
      startGame();
      return;
    }
    resetFrameClock();
    mode = "playing";
    updateControls();
  }

  addPointerClickListener(restartButton, function () {
    if (mode !== "playing" || restartButton.disabled) {
      return;   /* 结算等待期 / 解锁对局 / 不允许重开的挑战：重开不可用 */
    }
    mode = "confirming";
    resetFrameClock();
    updateControls();
    restartConfirmOverlay.hidden = false;
  });

  addPointerClickListener(restartCancelButton, function () {
    closeRestartConfirm(false);
  });

  addPointerClickListener(restartConfirmButton, function () {
    closeRestartConfirm(true);
  });

  addPointerClickListener(soundButton, function () {
    soundEnabled = !soundEnabled;
    updateSoundControl();
    if (soundEnabled) {
      playTone(440, 0.08, 0.035, "sine", 0);
    }
  });

  function finishPointerGesture(event, shouldDrop) {
    if (event.pointerId !== activePointer) {
      return;
    }

    if (shouldDrop) {
      moveAimFromEvent(event);
    }
    activePointer = null;

    try {
      if (canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    } catch (error) {
      // The browser may already have released capture.
    }

    if (shouldDrop) {
      dropCurrentItem();
    }
    if (event.cancelable) {
      event.preventDefault();
    }
  }

  canvas.addEventListener("pointerdown", function (event) {
    if (mode !== "playing" || !readyToDrop || activePointer !== null) {
      return;
    }
    activePointer = event.pointerId;
    moveAimFromEvent(event);
    try {
      if (canvas.setPointerCapture) {
        canvas.setPointerCapture(event.pointerId);
      }
    } catch (error) {
      // Window-level pointer listeners provide the fallback.
    }
    ensureAudio();
    if (event.cancelable) {
      event.preventDefault();
    }
  });

  canvas.addEventListener("pointermove", function (event) {
    if (event.pointerId === activePointer || (activePointer === null && event.pointerType === "mouse")) {
      moveAimFromEvent(event);
      if (event.cancelable) {
        event.preventDefault();
      }
    }
  });

  canvas.addEventListener("pointerup", function (event) {
    finishPointerGesture(event, true);
  });

  canvas.addEventListener("pointercancel", function (event) {
    finishPointerGesture(event, false);
  });

  canvas.addEventListener("lostpointercapture", function (event) {
    if (event.pointerId === activePointer) {
      activePointer = null;
    }
  });

  window.addEventListener("pointermove", function (event) {
    if (event.pointerId === activePointer && event.target !== canvas) {
      moveAimFromEvent(event);
      if (event.cancelable) {
        event.preventDefault();
      }
    }
  }, { passive: false });

  window.addEventListener("pointerup", function (event) {
    finishPointerGesture(event, true);
  }, { passive: false });

  window.addEventListener("pointercancel", function (event) {
    finishPointerGesture(event, false);
  }, { passive: false });

  document.addEventListener("visibilitychange", resetFrameClock);

  window.addEventListener("blur", function () {
    activePointer = null;
  });

  window.addEventListener("resize", syncCanvasResolution, { passive: true });
  window.addEventListener("pageshow", function () {
    syncCanvasResolution();
    resetFrameClock();
  });
  window.addEventListener("pagehide", resetFrameClock);

  applyUiConfig();
  syncCanvasResolution();
  updateSoundControl();
  if (CONFIG.selectable) {
    /* 启动进入主界面；「开始游玩」后才弹出目标选择（选定后才开局） */
    mode = "selecting";
    pickerCanCancel = false;
    buildTargetGrid();
    targetOverlay.hidden = true;
    openMainMenu();
    updateControls();
  } else {
    startGame();
  }

  /* ===== 演示/测试钩子：快速构造“达成目标”与“触发结算”场景，不影响正常玩法 ===== */
  function machineDebugSpawnPair(level, gapRatio, sameKind) {
    if (mode !== "playing" || !LEVELS[level]) {
      return false;
    }
    var radius = Math.min(LEVELS[level].radius, (RIGHT_WALL - LEFT_WALL) / 4);
    var gap = radius * (typeof gapRatio === "number" ? gapRatio : 0.9);
    var centerX = WORLD_WIDTH / 2;
    var y = FLOOR - radius - 4;
    var left = makeItem(level, centerX - gap / 2, y, 0, 0, "merge");
    var right = makeItem(level, centerX + gap / 2, y, 0, 0, "merge");
    if (pigChallengeActive() && !sameKind) {
      /* 小猪挑战：默认投放「群友 + 同级小猪」（可合成）；sameKind=true 投放同类（不可合成） */
      right.isPig = true;
    }
    items.push(left);
    items.push(right);
    return true;
  }

  function machineDebugFillBoard(level, overhang) {    if (mode !== "playing" || !LEVELS[level]) {
      return false;
    }
    var radius = Math.min(LEVELS[level].radius, 34);
    var step = radius * 1.9;
    var y = FLOOR - radius;
    var guard = 0;
    while (y > DANGER_LINE + radius && guard < 24) {
      guard += 1;
      for (var x = LEFT_WALL + radius; x <= RIGHT_WALL - radius; x += step) {
        items.push(makeItem(level, x, y, 0, 0, "merge"));
      }
      y -= step;
    }
    /* 顶部保证一行越过警戒线（默认 6px；可加大 overhang 抵抗物理沉降），
     * 1.35s 宽限后进入结算 */
    items.push(makeItem(level, WORLD_WIDTH / 2, DANGER_LINE + radius - (typeof overhang === "number" ? overhang : 6), 0, 0, "merge"));
    return true;
  }

  function machineDebugStartChallenge() {
    challengeActive = true;
    retryChallenge();
    return machineObservation();
  }

  /* 测试钩子：直接打开特殊挑战菜单（渲染条目） */
  function machineDebugOpenChallengeMenu() {
    openChallengeMenu();
    return machineObservation();
  }

  /* ===== Q7 测试钩子：小猪收集与挑战 ===== */
  function machineDebugPigClick() {
    clickMenuPigSurround();   /* ①被群友包围了 */
    return machineObservation();
  }

  function machineDebugPigCapture() {
    /* ②被捕捉的小猪：直接收集一只（跳过 20% 概率与落下滑入） */
    pigCaptured.hidden = false;
    collectCapturedPig();
    return machineObservation();
  }

  /* 测试钩子：强制一只小猪开始慢速掉落（跳过 20% 概率） */
  function machineDebugPigFall() {
    maybeSpawnCapturedPig(true);
    return machineObservation();
  }

  function machineDebugStartPigChallenge() {
    closeMainMenu();
    startPigChallenge();
    return machineObservation();
  }

  /* ===== Q8 测试钩子：Erosion ===== */
  function machineDebugAddEroAnomaly() {
    var added = eroAddAnomaly();
    return { added: added, observation: machineObservation() };
  }

  function machineDebugStartEroGame() {
    var key = erodeProgress.anomalies[erodeProgress.anomalies.length - 1];
    if (!key) {
      return null;
    }
    closeMainMenu();
    targetOverlay.hidden = false;
    startEroGame(key);
    return machineObservation();
  }

  function machineDebugStartEroChallenge() {
    closeMainMenu();
    startEroChallenge();
    return machineObservation();
  }

  /* 测试钩子：异常局直接武装蔓延机制（跳过合成 10 级球） */
  function machineDebugArmEro() {
    if (!eroGameActive) {
      return null;
    }
    eroArmed = true;
    eroIdleTime = ERO_IDLE_TRIGGER;
    return machineObservation();
  }

  window.MERGE_GAME_MACHINE = Object.freeze({
    version: machineVersion,
    observe: machineObservation,
    legalActions: machineLegalActions,
    act: machineAct,
    reset: machineReset,
    chooseTarget: machineChooseTarget,
    debugSpawnPair: machineDebugSpawnPair,
    debugFillBoard: machineDebugFillBoard,
    debugStartChallenge: machineDebugStartChallenge,
    debugOpenChallengeMenu: machineDebugOpenChallengeMenu,
    debugPigClick: machineDebugPigClick,
    debugPigCapture: machineDebugPigCapture,
    debugPigFall: machineDebugPigFall,
    debugStartPigChallenge: machineDebugStartPigChallenge,
    debugAddEroAnomaly: machineDebugAddEroAnomaly,
    debugStartEroGame: machineDebugStartEroGame,
    debugStartEroChallenge: machineDebugStartEroChallenge,
    debugArmEro: machineDebugArmEro
  });
  window.requestAnimationFrame(animationFrame);
}());
