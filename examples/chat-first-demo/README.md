# CRM 交互演示

[在线体验](https://cordis798.github.io/ai-native-crm/#/app/ai/workbench) · [项目源码](https://github.com/Cordis798/ai-native-crm)

独立的中文静态演示，覆盖 Agent 工作台、联系人、商机看板、任务、知识记忆与执行实验室。页面使用合成数据，展示产品交互和可检查的执行记录。

## 本地运行

在仓库根目录运行：

```bash
node scripts/serve-agent-demo.mjs
```

打开 http://127.0.0.1:3008/#/app/ai/workbench。也可以用普通静态服务器托管 `dist/`；相对资源地址和 hash 路由支持 GitHub Pages 子路径。

## 阅读代码

| 文件 | 用途 |
| --- | --- |
| `dist/app.js`、`dist/full-ui.js` | 导航、CRM 页面、对话和交互状态 |
| `dist/demo-fixtures.js`、`dist/demo-engine.js` | 合成业务场景与本地确定性流程 |
| `dist/demo-lab.js` | 分步执行、暂停、恢复、批准与重试实验室 |
| `dist/inspection.js` | 知识证据、记忆版本、Eval 与 Mission 检查面板 |
| `dist/agent-services.js` | Mem0、WeKnora、Langfuse 的接入状态与合成流程 |
| `dist/real-recordings.js` | 脱敏历史模型录制的只读回放 |

界面中的“查看真实实现”链接指向本仓库源码。历史录制保留原有来源标识与测量时间，不代表网站实时运行了模型。

## 验证

在本目录运行：

```bash
npm ci
npm test
```

测试覆盖页面入口、对话状态、键盘与输入法、转义、任务决策、实验室恢复、服务默认关闭和 CSS 规则。浏览器截图验证与 DOM 测试分别执行。

## 运行边界

此演示不会启动 Next.js、Supabase、Worker 或第三方服务，不执行真实消息发送。刷新会重置常规 CRM 状态；能力实验室提供独立的本地检查点。完整应用入口和服务前提见根目录 [README](../../README.md)。
