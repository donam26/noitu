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
    // Thêm câu hỏi "hỏi ngu" mới
    handleRequest(req, res, 'update-quiz-questions.js');
  } else if (req.method === 'PUT' && req.url === '/api/update-all-questions') {
    // Cập nhật toàn bộ danh sách "hỏi ngu" (cho edit/delete)
    handleRequest(req, res, 'update-all-questions.js');
  } else if (req.method === 'POST' && req.url === '/api/update-behavior-questions') {
    // Thêm câu hỏi ứng xử mới
    handleRequest(req, res, 'update-behavior-questions.js');
  } else if (req.method === 'PUT' && req.url === '/api/update-all-behavior-questions') {
    // Cập nhật toàn bộ danh sách ứng xử (cho edit/delete)
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const scriptPath = path.join(__dirname, '..', 'update-behavior-questions.js');
        const child = spawn('node', [scriptPath, 'replace'], { stdio: ['pipe', 'pipe', 'pipe'] });
        
        child.stdin.write(JSON.stringify(data));
        child.stdin.end();
        
        let output = '', errorOutput = '';
        child.stdout.on('data', (data) => { output += data.toString(); });
        child.stderr.on('data', (data) => { errorOutput += data.toString(); });
        
        child.on('close', (code) => {
          if (code === 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Cập nhật thành công', output }));
          } else {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: errorOutput || 'Lỗi khi cập nhật' }));
          }
        });
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
      }
    });
  } else if (req.method === 'POST' && req.url === '/api/update-knowledge-questions') {
    // Thêm câu hỏi kiến thức mới
    handleRequest(req, res, 'update-knowledge-questions.js');
  } else if (req.method === 'PUT' && req.url === '/api/update-all-knowledge-questions') {
    // Cập nhật toàn bộ danh sách kiến thức (cho edit/delete)
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const scriptPath = path.join(__dirname, '..', 'update-knowledge-questions.js');
        const child = spawn('node', [scriptPath, 'replace'], { stdio: ['pipe', 'pipe', 'pipe'] });
        
        child.stdin.write(JSON.stringify(data));
        child.stdin.end();
        
        let output = '', errorOutput = '';
        child.stdout.on('data', (data) => { output += data.toString(); });
        child.stderr.on('data', (data) => { errorOutput += data.toString(); });
        
        child.on('close', (code) => {
          if (code === 0) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Cập nhật thành công', output }));
          } else {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: errorOutput || 'Lỗi khi cập nhật' }));
          }
        });
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 API Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📝 Endpoints:`);
  console.log(`   POST /api/update-quiz-questions - Thêm câu hỏi "Hỏi Ngu"`);
  console.log(`   PUT  /api/update-all-questions - Cập nhật toàn bộ "Hỏi Ngu"`);
  console.log(`   POST /api/update-behavior-questions - Thêm câu hỏi "Ứng Xử"`);
  console.log(`   PUT  /api/update-all-behavior-questions - Cập nhật toàn bộ "Ứng Xử"`);
  console.log(`   POST /api/update-knowledge-questions - Thêm câu hỏi "Kiến Thức"`);
  console.log(`   PUT  /api/update-all-knowledge-questions - Cập nhật toàn bộ "Kiến Thức"`);
});

module.exports = server; 