---
name: "check.skill"
description: "对用户给出的生物信息研究方案，生成一份自包含的 HTML 格式完成情况 checklist（可点击勾选、自动保存进度）。当用户给出一个方案/计划并希望跟踪完成进度时触发。Generate an interactive HTML progress checklist whenever the user provides a bioinformatics research plan."
---

# bio · 方案 → HTML checklist

每当用户给出一份研究方案（或要求把某计划做成可跟踪的完成清单）时，生成一个**自包含的单文件 HTML checklist**，用于跟踪该方案下所有任务的完成情况。

## 触发条件
- 用户给出一个方案/计划/多个步骤，并希望检查完成进度时（触发词常见为「方案」「计划」「生成 checklist」「检查我都完成了哪些工作」「跟踪进度」等）。
- 方向不限（单细胞、空间转录组、生信、多组学、临床分析等），但默认面向生物信息/肿瘤研究场景。

## 核心行为
1. **解析方案，拆成工作阶段**：把用户方案分解为多个逻辑阶段（如：数据获取与质控 → 基因集/分子基础构建 → 差异与富集分析 → 活性打分 → 空间/生态位特征分析 → 临床转化 → 成果图件与产出）。
2. **每阶段列出具体子项**（list item），每项包含：
   - 任务名（加粗）
   - 一句补充说明（note）：说明该步骤做什么、用到哪些数据/工具
3. **默认勾选已完成的项**：若上下文中能判断某些步骤已完成（如数据已下载、某分析已跑出结果），预设 `data-done="true"` 并附带结果要点。
4. **输出为单文件 HTML**：无外部依赖，双击即可在浏览器打开，勾选状态自动持久化。

## 输出格式规范（强约束，务必遵守）
生成一个完整的 HTML 文档，包含：

- **样式约定**
  - 配色使用柔和低饱和色，**禁止大面积亮蓝/高饱和蓝**（避免刺眼）。主色建议 `#0a6b5c`（深青）+ `#7fb59a`（浅绿）+ `#d49a6a`（暖橙），背景 `#f2f6f3`，文字 `#1f3a36`。
  - 英文/中文均用系统无衬线字体（"Microsoft YaHei","PingFang SC"）。
- **结构元素**
  - 顶部 header：方案标题 + 主题标签。
  - 进度摘要卡片：显示「已完成 N / 总数」、百分比、进度条（`#barFill`）。
  - 多个 `<section>`，每个对应一个阶段；阶段头部有数字徽章 `stage .num` 与标题。
  - 每个任务为一个 `<li>`，点击可切换 `.done` 状态并实时刷新进度。
    - 已完成项显示对勾 `✓`，任务名划线、变灰，可带完成说明。
- **交互与持久化**
  - 使用 `localStorage` 保存勾选状态，key 用 `'<项目>_checklist_v1'` 形式。
  - 条目按下标 `item_<i>` 存储；初始值优先读 saved，其次读 `data-done`。
  - 底部提供「重置全部勾选状态」按钮，带 `confirm()` 确认。

## 参考模板结构（可直接复用）
```html
<section>
  <div class="stage"><div class="num">1</div><h2>数据获取与质控</h2>
    <div class="cat"><span class="c">组学</span></div></div>
  <ul class="items">
    <li data-done="true"><span class="chk">✓</span>
      <div class="txt"><div class="t">TCGA-PAAD 转录组数据下载</div>
        <div class="note">说明该步做什么。</div></div></li>
    <li><span class="chk"></span>
      <div class="txt"><div class="t">数据质控与预处理</div>
        <div class="note">待完成任务。</div></div></li>
  </ul>
</section>
```

## 注意事项
- 文件默认保存到当前工作目录（如 Downloads 项目根目录），命名含项目标识，如 `项目名_完成检查清单.html`。
- 若用户有既定项目目录约定，将 HTML 放入对应目录。
- 只生成 HTML 交付物，不额外创建文档；除非用户另有要求。