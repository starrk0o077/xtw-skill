---
name: 公众号发布工具
description: 微信公众号发布与运营工具（整合自 wechat-publisher / 公众号排版发布 / 微信公众号工具包 / wechat-official-tool）。能力：①一键发布 Markdown 到公众号草稿箱（Python 脚本，真实可用，含封面压缩与永久素材上传）；②分步建草稿（上传封面→生成草稿 JSON→提交）；③MD 转公众号内联样式 HTML 排版；④搜索/下载/洗稿等运营方法指引（脚本缺失，属方法论）。触发词：发布到公众号、公众号排版、公众号草稿箱、写推文发布、文章压缩、上传封面图。
---

# 公众号发布工具（整合版）

整合原四个公众号发布/排版/工具类技能，统一维护。**凡是本文未覆盖的场景，按默认链路走。**

> ⚠️ **目录自述（务必读）**：本技能真正可执行的只有 `scripts/` 下的 4 个 Python 脚本（发布链路）。
> `references/`、`assets/INSTALL.md` 为补充文档；原「微信公众号工具包」的搜索/下载（node 脚本）与
> 「wechat-publisher」的 `publish.sh` 脚本**在仓库中并不存在**，故搜索/下载/洗稿仅保留为方法指引，
> 不保证可运行。引用时不要臆造不存在的脚本路径。

## 触发判断

| 用户意图 | 处理 |
|---------|------|
| 发布已写好的 Markdown 到公众号草稿箱 | 走「一键发布」或「分步建草稿」 |
| 只要封面图上传 / 压缩图片 | 用 `upload_cover.py` / `compress_img.py` |
| Markdown 转公众号排版 HTML | 按「排版」节给出内联样式 HTML |
| 搜文章 / 下载文章 / 洗稿改写 | 按「运营方法指引」给出流程与命令说明（脚本不可用） |

---

## 一、前置配置

1. **凭证**：在工作目录创建 `wechat_credentials.json`：
   ```json
   { "appid": "wx你的AppID", "appsecret": "你的AppSecret" }
   ```
2. **IP 白名单**：查询出口 IP 并加入公众平台「设置与开发→基本配置→IP白名单」：
   ```bash
   curl ifconfig.me
   ```
3. **依赖**：`pip install requests Pillow`（发布脚本依赖；`create_draft.py` 仅标准库）。
4. 详细：见 `assets/INSTALL.md`、`references/credentials_guide.md`。

### 常见错误速查

| errcode | 含义 | 解决 |
|---------|------|------|
| 40164 | IP 不在白名单 | 重新查出口 IP 加入白名单 |
| 40006 | media 尺寸超限 | 用 `compress_img.py` 压缩（<2MB） |
| 40007 | 无效 media_id | 封面必须用**永久素材**接口（`add_material`），勿用临时素材 |
| 40001 | token 无效/过期 | 重新获取（7200s 有效期） |

---

## 二、发布

### 方式 A：一键发布（推荐，单条图文）

```bash
python scripts/publish.py <文章.md路径> <封面图路径> [摘要]
```

流程：读凭证 → 取 token → 上传封面到永久素材 → Markdown 转草稿 JSON → 提交 `draft/add`。
要求：封面图坐标 1280×720、<2MB；文章以 `# 标题` 开头（作主标题），`## 修改记录` 之后内容会被截断。

### 方式 B：分步（精细化控制）

```bash
# 1. 压缩封面（超出 2MB 时）
python scripts/compress_img.py <输入图片> <输出图片> [quality=85]

# 2. 只上传封面，拿 media_id
python scripts/upload_cover.py <封面图路径>          # -> media_id

# 3. 用 media_id 生成草稿 JSON
python scripts/create_draft.py <文章.md> <media_id> <输出.json> [摘要]

# 4. 将生成的 输出.json 提交到公众号草稿箱（可手动后台导入或按需）
```

### 集合适用说明（XTW 合集）

若正文由 `XTW.skill` 生成的 1+2 / 1+3 合集排版而来，`publish.py` 只处理单条。合集请：
1. 用 `upload_cover.py` 逐篇上传封面拿 media_id；
2. 用 `create_draft.py` 逐篇生成草稿 JSON；
3. 在草稿 JSON 的 `articles` 字段合并多条，再一次性提交 `draft/add`。
（遵守原始约定：只建不删，IP 白名单问题上报。）

---

## 三、排版（Markdown → 公众号 HTML）

- **工具脚本**：`create_draft.py` / `publish.py` 内置 `md_to_wechat_html`，将常见 Markdown（`#`/`##`/`-`列表/```` ``` ````代码块/`---`/`**加粗**`）转为**行内 style** HTML，公众号后台可直接粘贴。
- **规范要点**：行内样式、正文 `line-height:1.9`、`font-size:15px`、段落 `margin:12px 0`、`##` 标题左侧蓝条 `#5766d9`；代码块 `#f6f8fa` 底色等宽字体。
- 若用户指定其他排版风格（如 XTW 的科研风格），以用户指定为准，不强制覆盖。
- 检查清单：样式是否内联（可被后台粘贴）？图片是否已上传？移动端显示是否正常？

---

## 四、运营方法指引（脚本不可用，按说明执行）

> 原「微信公众号工具包」搜索/下载用 node 脚本，原「wechat-publisher」用 `publish.sh`/wenyan-cli，
> 这些脚本与依赖**当前仓库均不存在**。以下仅为方法描述，调用前需先确认脚本实际存在，否则如实告知用户暂不能执行，并给替代方案（如手动搜索/下载）。

1. **选题研究**：用 `baidu-search` / `multi-search-engine` 搜「今日热点 微信公众号」「微信指数 关键词」，做竞品分析、关键词规划（主词+长尾词）。
2. **内容创作**：抓痛点/故事/数字开头，分 3–5 个小节，结尾引导互动（评论/在看/转发）。去 AI 味：删「值得注意的是」「综上所述」等空话，长短句交替。
3. **文章搜索 / 下载**（若环境具备工具）：按公众号文章关键词搜索，解析真实链接抓正文；下载 Markdown/HTML/配图/视频。
4. **洗稿改写**：结构重组（段落重排/拆合/叙事角度转换）+ 语言改写（删意义膨胀句、去 AI 高频词如"赋能/闭环/抓手/底层逻辑"）+ 标题改写（疑问型/数字型/悬念型/痛点型）+ 开头改写（故事/数据/痛点/反问引入）。避免 emoji 泛滥、模板段、假区间表达。

---

## 五、交付与自检

- 发布后报告：草稿 `media_id`、标题、执行链路，提示用户前往公众号后台「草稿箱」验收。
- **只创建新草稿，不做删除**；旧草稿由用户自理，助手不代删。
- 遇 `fetch failed` 等网络抖动，指数退避重试（2s×3）。
- IP 不在白名单（40164）时，上报当前出口 IP 并等待用户放行，不擅自绕过。

## 参考文献与辅助文档

- 安装：`assets/INSTALL.md`
- 头像/接口参考：`references/api_ref.md`
- 凭证配置：`references/credentials_guide.md`