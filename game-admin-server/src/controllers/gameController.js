const fs = require('fs').promises;
const path = require('path');
const WordleWord = require('../models/WordleWord');

/**
 * Lấy dữ liệu cho game Guess Who
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getGuessWhoData = async (req, res) => {
  try {
    // Đường dẫn đến file dữ liệu
    const dataPath = path.join(__dirname, '../../public/data/guessWhoData.json');
    
    // Đọc file dữ liệu
    const rawData = await fs.readFile(dataPath, 'utf8');
    const data = JSON.parse(rawData);
    
    // Thêm đường dẫn đầy đủ cho hình ảnh
    const serverUrl = `${req.protocol}://${req.get('host')}`;
    
    if (data.characters && Array.isArray(data.characters)) {
      data.characters = data.characters.map(character => {
        if (character.image && !character.image.startsWith('http')) {
          character.image = `${serverUrl}${character.image.startsWith('/') ? '' : '/'}${character.image}`;
        }
        return character;
      });
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu Guess Who:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Không thể lấy dữ liệu Guess Who' 
    });
  }
};

/**
 * Lấy dữ liệu cho game Universe Answer
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUniverseAnswerData = async (req, res) => {
  try {
    // Đường dẫn đến file dữ liệu
    const dataPath = path.join(__dirname, '../../public/data/universeAnswerData.json');
    
    // Đọc file dữ liệu
    const rawData = await fs.readFile(dataPath, 'utf8');
    const data = JSON.parse(rawData);
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu Universe Answer:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Không thể lấy dữ liệu Universe Answer' 
    });
  }
};

/**
 * Lấy dữ liệu cho game Wordle
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getWordleData = async (req, res) => {
  try {
    // Lấy từ từ database
    const words = await WordleWord.findAll({
      attributes: ['word', 'difficulty'],
      raw: true
    });
    
    // Nếu không có từ trong database, đọc từ file
    if (!words || words.length === 0) {
      // Đường dẫn đến file dữ liệu
      const dataPath = path.join(__dirname, '../../public/data/wordleData.json');
      
      // Đọc file dữ liệu
      const rawData = await fs.readFile(dataPath, 'utf8');
      const data = JSON.parse(rawData);
      
      return res.status(200).json(data);
    }
    
    // Trả về dữ liệu từ database
    return res.status(200).json({ words });
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu Wordle:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Không thể lấy dữ liệu Wordle' 
    });
  }
}; 