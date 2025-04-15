# 我的 Prettier 格式化工具

这是一个简化版的 Prettier 代码格式化 VSCode 插件，旨在学习 Prettier 和 JavaScript。

## 功能

- 支持通过命令格式化文档（Ctrl+Shift+P 然后输入"使用我的 Prettier 格式化代码"）
- 支持通过标准格式化快捷键（Shift+Alt+F）格式化文档
- 支持 JavaScript、TypeScript、JSX/TSX 和 JSON 文件格式化
- 自动检测和使用项目中的 .prettierrc 配置文件
- 提供合理的默认配置

## 安装

由于这是一个学习项目，您需要在本地开发和调试：

1. 克隆仓库
2. 运行 `npm install` 安装依赖
3. 在 VSCode 中按 F5 启动调试

## 使用方法

1. 打开任何 JavaScript、TypeScript 或 JSON 文件
2. 使用 VSCode 的格式化快捷键（Shift+Alt+F）
3. 或者打开命令面板（Ctrl+Shift+P），然后输入"使用我的 Prettier 格式化代码"

## 扩展点

本插件提供以下扩展点：

- 命令：`myPrettier.format` - 格式化当前文档
- 文档格式化提供者：支持 JavaScript、TypeScript 和 JSON 文件

## 学习重点

- 如何开发 VSCode 扩展
- 如何调用 Prettier API 进行代码格式化
- 如何处理各种文件类型和配置
- 基本的错误处理和用户反馈 