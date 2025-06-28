const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 3001;

// Helper function để xử lý requests
function handleRequest(req, res, scriptName) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      
      // Gọi script cập nhật file
      const scriptPath = path.join(__dirname, '..', scriptName);
      const child = spawn('node', [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      // Gửi dữ liệu vào stdin
      child.stdin.write(JSON.stringify(data));
      child.stdin.end();
      
      let output = '';
      let errorOutput = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: true, 
            message: 'Đã cập nhật file thành công',
            output: output 
          }));
        } else {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            error: errorOutput || 'Lỗi khi cập nhật file' 
          }));
        }
      });
      
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        error: 'Invalid JSON' 
      }));
    }
  });
}

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/update-quiz-questions') {
    // Thêm câu hỏi mới
    handleRequest(req, res, 'update-quiz-questions.js');
  } else if (req.method === 'PUT' && req.url === '/api/update-all-questions') {
    // Cập nhật toàn bộ danh sách (cho edit/delete)
    handleRequest(req, res, 'update-all-questions.js');
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 API Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📝 Endpoint: POST /api/update-quiz-questions`);
});

module.exports = server; 