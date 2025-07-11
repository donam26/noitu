const { sequelize } = require('../config/database');
const Admin = require('./Admin');
const QuizQuestion = require('./QuizQuestion');
const BehaviorQuestion = require('./BehaviorQuestion');
const KnowledgeQuestion = require('./KnowledgeQuestion');
const WordleWord = require('./WordleWord');

// Đảm bảo các model đã được khởi tạo trước khi thiết lập quan hệ
const models = {
  Admin,
  QuizQuestion,
  BehaviorQuestion,
  KnowledgeQuestion,
  WordleWord
};

// Thiết lập các mối quan hệ
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Thiết lập quan hệ thủ công
models.Admin.hasMany(models.QuizQuestion, { foreignKey: 'created_by' });
models.QuizQuestion.belongsTo(models.Admin, { foreignKey: 'created_by' });

models.Admin.hasMany(models.BehaviorQuestion, { foreignKey: 'created_by' });
models.BehaviorQuestion.belongsTo(models.Admin, { foreignKey: 'created_by' });

models.Admin.hasMany(models.KnowledgeQuestion, { foreignKey: 'created_by' });
models.KnowledgeQuestion.belongsTo(models.Admin, { foreignKey: 'created_by' });

// Hàm để đồng bộ hóa tất cả các model với database
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Đồng bộ database thành công');
  } catch (error) {
    console.error('❌ Lỗi khi đồng bộ database:', error);
  }
};

// Export tất cả các model
module.exports = {
  sequelize,
  ...models,
  syncDatabase
}; 