// 这是一个测试文件，用于验证 Prettier 插件是否正常工作
// 故意写得不规范

function add(a,b){return a+b}

const obj = {foo:"bar",baz:42,qux:   true};

const arr = [1,2,3,   4,    5];

if(true){
  console.log("这行缩进不正确");
console.log("这行缩进也不正确");
}

// 箭头函数没有括号
const double = x => x * 2;

// 字符串引号不一致
const message = "Hello, " + 'world!';

// 行太长
const longString = "这是一个非常长的字符串，为了测试 Prettier 是否能够正确处理长行，我们故意让它超过了默认的 80 个字符宽度限制。";

class Example {
    constructor(value) {
        this.value = value;
    }
    
    getValue() { return this.value }
} 