const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const myPrettier = require('./my-prettier');

// 测试文件路径
const testFilePath = path.join(__dirname, 'test.js');

// 读取测试文件内容
const sourceCode = fs.readFileSync(testFilePath, 'utf-8');

// 格式化配置
const config = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
};

async function runTest() {
  console.log('开始测试比较两种实现...\n');
  console.log('原始代码:');
  console.log('-'.repeat(80));
  console.log(sourceCode);
  console.log('-'.repeat(80));
  console.log('\n');

  try {
    // 使用官方 Prettier 格式化
    const officialResult = await prettier.format(sourceCode, {
      ...config,
      parser: 'babel',
      filepath: testFilePath,
    });

    // 使用我们自己实现的简易版 Prettier 格式化
    const myResult = myPrettier.format(sourceCode, config);

    // 输出结果
    console.log('官方 Prettier 格式化结果:');
    console.log('-'.repeat(80));
    console.log(officialResult);
    console.log('-'.repeat(80));
    console.log('\n');

    console.log('我的简易版 Prettier 格式化结果:');
    console.log('-'.repeat(80));
    console.log(myResult);
    console.log('-'.repeat(80));
    console.log('\n');

    // 比较差异
    const isDifferent = officialResult !== myResult;
    if (isDifferent) {
      console.log('两种实现的结果有差异！这是正常的，因为我们的实现是简化版。');
      
      // 保存两种实现的结果到文件，方便查看差异
      fs.writeFileSync('official-result.js', officialResult, 'utf-8');
      fs.writeFileSync('my-result.js', myResult, 'utf-8');
      console.log('已将两种结果分别保存到 official-result.js 和 my-result.js 文件中，可以使用差异比较工具查看具体差异。');
    } else {
      console.log('两种实现的结果完全一致！');
    }
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
}

// 运行测试
runTest(); 