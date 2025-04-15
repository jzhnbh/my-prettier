const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 检查是否安装了 vsce
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