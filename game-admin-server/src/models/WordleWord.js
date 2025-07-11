const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WordleWord = sequelize.define('WordleWord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  word: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  normalized: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  is_target: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  syllable_structure: {
    type: DataTypes.JSON,
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('syllable_structure');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('syllable_structure', JSON.stringify(value));
    }
  }
}, {
  tableName: 'wordle_words',
  timestamps: true,
  underscored: true
});

// Hàm để chuyển đổi từ có dấu thành không dấu
WordleWord.normalize = function(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/\s+/g, "")
    .toUpperCase();
};

module.exports = WordleWord; 