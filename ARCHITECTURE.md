# 我的 Prettier 插件 - 架构和设计

本文档解释了这个简化版 Prettier VSCode 插件的设计思路和实现细节，帮助理解代码格式化的工作原理。

## 项目结构

```
my-prettier/
├── .vscode/                   # VSCode 配置
│   ├── launch.json            # 调试配置
│   └── tasks.json             # 任务配置
├── extension.js               # 插件主入口
├── my-prettier.js             # 自定义实现的简易版 Prettier
├── package.json               # 项目配置和依赖
├── .prettierrc                # Prettier 配置示例
├── test.js                    # 测试文件（包含各种格式化场景）
├── test-my-prettier.js        # 测试工具（比较官方与自定义实现）
├── README.md                  # 项目说明
└── .vscodeignore              # 发布时忽略的文件
```

## 核心组件

### 1. VSCode 插件集成 (extension.js)

这个文件是整个扩展的入口点，它定义了：

- 插件激活函数 `activate`：注册命令和格式化提供者
- 两个命令：
  - `myPrettier.format`：使用官方 Prettier 格式化
  - `myPrettier.formatWithMyImplementation`：使用我们自己实现的简易版 Prettier 格式化
- 文档格式化提供者：处理 VSCode 的格式化请求
- 格式化逻辑：包括配置解析、调用 Prettier API 等

### 2. 简易版 Prettier 实现 (my-prettier.js)

自己实现的简化版 Prettier，分为三个主要部分：

1. **词法分析器 (tokenize)**：
   - 将源代码分解为词法单元（tokens）
   - 识别关键字、标识符、字符串、数字、操作符等

2. **格式化器 (formatTokens)**：
   - 根据词法单元和配置生成格式化后的代码
   - 处理缩进、空格、换行等

3. **主格式化函数 (format)**：
   - 对外提供的 API
   - 将词法分析和格式化阶段组合起来

## 工作流程

1. 用户在 VSCode 中按下格式化快捷键或调用格式化命令
2. VSCode 调用我们注册的格式化提供者
3. 根据用户配置选择使用官方 Prettier 或自定义实现
4. 读取文档内容和相关配置
5. 调用选定的格式化器处理代码
6. 用格式化后的内容替换编辑器中的原始内容

## 简易版 Prettier 实现的工作原理

### 1. 词法分析阶段

词法分析是将源代码文本转换为有意义的词法单元（tokens）的过程：

```javascript
// 源代码: function add(a, b) { return a + b; }

// 词法分析后:
[
  { type: 'keyword', value: 'function' },
  { type: 'whitespace', value: ' ' },
  { type: 'identifier', value: 'add' },
  { type: 'bracket', value: '(' },
  { type: 'identifier', value: 'a' },
  { type: 'punctuation', value: ',' },
  { type: 'whitespace', value: ' ' },
  { type: 'identifier', value: 'b' },
  { type: 'bracket', value: ')' },
  { type: 'whitespace', value: ' ' },
  { type: 'bracket', value: '{' },
  { type: 'whitespace', value: ' ' },
  { type: 'keyword', value: 'return' },
  { type: 'whitespace', value: ' ' },
  { type: 'identifier', value: 'a' },
  { type: 'whitespace', value: ' ' },
  { type: 'operator', value: '+' },
  { type: 'whitespace', value: ' ' },
  { type: 'identifier', value: 'b' },
  { type: 'punctuation', value: ';' },
  { type: 'whitespace', value: ' ' },
  { type: 'bracket', value: '}' }
]
```

### 2. 格式化阶段

格式化阶段根据词法单元和用户配置重新生成代码：

1. 处理括号和缩进
2. 控制空格的添加位置
3. 处理换行
4. 应用用户配置（如引号样式、分号等）

### 3. 与官方 Prettier 的区别

官方 Prettier 使用了更复杂的算法：

1. **AST 解析**：不仅进行词法分析，还构建完整的抽象语法树
2. **布局算法**：使用复杂的布局算法决定如何格式化代码
3. **重打印**：从 AST 重新生成代码而不是仅基于词法单元
4. **更全面的特性**：支持更多语言和特殊语法

我们的简化版专注于基本的 JavaScript 格式化，通过更直接的方式处理常见格式化需求。

## 扩展功能的方式

想要扩展这个简化版 Prettier 插件，可以：

1. 在 `my-prettier.js` 中增强词法分析器，识别更多语法结构
2. 完善格式化规则，处理更复杂的代码模式
3. 添加对更多语言的支持
4. 增加更多配置选项

## 学习要点

通过这个项目，你可以学习：

1. VSCode 扩展开发的基础知识
2. 代码格式化的基本原理
3. 词法分析的实现方法
4. JavaScript 中的字符串处理和正则表达式
5. 如何集成和调用第三方库（官方 Prettier） 