/**
 * 我的简易版 Prettier 实现
 * 
 * 这是一个用于学习目的的简化版 Prettier 实现
 * 仅支持基本的 JavaScript 格式化
 */

// 词法分析器 - 将代码字符串转换为词法单元（tokens）
function tokenize(code) {
  const tokens = [];
  let current = 0;

  while (current < code.length) {
    let char = code[current];

    // 处理空白字符
    if (/\s/.test(char)) {
      let value = '';
      while (/\s/.test(char) && current < code.length) {
        value += char;
        char = code[++current];
      }
      tokens.push({ type: 'whitespace', value });
      continue;
    }

    // 处理注释
    if (char === '/' && code[current + 1] === '/') {
      let value = '//';
      current += 2;
      char = code[current];
      
      while (char !== '\n' && current < code.length) {
        value += char;
        char = code[++current];
      }
      
      tokens.push({ type: 'comment', value });
      continue;
    }

    // 处理标识符（变量名、函数名等）
    if (/[a-zA-Z_$]/.test(char)) {
      let value = '';
      while (/[a-zA-Z0-9_$]/.test(char) && current < code.length) {
        value += char;
        char = code[++current];
      }
      
      // 检查是否为关键字
      const keywords = ['if', 'else', 'for', 'while', 'function', 'return', 'const', 'let', 'var', 'class', 'new'];
      if (keywords.includes(value)) {
        tokens.push({ type: 'keyword', value });
      } else {
        tokens.push({ type: 'identifier', value });
      }
      continue;
    }

    // 处理数字
    if (/[0-9]/.test(char)) {
      let value = '';
      while (/[0-9.]/.test(char) && current < code.length) {
        value += char;
        char = code[++current];
      }
      tokens.push({ type: 'number', value });
      continue;
    }

    // 处理字符串
    if (char === '"' || char === "'" || char === '`') {
      const quote = char;
      let value = char;
      char = code[++current];
      
      while (char !== quote && current < code.length) {
        value += char;
        // 处理转义字符
        if (char === '\\' && current + 1 < code.length) {
          value += code[++current];
        }
        char = code[++current];
      }
      
      value += char; // 加上结束引号
      current++;
      tokens.push({ type: 'string', value });
      continue;
    }

    // 处理括号、花括号和方括号
    if (char === '(' || char === ')' || char === '{' || char === '}' || char === '[' || char === ']') {
      tokens.push({ type: 'bracket', value: char });
      current++;
      continue;
    }

    // 处理操作符
    if (/[+\-*/%=<>!&|^~?:.]/.test(char)) {
      let value = char;
      
      // 处理多字符操作符
      const next = code[current + 1];
      if (
        (char === '=' && next === '=') || 
        (char === '!' && next === '=') || 
        (char === '<' && next === '=') || 
        (char === '>' && next === '=') || 
        (char === '+' && next === '+') || 
        (char === '-' && next === '-') || 
        (char === '+' && next === '=') || 
        (char === '-' && next === '=') || 
        (char === '*' && next === '=') || 
        (char === '/' && next === '=') || 
        (char === '&' && next === '&') || 
        (char === '|' && next === '|') || 
        (char === '=' && next === '>')
      ) {
        value += next;
        current += 2;
      } else {
        current++;
      }
      
      tokens.push({ type: 'operator', value });
      continue;
    }

    // 处理分号和逗号
    if (char === ';' || char === ',') {
      tokens.push({ type: 'punctuation', value: char });
      current++;
      continue;
    }

    // 其他字符
    tokens.push({ type: 'other', value: char });
    current++;
  }

  return tokens;
}

