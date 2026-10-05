# 合成大群友

QQ 群友头像主题合成小游戏：左右拖动投放群友头像球，两个相同头像碰到一起就合成更大一级，**合成出目标群友即胜利结算**！

- **普通玩法**：两个一样的群友可以合成更大的群友，努力合成你的目标群友吧！
- **特殊挑战**：三个特殊挑战“？？？？？”“？？？？？？？？？？”“???????”等你来解锁！

> ⚠️ 群友头像仅供群内娱乐，请勿用于其他用途。程序架构继承 [bu.eltaos.top](https://bu.eltaos.top/)（「合成世界第一的大学」/ GreatUSTC 社区项目），仿照本仓库 `hecheng-da-weiyang`（合成大院系）制作。

---

## 📁 结构

```
index.html          页面结构（仿照合成大院系）
style.css           样式（3 列群友选择网格 + QQ 蓝主题）
game-config.js      群友池配置（★由 make-badges.ps1 生成：13 级半径/得分 + 39 位群友）
game.js             自研物理 + 全部游戏逻辑（原站代码 + P1/P2/P3 + Q1-Q7 适配）
make-badges.bat     ★ 双击：扫描 profile\ 重建配置并生成圆形头像徽章
make-badges.ps1     素材生成脚本（GDI+/WIC：QQ 头像式裁方铺满 + 统一黑色描边 + EXIF 矫正）
profile/            ★ 群友照片（增删这里，昵称 = 文件名）
challenge/          特殊挑战素材（challenge/1.jpg 终章开场头像；challenge-pig/ 第二个挑战「直到群友变成一群小猪」全部素材与需求文档）
assets/img/round/   生成的圆形头像徽章（游戏实际读取）
test/smoke.test.js  冒烟测试
```
