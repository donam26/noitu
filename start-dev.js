#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Khởi động Game Hub Development Environment...\n');

// Khởi động API server
console.log('📡 Đang khởi động API Server...');
const apiServer = spawn('node', [path.join(__dirname, 'public', 'api-server.js')], {
  stdio: 'inherit'
});

// Đợi một chút để API server khởi động
setTimeout(() => {
  console.log('\n⚛️  Đang khởi động React App...');
  
  // Khởi động React app
  const reactApp = spawn('npm', ['start'], {
    stdio: 'inherit',
    shell: true
  });

  // Xử lý thoát
  process.on('SIGINT', () => {
    console.log('\n🛑 Đang dừng servers...');
    apiServer.kill();
    reactApp.kill();
    process.exit(0);
  });

  reactApp.on('exit', () => {
    apiServer.kill();
    process.exit(0);
  });

  apiServer.on('exit', () => {
    reactApp.kill();
    process.exit(0);
  });

}, 2000);

console.log('\n📝 Hướng dẫn sử dụng:');
console.log('- React App: http://localhost:3000');
console.log('- API Server: http://localhost:3001');
console.log('- Admin Panel: http://localhost:3000/admin');
console.log('\n🤖 AI Assistant sẽ lưu câu hỏi trực tiếp vào file quizQuestions.js');
console.log('📋 Nhấn Ctrl+C để dừng tất cả servers\n'); 