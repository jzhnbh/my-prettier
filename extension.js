const vscode = require('vscode');
const prettier = require('prettier');
const myPrettier = require('./my-prettier');
const path = require('path');
const fs = require('fs');

/**
 * 激活扩展
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('恭喜，您的扩展"my-prettier"已被激活！');

  // 注册格式化命令
  let disposable = vscode.commands.registerCommand('myPrettier.format', function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('没有打开的编辑器');
      return;
    }

    const document = editor.document;
    formatDocument(document).then(
      (formattedText) => {
        if (formattedText) {
          const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
          );
          
          editor.edit(editBuilder => {
            editBuilder.replace(fullRange, formattedText);
          }).then(success => {
            if (success) {
              vscode.window.showInformationMessage('格式化成功！');
            } else {
              vscode.window.showErrorMessage('格式化失败');
            }
          });
        }
      },
      (error) => {
        vscode.window.showErrorMessage(`格式化出错: ${error.message}`);
      }
    );
  });

  // 另一个命令：使用自己实现的简易版 Prettier
  let myImplementationCommand = vscode.commands.registerCommand('myPrettier.formatWithMyImplementation', function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('没有打开的编辑器');
      return;
    }

    const document = editor.document;
    formatDocumentWithMyImplementation(document).then(
      (formattedText) => {
        if (formattedText) {
          const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
          );
          
          editor.edit(editBuilder => {
            editBuilder.replace(fullRange, formattedText);
          }).then(success => {
            if (success) {
              vscode.window.showInformationMessage('使用我的实现格式化成功！');
            } else {
              vscode.window.showErrorMessage('格式化失败');
            }
          });
        }
      },
      (error) => {
        vscode.window.showErrorMessage(`格式化出错: ${error.message}`);
      }
    );
  });

  // 注册文档格式化提供者
  const documentSelector = [
    { scheme: 'file', language: 'javascript' },
    { scheme: 'file', language: 'javascriptreact' },
    { scheme: 'file', language: 'typescript' },
    { scheme: 'file', language: 'typescriptreact' },
    { scheme: 'file', language: 'json' }
  ];

  const formatProvider = vscode.languages.registerDocumentFormattingEditProvider(
    documentSelector,
    {
      provideDocumentFormattingEdits(document) {
        return new Promise((resolve, reject) => {
          const config = vscode.workspace.getConfiguration('myPrettier');
          const useMyImplementation = config.get('useMyImplementation', false);
          
          const formatPromise = useMyImplementation 
            ? formatDocumentWithMyImplementation(document) 
            : formatDocument(document);
          
          formatPromise.then(
            (formattedText) => {
              if (formattedText) {
                const fullRange = new vscode.Range(
                  document.positionAt(0),
                  document.positionAt(document.getText().length)
                );
                resolve([vscode.TextEdit.replace(fullRange, formattedText)]);
              } else {
                resolve([]);
              }
            },
            (error) => {
              reject(error);
            }
          );
        });
      }
    }
  );

  context.subscriptions.push(disposable, myImplementationCommand, formatProvider);
}

/**
 * 使用 Prettier 格式化文档
 * @param {vscode.TextDocument} document 
 * @returns {Promise<string>}
 */
async function formatDocument(document) {
  const text = document.getText();
  const fileName = document.fileName;
  const fileExtension = path.extname(fileName);
  
  try {
    // 根据文件类型获取对应的解析器
    const parser = getParserFromFileExtension(fileExtension);
    
    // 尝试查找本地 .prettierrc 配置文件
    const configPath = await prettier.resolveConfigFile(fileName);
    const options = configPath 
      ? await prettier.resolveConfig(fileName) 
      : getDefaultPrettierOptions();
    
    // 合并配置并添加解析器类型
    const formattingOptions = {
      ...options,
      parser,
      filepath: fileName,
    };
    
    // 调用 Prettier 进行格式化
    return prettier.format(text, formattingOptions);
  } catch (error) {
    console.error('格式化错误:', error);
    throw error;
  }
}

/**
 * 使用自己实现的简易版 Prettier 格式化文档
 * @param {vscode.TextDocument} document 
 * @returns {Promise<string>}
 */
async function formatDocumentWithMyImplementation(document) {
  const text = document.getText();
  
  try {
    // 从 VSCode 设置中获取 Prettier 配置
    const config = vscode.workspace.getConfiguration('prettier');
    const myPrettierConfig = {
      printWidth: config.get('printWidth', 80),
      tabWidth: config.get('tabWidth', 2),
      useTabs: config.get('useTabs', false),
      semi: config.get('semi', true),
      singleQuote: config.get('singleQuote', false),
      trailingComma: config.get('trailingComma', 'es5'),
      bracketSpacing: config.get('bracketSpacing', true),
      bracketSameLine: config.get('bracketSameLine', false),
      arrowParens: config.get('arrowParens', 'always'),
    };
    
    // 调用我们自己实现的格式化函数
    return myPrettier.format(text, myPrettierConfig);
  } catch (error) {
    console.error('使用自定义实现格式化时出错:', error);
    throw error;
  }
}

/**
 * 根据文件扩展名获取合适的解析器
 * @param {string} fileExtension 
 * @returns {string}
 */
function getParserFromFileExtension(fileExtension) {
  switch (fileExtension) {
    case '.js':
      return 'babel';
    case '.jsx':
      return 'babel';
    case '.ts':
      return 'typescript';
    case '.tsx':
      return 'typescript';
    case '.json':
      return 'json';
    default:
      return 'babel'; // 默认使用 babel 解析器
  }
}

/**
 * 获取默认的 Prettier 配置选项
 * @returns {Object}
 */
function getDefaultPrettierOptions() {
  return {
    printWidth: 80, // 每行代码的最大字符数
    tabWidth: 2, // Tab 缩进大小
    useTabs: false, // 使用空格而不是 Tab 缩进
    semi: true, // 语句末尾添加分号
    singleQuote: false, // 使用双引号
    quoteProps: 'as-needed', // 对象属性引号按需添加
    jsxSingleQuote: false, // JSX 中使用双引号
    trailingComma: 'es5', // ES5 中合法的尾随逗号（数组、对象等）
    bracketSpacing: true, // 对象字面量中的括号之间添加空格
    bracketSameLine: false, // 多行 JSX 的 > 放在最后一行的末尾，而不是另起一行
    arrowParens: 'always', // 箭头函数始终包含参数括号
    endOfLine: 'lf', // 使用 Linux 风格的换行符
  };
}

// 停用函数
function deactivate() {}

module.exports = {
  activate,
  deactivate
}; 