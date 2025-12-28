# AI 记账助手（快应用）

基于快应用的语音 + AI 记账示例：语音识别转写，DeepSeek Chat 解析金额/分类/日期/收支方向，结果存储本地，适合学习端侧 AI/ASR 的落地方式。

## 预览
![首页总览](docs/screenshots/hello.png)
![AI 记账页](docs/screenshots/record.png)
![账单列表](docs/screenshots/list.png)
![理财顾问](docs/screenshots/advisor.png)
> 若图片未显示，请将对应截图放入 `docs/screenshots/`，命名保持一致。

## 功能特性
- 语音录入：`@service.asr` 转写，录音动画与状态提示。
- AI 解析：`src/helper/services/ai.js` 内置 DeepSeek Prompt，自动抽取金额/分类/日期并判断收支。
- 表单编辑：支持手动修改收支类型、金额、分类、备注、日期，保存有振动与 Toast 反馈。
- 数据汇总：首页总览、账单列表、AI 理财顾问多场景展示。
- 工具链：页面生成脚本、Less 预处理、Prettier + lint-staged 一键格式化。

## 技术栈
- 快应用 + hap-toolkit
- DeepSeek Chat API
- @service.asr 语音识别
- Less、Prettier、lint-staged、Husky

## 快速开始
1) 安装依赖：`npm install` 或 `yarn`
2) 配置密钥：在 `src/helper/services/ai.js` 将 `API_KEY` 换成你自己的 DeepSeek Key（勿提交真实密钥，可改为本地私有配置）。
3) 本地开发：`yarn start`（等同 `hap server --watch`，扫码或 USB 真机调试）
4) 构建调试包：`yarn build`（输出到 `dist/`）
5) 生成签名发布包：`yarn release`（依赖 `sign/` 下证书）
6) 新建页面：`yarn gen YourPageName`
7) 代码格式化：`yarn prettier` 或 `yarn prettier-watcher`

## 目录结构
```
.
├── sign/                # RPK 签名文件（请勿提交真实证书）
├── src/
│   ├── assets/          # 全局图片/样式/JS 资源
│   ├── components/      # 公共组件
│   ├── helper/          # 工具、AI 服务、存储服务等
│   ├── pages/           # 业务页面：Hello / Record / List / Advisor ...
│   ├── app.ux
│   └── manifest.json
├── scripts/             # 代码生成与辅助脚本
├── docs/screenshots/    # 页面截图存放处
├── build/, dist/        # 构建产物（已在 .gitignore）
├── package.json
└── README.md
```

## 配置与安全
- AI：`src/helper/services/ai.js` 使用 DeepSeek Chat API，务必替换 `API_KEY`；建议改为读取私有配置文件并确保 `.gitignore` 已忽略。
- 权限：语音需麦克风权限，网络需可访问 DeepSeek API。
- 证书：`sign/` 内的真实证书不要提交公共仓库。

## 常用命令
| 命令 | 说明 |
| --- | --- |
| `yarn start` | 开启本地服务并 watch（扫码/USB 调试） |
| `yarn build` | 构建调试包到 `dist/` |
| `yarn release` | 生成签名包 |
| `yarn gen YourPageName` | 快速创建新页面 |
| `yarn prettier` | 全量代码格式化 |
| `yarn prettier-watcher` | 监听文件并实时格式化 |

## 调试与发布
- IDE：使用官方快应用 IDE 导入项目，支持真机/模拟器、扫码预览、语法提示。
- CLI：`hap server` 启动服务，`hap debug` 远程调试。
- 发布：`yarn release` 生成签名包后按各厂商平台流程上传。

## 常见问题
- 语音无法识别：检查麦克风权限、`@service.asr` 可用性。
- AI 解析失败：确认 DeepSeek Key 有效、网络可达；可在 `src/helper/services/ai.js` 调整 Prompt 或温度。
- 分类/日期不准：按需修改 Prompt 逻辑或 `normalizeBill` 规则。
