/* ============================================================
 * 合成大群友 —— 游戏配置（由 make-badges.ps1 扫描 profile\ 自动生成）
 * 群友池：profile/ 里的照片，昵称 = 照片文件名（不含扩展名）。
 * 合成链 13 级：选定目标群友置于链顶（第 13 级），从未选中的其余群友
 * 中随机抽取 12 位组成 1-12 级；无论合成哪个群友，标题统一「合成大群友」。
 * 合成出目标群友即胜利结算（无链顶彩蛋）。
 * radii/scores 按等级序（等级 0 最小）；score 为合成出该等级时的得分。
 * 头像徽章已按 QQ 头像方式烤进 assets/img/round/*.png（居中裁方铺满 +
 * 统一黑色描边），渲染层直接贴图。
 * ★ 本文件由 make-badges.ps1 生成：改动会被覆盖——改配色/半径请编辑该脚本。
 * ============================================================ */
(function () {
  "use strict";

  window.MERGE_GAME_CONFIG = {
    id: "qunyou",
    assetBase: "assets/",
    spawnLevelCount: 5,
    progressiveUnlock: true,

    ui: {
      title: "合成大群友",
      description: "QQ 群友头像合成小游戏"
    },

    radii: [13, 15.2, 17.8, 20.8, 24.3, 28.4, 33.2, 38.8, 45.4, 53, 62, 72.5, 85],
    scores: [0, 60, 120, 200, 300, 420, 560, 720, 900, 1100, 1300, 1500, 1750],

    /* 投放难度：可投最大球的半径不超过最大球的一半（85 / 2 = 42.5），
     * 即最高只能投到 r=38.8 那一级，更大的目标只能靠合成获得。 */
    maxSpawnRadius: 42.5,

    /* 群友池（沿用引擎的 colleges 字段名）：昵称即照片文件名；color 仍用于背景主题/合成粒子（头像描边已统一黑色） */
    colleges: [
      { key: "ABCDE", name: "ABCDE", short: "ABCDE", title: "ABCDE", color: "#6c2692", image: "img/round/ABCDE.png" },
      { key: "ajth", name: "ajth", short: "ajth", title: "ajth", color: "#252f9d", image: "img/round/ajth.png" },
      { key: "Anna", name: "Anna", short: "Anna", title: "Anna", color: "#a82945", image: "img/round/Anna.png" },
      { key: "BC.", name: "BC.", short: "BC.", title: "BC.", color: "#b3325e", image: "img/round/BC..png" },
      { key: "Chespy", name: "Chespy", short: "Chespy", title: "Chespy", color: "#9a2868", image: "img/round/Chespy.png" },
      { key: "colorfulLCAT", name: "colorfulLCAT", short: "colorfulLCAT", title: "colorfulLCAT", color: "#225ba0", image: "img/round/colorfulLCAT.png" },
      { key: "dix-sept", name: "dix-sept", short: "dix-sept", title: "dix-sept", color: "#4c2ea3", image: "img/round/dix-sept.png" },
      { key: "LiAsSe", name: "LiAsSe", short: "LiAsSe", title: "LiAsSe", color: "#412bb1", image: "img/round/LiAsSe.png" },
      { key: "Myyhloe", name: "Myyhloe", short: "Myyhloe", title: "Myyhloe", color: "#2f67b1", image: "img/round/Myyhloe.png" },
      { key: "Nanally", name: "Nanally", short: "Nanally", title: "Nanally", color: "#2ea861", image: "img/round/Nanally.png" },
      { key: "o6", name: "o6", short: "o6", title: "o6", color: "#29a868", image: "img/round/o6.png" },
      { key: "Polucky", name: "Polucky", short: "Polucky", title: "Polucky", color: "#a93296", image: "img/round/Polucky.png" },
      { key: "ppp", name: "ppp", short: "ppp", title: "ppp", color: "#3079b5", image: "img/round/ppp.png" },
      { key: "shit26", name: "shit26", short: "shit26", title: "shit26", color: "#2a4eb2", image: "img/round/shit26.png" },
      { key: "Signcat", name: "Signcat", short: "Signcat", title: "Signcat", color: "#43a72a", image: "img/round/Signcat.png" },
      { key: "Symmetry", name: "Symmetry", short: "Symmetry", title: "Symmetry", color: "#bc9c29", image: "img/round/Symmetry.png" },
      { key: "Ta4HfC5", name: "Ta4HfC5", short: "Ta4HfC5", title: "Ta4HfC5", color: "#283fa4", image: "img/round/Ta4HfC5.png" },
      { key: "八条", name: "八条", short: "八条", title: "八条", color: "#2a9369", image: "img/round/八条.png" },
      { key: "白神", name: "白神", short: "白神", title: "白神", color: "#924126", image: "img/round/白神.png" },
      { key: "不卷のCharon", name: "不卷のCharon", short: "不卷のCharon", title: "不卷のCharon", color: "#65922a", image: "img/round/不卷のCharon.png" },
      { key: "陈词", name: "陈词", short: "陈词", title: "陈词", color: "#9a2d51", image: "img/round/陈词.png" },
      { key: "单个星系", name: "单个星系", short: "单个星系", title: "单个星系", color: "#259841", image: "img/round/单个星系.png" },
      { key: "滚木", name: "滚木", short: "滚木", title: "滚木", color: "#2933a8", image: "img/round/滚木.png" },
      { key: "韩诗宜", name: "韩诗宜", short: "韩诗宜", title: "韩诗宜", color: "#4d2d9a", image: "img/round/韩诗宜.png" },
      { key: "户用QQ", name: "户用QQ", short: "户用QQ", title: "户用QQ", color: "#4327b4", image: "img/round/户用QQ.png" },
      { key: "来顿嘉晚饭", name: "来顿嘉晚饭", short: "来顿嘉晚饭", title: "来顿嘉晚饭", color: "#2a5298", image: "img/round/来顿嘉晚饭.png" },
      { key: "灵猫", name: "灵猫", short: "灵猫", title: "灵猫", color: "#829622", image: "img/round/灵猫.png" },
      { key: "流溟鸟之歌", name: "流溟鸟之歌", short: "流溟鸟之歌", title: "流溟鸟之歌", color: "#2a8ba2", image: "img/round/流溟鸟之歌.png" },
      { key: "喷火龙", name: "喷火龙", short: "喷火龙", title: "喷火龙", color: "#bdbc28", image: "img/round/喷火龙.png" },
      { key: "萨卡班甲鱼", name: "萨卡班甲鱼", short: "萨卡班甲鱼", title: "萨卡班甲鱼", color: "#912b3f", image: "img/round/萨卡班甲鱼.png" },
      { key: "神说", name: "神说", short: "神说", title: "神说", color: "#a8322e", image: "img/round/神说.png" },
      { key: "随便", name: "随便", short: "随便", title: "随便", color: "#2648ab", image: "img/round/随便.png" },
      { key: "随流狐", name: "随流狐", short: "随流狐", title: "随流狐", color: "#779726", image: "img/round/随流狐.png" },
      { key: "危啸", name: "危啸", short: "危啸", title: "危啸", color: "#919e24", image: "img/round/危啸.png" },
      { key: "星宫未幸", name: "星宫未幸", short: "星宫未幸", title: "星宫未幸", color: "#224e96", image: "img/round/星宫未幸.png" },
      { key: "炫籽", name: "炫籽", short: "炫籽", title: "炫籽", color: "#922a8f", image: "img/round/炫籽.png" },
      { key: "杨枝甘露", name: "杨枝甘露", short: "杨枝甘露", title: "杨枝甘露", color: "#3048b0", image: "img/round/杨枝甘露.png" },
      { key: "雨亦奇", name: "雨亦奇", short: "雨亦奇", title: "雨亦奇", color: "#a04c27", image: "img/round/雨亦奇.png" },
      { key: "竹岚zzz", name: "竹岚zzz", short: "竹岚zzz", title: "竹岚zzz", color: "#275eb0", image: "img/round/竹岚zzz.png" }
    ]
  };
}());