// 语法分析和格式化
function formatTokens(tokens, options = {}) {
  // 合并默认选项
  const defaultOptions = {
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: false,
    trailingComma: 'none',
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'always',
  };
  
  options = { ...defaultOptions, ...options };
  
  // 缩进字符
  const indent = options.useTabs ? '\t' : ' '.repeat(options.tabWidth);
  let currentIndent = 0;
  let result = '';
  let line = '';
  let lastTokenType = null;
  let lastSignificantTokenType = null;
  let lastSignificantTokenValue = null;
  
  // 用于跟踪代码块级别
  let blockLevel = 0;
  
  // 添加当前行到结果，并重置行
  function addLine() {
    if (line.trim()) {
      result += (result ? '\n' : '') + (currentIndent > 0 ? indent.repeat(currentIndent) : '') + line.trimStart();
    } else if (result) {
      result += '\n';
    }
    line = '';
  }
  
  // 添加空格（如果需要）
  function addSpace() {
    if (line && !line.endsWith(' ')) {
      line += ' ';
    }
  }
  
  // 追踪括号的状态
  let openBrackets = [];
  let expectBlockStart = false;
  let isInObjectLiteral = false;
  
  // 处理每个词法单元
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const nextToken = i < tokens.length - 1 ? tokens[i + 1] : null;
    const prevToken = i > 0 ? tokens[i - 1] : null;
    
    switch (token.type) {
      case 'whitespace':
        // 只保留单个空格
        if (line && !line.endsWith(' ') && 
            lastSignificantTokenType !== 'bracket' && 
            (nextToken && nextToken.type !== 'punctuation')) {
          line += ' ';
        }
        break;
        
      case 'comment':
        // 注释前添加一个空格（如果不在行首）
        if (line.trim()) {
          addSpace();
        }
        line += token.value;
        addLine();
        break;
        
      case 'keyword':
        // 关键字前后通常需要空格
        if (line && lastTokenType !== 'whitespace' && 
            lastSignificantTokenType !== null && 
            !['if', 'for', 'while', 'function'].includes(token.value)) {
          addSpace();
        }
        line += token.value;
        
        // 记录是否应该期望块开始
        if (['if', 'for', 'while', 'function', 'class'].includes(token.value)) {
          expectBlockStart = true;
        }
        
        // 某些关键字后应该有空格
        if (nextToken && nextToken.type !== 'bracket' && nextToken.value !== ';' && nextToken.value !== ',') {
          line += ' ';
        }
        lastSignificantTokenType = 'keyword';
        lastSignificantTokenValue = token.value;
        break;
        
      case 'identifier':
        if (line && lastTokenType !== 'whitespace' && 
            lastSignificantTokenType !== null && 
            lastSignificantTokenType !== 'operator' && 
            lastSignificantTokenType !== 'bracket' &&
            lastSignificantTokenValue !== '.') {
          addSpace();
        }
        line += token.value;
        lastSignificantTokenType = 'identifier';
        lastSignificantTokenValue = token.value;
        break;
        
      case 'number':
        if (line && lastTokenType !== 'whitespace' && 
            lastSignificantTokenType !== null && 
            lastSignificantTokenType !== 'operator' && 
            lastSignificantTokenType !== 'bracket') {
          addSpace();
        }
        line += token.value;
        lastSignificantTokenType = 'number';
        lastSignificantTokenValue = token.value;
        break;
        
      case 'string':
        if (line && lastTokenType !== 'whitespace' && 
            lastSignificantTokenType !== null && 
            lastSignificantTokenType !== 'operator' && 
            lastSignificantTokenType !== 'bracket') {
          addSpace();
        }
        
        // 根据配置转换引号样式
        if (options.singleQuote && token.value.startsWith('"') && !token.value.includes("'")) {
          line += "'" + token.value.slice(1, -1) + "'";
        } else if (!options.singleQuote && token.value.startsWith("'") && !token.value.includes('"')) {
          line += '"' + token.value.slice(1, -1) + '"';
        } else {
          line += token.value;
        }
        lastSignificantTokenType = 'string';
        lastSignificantTokenValue = token.value;
        break;
        
      case 'bracket':
        if (token.value === '{') {
          // 检查是否是对象字面量
          isInObjectLiteral = (
            lastSignificantTokenType === 'operator' && lastSignificantTokenValue === '=' ||
            lastSignificantTokenType === 'punctuation' && lastSignificantTokenValue === ',' ||
            lastSignificantTokenType === 'bracket' && lastSignificantTokenValue === '(' ||
            lastSignificantTokenType === 'bracket' && lastSignificantTokenValue === '[' ||
            lastSignificantTokenType === 'punctuation' && lastSignificantTokenValue === ':'
          );
          
          // 花括号前添加空格（如果不是对象字面量开始）
          if (expectBlockStart) {
            if (line && !line.endsWith(' ')) {
              line += ' ';
            }
            line += token.value;
            blockLevel++;
            currentIndent++;
            addLine();
            expectBlockStart = false;
          } else {
            // 对象字面量的处理
            if (line && !line.endsWith(' ') && options.bracketSpacing) {
              line += ' ';
            }
            line += token.value;
            if (options.bracketSpacing) {
              line += ' ';
            }
            openBrackets.push('{');
            blockLevel++;
            if (!isInObjectLiteral) {
              currentIndent++;
              addLine();
            }
          }
        } else if (token.value === '}') {
          // 对象字面量结束或代码块结束
          if (openBrackets.length > 0 && openBrackets[openBrackets.length - 1] === '{') {
            openBrackets.pop();
          }
          
          if (isInObjectLiteral) {
            // 对象字面量结束
            if (options.bracketSpacing && !line.endsWith(' ')) {
              line += ' ';
            }
            line += token.value;
            isInObjectLiteral = false;
          } else {
            // 代码块结束
            if (line.trim()) {
              addLine();
            }
            blockLevel--;
            currentIndent--;
            line += token.value;
            
            // 检查后面是否有 else、catch 等需要保持在同一行的关键字
            const peekNext = nextToken && nextToken.type === 'whitespace' ? tokens[i + 2] : nextToken;
            if (peekNext && peekNext.type === 'keyword' && ['else', 'catch', 'finally'].includes(peekNext.value)) {
              line += ' ';
            } else {
              addLine();
            }
          }
        } else if (token.value === '(') {
          // 在特定情况下的括号前添加空格
          if (lastSignificantTokenType === 'keyword' && 
              ['if', 'for', 'while', 'switch'].includes(lastSignificantTokenValue)) {
            if (!line.endsWith(' ')) {
              line += ' ';
            }
          }
          
          line += token.value;
          openBrackets.push('(');
        } else if (token.value === ')') {
          line += token.value;
          if (openBrackets.length > 0 && openBrackets[openBrackets.length - 1] === '(') {
            openBrackets.pop();
          }
          
          // 检查是否是函数定义后的括号
          if (expectBlockStart) {
            // 不添加额外操作，保持括号之后紧接着的花括号
          }
        } else if (token.value === '[') {
          line += token.value;
          openBrackets.push('[');
        } else if (token.value === ']') {
          line += token.value;
          if (openBrackets.length > 0 && openBrackets[openBrackets.length - 1] === '[') {
            openBrackets.pop();
          }
        }
        lastSignificantTokenType = 'bracket';
        lastSignificantTokenValue = token.value;
        break;
        
      case 'operator':
        // 操作符前后通常加空格，除了一些特殊情况
        if (token.value !== '.' && token.value !== '++' && token.value !== '--') {
          if (line && !line.endsWith(' ')) {
            line += ' ';
          }
          
          line += token.value;
          
          // 箭头函数参数处理
          if (token.value === '=>' && nextToken && nextToken.type !== 'bracket' && nextToken.value !== '{') {
            line += ' ';
          } else if (token.value !== '.' && token.value !== '++' && token.value !== '--' && 
                   nextToken && nextToken.type !== 'whitespace' && nextToken.type !== 'punctuation') {
            line += ' ';
          }
        } else {
          // 特殊操作符（如.、++、--）不加空格
          line += token.value;
        }
        
        // 冒号特殊处理（对象属性）
        if (token.value === ':' && isInObjectLiteral) {
          if (!line.endsWith(' ')) {
            line += ' ';
          }
        }
        
        lastSignificantTokenType = 'operator';
        lastSignificantTokenValue = token.value;
        break;
        
      case 'punctuation':
        // 分号和逗号的处理
        if (token.value === ';') {
          line += token.value;
          addLine();
        } else if (token.value === ',') {
          line += token.value;
          // 逗号后添加空格
          if (nextToken && nextToken.type !== 'whitespace') {
            line += ' ';
          }
        } else {
          line += token.value;
        }
        lastSignificantTokenType = 'punctuation';
        lastSignificantTokenValue = token.value;
        break;
        
      default:
        line += token.value;
        lastSignificantTokenType = 'other';
        lastSignificantTokenValue = token.value;
    }
    
    // 检查行长度是否超过限制
    if (line.length > options.printWidth && token.type !== 'string') {
      addLine();
    }
    
    lastTokenType = token.type;
  }
  
  // 确保最后一行也被添加
  if (line.trim()) {
    addLine();
  }
  
  // 确保文件末尾有换行符
  if (!result.endsWith('\n')) {
    result += '\n';
  }
  
  return result;
}

/**
 * 自定义简易版 Prettier 格式化代码
 * @param {string} code - 要格式化的代码字符串
 * @param {Object} options - 格式化选项
 * @returns {string} - 格式化后的代码
 */
function format(code, options = {}) {
  const tokens = tokenize(code);
  return formatTokens(tokens, options);
}

module.exports = {
  format,
  tokenize,
  formatTokens
}; 