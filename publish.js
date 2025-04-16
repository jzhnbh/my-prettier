const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { createSimpleIcon } = require('./create-simple-icon');

// 清理临时文件
console.log('清理生成的测试文件...');
const filesToDelete = [
  'test-formatted.js',
  'official-result.js',
  'my-result.js',
];

filesToDelete.forEach((file) => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      console.log(`已删除: ${file}`);
    } catch (err) {
      console.error(`删除文件 ${file} 时出错:`, err);
    }
  }
});

// 生成 PNG 图标
try {
  createSimpleIcon();
} catch (error) {
  console.error('生成图标时出错:', error);
  process.exit(1);
}

// 检查 vsce 是否安装
try {
  execSync('vsce --version', { stdio: 'ignore' });
} catch (error) {
  console.log('正在安装 vsce...');
  execSync('npm install -g @vscode/vsce', { stdio: 'inherit' });
}

// 确保 node_modules 是最新的
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('正在安装依赖...');
  execSync('npm install', { stdio: 'inherit' });
}

// 打包扩展
console.log('正在打包扩展...');
try {
  execSync('vsce package', { stdio: 'inherit' });
  console.log('打包成功！');
} catch (error) {
  console.error('打包失败:', error.message);
  process.exit(1);
}

// 询问是否要发布
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question('是否要发布插件到 VSCode 市场? (y/n) ', (answer) => {
  if (answer.toLowerCase() === 'y') {
    try {
      console.log('正在发布插件...');
      execSync('vsce publish', { stdio: 'inherit' });
      console.log('发布成功！');
    } catch (error) {
      console.error('发布失败:', error.message);
    }
  } else {
    console.log('跳过发布，仅生成了 .vsix 文件');
  }
  readline.close();
});
