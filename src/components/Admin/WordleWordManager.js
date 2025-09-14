import React, { useState, useEffect } from 'react';
import { wordleWordAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';
import './WordleWordManager.css';

const WordleWordManager = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTarget, setFilterTarget] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [formData, setFormData] = useState({
    word: '',
    is_target: false,
    syllable_structure: ''
  });

  // Load danh sách từ vựng
  const loadWords = async (page = 1) => {
    setLoading(true);
    try {
      const options = {};
      if (searchTerm) options.search = searchTerm;
      if (filterTarget !== '') options.is_target = filterTarget;

      const response = await wordleWordAPI.getWords(page, pagination.limit, options);
      
      if (response.success) {
        setWords(response.data.words);
        setPagination(response.data.pagination);
      } else {
        showError(response.message || 'Không thể tải danh sách từ vựng');
      }
    } catch (error) {
      console.error('Lỗi khi tải từ vựng:', error);
      showError('Có lỗi xảy ra khi tải danh sách từ vựng');
    } finally {
      setLoading(false);
    }
  };

  // Tìm kiếm từ vựng
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    loadWords(1);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      word: '',
      is_target: false,
      syllable_structure: ''
    });
    setEditingWord(null);
    setShowAddForm(false);
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.word.trim()) {
      showError('Vui lòng nhập từ vựng');
      return;
    }

    setLoading(true);
    try {
      let response;
      
      if (editingWord) {
        response = await wordleWordAPI.updateWord(editingWord.id, formData);
      } else {
        response = await wordleWordAPI.addWord(formData);
      }

      if (response.success) {
        showSuccess(response.message);
        resetForm();
        loadWords(pagination.page);
      } else {
        showError(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Lỗi khi lưu từ vựng:', error);
      showError('Có lỗi xảy ra khi lưu từ vựng');
    } finally {
      setLoading(false);
    }
  };

  // Xóa từ vựng
  const handleDelete = async (word) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa từ "${word.word}"?`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await wordleWordAPI.deleteWord(word.id);
      
      if (response.success) {
        showSuccess(response.message);
        loadWords(pagination.page);
      } else {
        showError(response.message || 'Không thể xóa từ vựng');
      }
    } catch (error) {
      console.error('Lỗi khi xóa từ vựng:', error);
      showError('Có lỗi xảy ra khi xóa từ vựng');
    } finally {
      setLoading(false);
    }
  };

  // Chỉnh sửa từ vựng
  const handleEdit = (word) => {
    setFormData({
      word: word.word,
      is_target: word.is_target,
      syllable_structure: word.syllable_structure ? JSON.stringify(word.syllable_structure) : ''
    });
    setEditingWord(word);
    setShowAddForm(true);
  };

  // Load dữ liệu khi component mount
  useEffect(() => {
    loadWords();
  }, []);

  return (
    <div className="wordle-word-manager">
      <div className="header-section">
        <div className="title-section">
          <h2>🎯 Quản lý từ vựng Wordle</h2>
          <p>Tổng số từ vựng: {pagination.total}</p>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
          disabled={loading}
        >
          ➕ Thêm từ vựng
        </button>
      </div>

      {/* Form tìm kiếm */}
      <div className="search-section">
        <div className="search-controls">
          <input
            type="text"
            placeholder="Tìm kiếm từ vựng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          
          <select
            value={filterTarget}
            onChange={(e) => setFilterTarget(e.target.value)}
          >
            <option value="">Tất cả từ</option>
            <option value="true">Từ đích (Target)</option>
            <option value="false">Từ thường</option>
          </select>
          
          <button 
            className="btn btn-secondary"
            onClick={handleSearch}
            disabled={loading}
          >
            🔍 Tìm kiếm
          </button>
        </div>
      </div>

      {/* Form thêm/sửa từ vựng */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingWord ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng mới'}</h3>
              <button className="close-btn" onClick={resetForm}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="word-form">
              <div className="form-group">
                <label>Từ vựng *</label>
                <input
                  type="text"
                  value={formData.word}
                  onChange={(e) => setFormData({...formData, word: e.target.value})}
                  placeholder="Nhập từ vựng..."
                  required
                />
              </div>
              
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_target}
                    onChange={(e) => setFormData({...formData, is_target: e.target.checked})}
                  />
                  Từ đích (Target word)
                </label>
              </div>
              
              <div className="form-group">
                <label>Cấu trúc âm tiết (JSON)</label>
                <textarea
                  value={formData.syllable_structure}
                  onChange={(e) => setFormData({...formData, syllable_structure: e.target.value})}
                  placeholder='Ví dụ: {"syllables": ["học", "sinh"]}'
                  rows={3}
                />
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn btn-secondary">
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Đang lưu...' : (editingWord ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Danh sách từ vựng */}
      <div className="words-list">
        {loading && words.length === 0 ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <>
            <div className="words-table">
              <div className="table-header">
                <div>Từ vựng</div>
                <div>Từ chuẩn hóa</div>
                <div>Loại</div>
                <div>Ngày tạo</div>
                <div>Thao tác</div>
              </div>
              
              {words.map(word => (
                <div key={word.id} className="table-row">
                  <div className="word-cell">
                    <strong>{word.word}</strong>
                  </div>
                  <div>{word.normalized}</div>
                  <div>
                    <span className={`badge ${word.is_target ? 'target' : 'normal'}`}>
                      {word.is_target ? 'Từ đích' : 'Từ thường'}
                    </span>
                  </div>
                  <div>{new Date(word.created_at).toLocaleDateString('vi-VN')}</div>
                  <div className="actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(word)}
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(word)}
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Phân trang */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => loadWords(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                >
                  ← Trước
                </button>
                
                <span>
                  Trang {pagination.page} / {pagination.totalPages}
                </span>
                
                <button 
                  onClick={() => loadWords(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || loading}
                >
                  Sau →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default WordleWordManager;
