import React, { useState, useEffect, useCallback, useRef } from 'react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { gameDataAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';
import './QuizManager.css';
import './WordChainManager.css';

/**
 * Component quản lý từ vựng cho game nối từ
 */
const WordChainManager = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20, // Tăng số lượng từ trên mỗi trang
    total: 0,
    totalPages: 0
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [currentWord, setCurrentWord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [importData, setImportData] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState('');
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    word: '',
    meaning: ''
  });
  
  // Load danh sách từ
  const loadWords = useCallback(async () => {
    setLoading(true);
    try {
      const { page, limit } = pagination;
      const response = await gameDataAPI.getWordChainWords(page, limit, searchTerm);
      
      if (response.success && response.data) {
        setWords(response.data.words);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages
        }));
      } else {
        showError('Không thể tải danh sách từ');
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách từ:', error);
      showError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm]);
  
  // Load từ khi component mount và khi tham số thay đổi
  useEffect(() => {
    loadWords();
  }, [loadWords]);
  
  // Chuyển trang
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };
  
  // Mở modal thêm từ mới
  const handleOpenAddModal = () => {
    setFormData({
      word: '',
      meaning: ''
    });
    setShowAddModal(true);
  };

  // Mở modal import JSON
  const handleOpenImportModal = () => {
    setImportData('');
    setShowImportModal(true);
  };
  
  // Mở modal sửa từ
  const handleOpenEditModal = (word) => {
    setCurrentWord(word);
    setFormData({
      word: word.word,
      meaning: word.meaning || ''
    });
    setShowEditModal(true);
  };
  
  // Mở modal xóa từ
  const handleOpenDeleteModal = (word) => {
    setCurrentWord(word);
    setShowDeleteModal(true);
  };
  
  // Đóng tất cả modal
  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowImportModal(false);
    setCurrentWord(null);
  };
  
  // Xử lý thêm từ mới
  const handleAddWord = async (e) => {
    e.preventDefault();
    
    if (!formData.word.trim()) {
      showError('Vui lòng nhập từ cần thêm');
      return;
    }
    
    try {
      const response = await gameDataAPI.addWordChainWord({
        word: formData.word.trim(),
        meaning: formData.meaning.trim()
      });
      
      if (response.success) {
        showSuccess(`Đã thêm từ "${formData.word}" thành công`);
        handleCloseModals();
        loadWords();
      } else {
        showError(response.message || 'Không thể thêm từ mới');
      }
    } catch (error) {
      console.error('Lỗi khi thêm từ mới:', error);
      showError('Lỗi kết nối server');
    }
  };
  
  // Xử lý cập nhật từ
  const handleEditWord = async (e) => {
    e.preventDefault();
    
    if (!currentWord) return;
    
    try {
      // Bây giờ gửi cả từ và nghĩa lên server
      const response = await gameDataAPI.updateWordChainWord(currentWord.id, {
        word: formData.word.trim(),
        meaning: formData.meaning.trim()
      });
      
      if (response.success) {
        showSuccess(response.message || `Đã cập nhật từ thành công`);
        handleCloseModals();
        loadWords();
      } else {
        showError(response.message || 'Không thể cập nhật từ');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật từ:', error);
      showError('Lỗi kết nối server');
    }
  };
  
  // Xử lý xóa từ
  const handleDeleteWord = async () => {
    if (!currentWord) return;
    
    try {
      const response = await gameDataAPI.deleteWordChainWord(currentWord.id);
      
      if (response.success) {
        showSuccess(`Đã xóa từ "${currentWord.word}" thành công`);
        handleCloseModals();
        loadWords();
      } else {
        showError(response.message || 'Không thể xóa từ');
      }
    } catch (error) {
      console.error('Lỗi khi xóa từ:', error);
      showError('Lỗi kết nối server');
    }
  };
  
  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    // loadWords sẽ tự động được gọi qua dependency của useEffect
  };

  // Xử lý import file JSON
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportProgress(`Đang đọc file ${file.name} (${Math.round(file.size/1024)} KB)...`);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        setImportData(event.target.result);
        setImportProgress('');
      } catch (error) {
        showError('Không thể đọc file');
        setImportProgress('');
      }
    };
    reader.readAsText(file);
  };

  // Xử lý import từ vựng từ JSON
  const handleImportWords = async () => {
    if (!importData) {
      showError('Vui lòng chọn file hoặc nhập dữ liệu JSON');
      return;
    }

    try {
      setImportLoading(true);
      setImportProgress('Đang phân tích dữ liệu JSON...');
      let wordsData;
      
      try {
        wordsData = JSON.parse(importData);
      } catch (error) {
        showError('Dữ liệu JSON không hợp lệ');
        setImportLoading(false);
        setImportProgress('');
        return;
      }

      if (!Array.isArray(wordsData)) {
        showError('Dữ liệu phải là một mảng các từ');
        setImportLoading(false);
        setImportProgress('');
        return;
      }

      // Thông báo cho người dùng biết đang bắt đầu import
      setImportProgress(`Đang chuẩn bị import ${wordsData.length} từ...`);
      
      // Kiểm tra dữ liệu trước khi gửi
      const validWords = wordsData.filter(item => {
        // Kiểm tra item có đúng cấu trúc không
        if (!item || typeof item !== 'object') return false;
        // Kiểm tra item có thuộc tính 'word' không
        if (!item.word || typeof item.word !== 'string' || item.word.trim() === '') return false;
        return true;
      });
      
      if (validWords.length === 0) {
        showError('Không có từ hợp lệ nào để import');
        setImportLoading(false);
        setImportProgress('');
        return;
      }
      
      if (validWords.length !== wordsData.length) {
        showError(`Có ${wordsData.length - validWords.length} từ không hợp lệ sẽ bị bỏ qua`);
      }

      setImportProgress(`Đang gửi ${validWords.length} từ đến server...`);

      // Sử dụng API bulk import
      const response = await gameDataAPI.bulkImportWordChainWords(validWords);
      
      if (response.success) {
        const { successCount, errorCount, totalProcessed } = response.data;
        
        setImportProgress(`Đã import thành công ${successCount}/${totalProcessed} từ`);
        
        if (successCount > 0) {
          showSuccess(`Đã nhập thành công ${successCount}/${totalProcessed} từ mới`);
          setTimeout(() => {
            handleCloseModals();
            loadWords();
          }, 1500); // Chờ 1.5s để người dùng đọc thông báo
        } else {
          showError('Không có từ nào được import thành công');
          setImportProgress('');
        }

        if (errorCount > 0) {
          showError(`Không thể nhập ${errorCount}/${totalProcessed} từ (có thể đã tồn tại)`);
        }
      } else {
        showError(response.message || 'Lỗi khi thực hiện import');
        setImportProgress('');
      }
    } catch (error) {
      console.error('Lỗi khi import từ:', error);
      showError('Lỗi khi thực hiện import: ' + (error.message || 'Không xác định'));
      setImportProgress('');
    } finally {
      setImportLoading(false);
    }
  };
  
  // Hiển thị nút phân trang
  const renderPagination = () => {
    const { page, totalPages } = pagination;
    
    return (
      <div className="pagination">
        <Button
          variant="secondary"
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
        >
          &#8592; Trang trước
        </Button>
        
        <span className="page-info">
          Trang {page} / {totalPages || 1}
        </span>
        
        <Button
          variant="secondary"
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Trang sau &#8594;
        </Button>
      </div>
    );
  };
  
  return (
    <div className="quiz-manager">
      <div className="quiz-header">
        <div className="quiz-title">
          <h2>Quản lý từ vựng - Game nối từ</h2>
          <p>Thêm, sửa, xóa từ vựng cho trò chơi nối từ</p>
        </div>
        <div className="quiz-actions">
          <Button 
            variant="primary" 
            onClick={handleOpenAddModal}
            className="add-btn"
          >
            + Thêm từ mới
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleOpenImportModal}
            className="import-btn"
            style={{ marginLeft: '10px' }}
          >
            Import từ JSON
          </Button>
        </div>
      </div>
      
      <div className="search-section">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm từ..."
            className="search-input"
          />
          <Button 
            type="submit" 
            variant="primary"
            className="search-btn"
          >
            Tìm kiếm
          </Button>
        </form>
      </div>
      
      <div className="word-grid">
        {loading ? (
          <div className="empty-state">
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : words.length > 0 ? (
          words.map((word, index) => (
            <div key={word.id} className="word-item">
              <div className="word-content">
                <div className="word-main">
                  <span className="word-number">#{(pagination.page - 1) * pagination.limit + index + 1}</span>
                  <span className="word-text">{word.word}</span>
                </div>
                <div className="word-meaning">{word.meaning || "Chưa có nghĩa"}</div>
                <div className="word-info">
                  <span className="word-syllable">Âm đầu: {word.first_syllable || 'N/A'}</span>
                  <span className="word-syllable">Âm cuối: {word.last_syllable || 'N/A'}</span>
                </div>
              </div>
              <div className="word-actions">
                <Button 
                  variant="secondary" 
                  size="small" 
                  onClick={() => handleOpenEditModal(word)}
                  className="edit-btn"
                >
                  Sửa
                </Button>
                <Button 
                  variant="danger" 
                  size="small" 
                  onClick={() => handleOpenDeleteModal(word)}
                  className="delete-btn"
                >
                  Xóa
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>Không tìm thấy từ vựng nào</p>
          </div>
        )}
      </div>
      
      {pagination.totalPages > 0 && renderPagination()}
      
      {/* Modal thêm từ mới */}
      <Modal
        isOpen={showAddModal}
        title="Thêm từ mới"
        onClose={handleCloseModals}
        cancelText="Hủy"
      >
        <form onSubmit={handleAddWord} className="word-form">
          <div className="form-group">
            <label htmlFor="word">Từ:</label>
            <input
              id="word"
              type="text"
              value={formData.word}
              onChange={(e) => setFormData({ ...formData, word: e.target.value })}
              required
              placeholder="Nhập từ mới..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="meaning">Ý nghĩa:</label>
            <textarea
              id="meaning"
              value={formData.meaning}
              onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
              placeholder="Nhập ý nghĩa (không bắt buộc)..."
              rows="3"
            />
          </div>
          <div className="word-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModals}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Thêm
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Thay đổi modal sửa từ */}
      <Modal
        isOpen={showEditModal}
        title="Sửa từ vựng"
        onClose={handleCloseModals}
        cancelText="Hủy"
      >
        <form onSubmit={handleEditWord} className="word-form">
          <div className="form-group">
            <label htmlFor="edit-word">Từ:</label>
            <input
              id="edit-word"
              type="text"
              value={formData.word}
              onChange={(e) => setFormData({ ...formData, word: e.target.value })}
              placeholder="Nhập từ mới..."
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-meaning">Ý nghĩa:</label>
            <textarea
              id="edit-meaning"
              value={formData.meaning}
              onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
              placeholder="Nhập ý nghĩa (không bắt buộc)..."
              rows="3"
            />
          </div>
          <div className="word-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModals}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
            >
              Cập nhật
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Modal xác nhận xóa */}
      <Modal
        isOpen={showDeleteModal}
        title="Xác nhận xóa từ"
        onClose={handleCloseModals}
        cancelText="Hủy"
      >
        <div className="confirm-delete">
          <p>Bạn có chắc chắn muốn xóa từ "<strong>{currentWord?.word || ''}</strong>" không?</p>
          <p>Hành động này không thể hoàn tác.</p>
          <div className="word-actions">
            <Button
              variant="secondary"
              onClick={handleCloseModals}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteWord}
            >
              Xóa
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal import từ JSON */}
      <Modal
        isOpen={showImportModal}
        title="Import từ vựng từ JSON"
        onClose={handleCloseModals}
        cancelText="Hủy"
      >
        <div className="import-section">
          <div className="form-group">
            <label>Chọn file JSON:</label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="file-input"
              disabled={importLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="json-data">Hoặc dán dữ liệu JSON:</label>
            <textarea
              id="json-data"
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder='[{"word": "xin chào", "meaning": "hello"}]'
              rows="10"
              className="json-textarea"
              disabled={importLoading}
            />
          </div>
          
          {importProgress && (
            <div className="import-progress">
              <p>{importProgress}</p>
              {importLoading && <div className="progress-indicator"></div>}
            </div>
          )}
          
          <div className="import-info">
            <p>Định dạng JSON yêu cầu:</p>
            <pre>{`[
  {
    "word": "xin chào",
    "meaning": "Lời chào hỏi thông thường"
  },
  {
    "word": "hẹn gặp lại",
    "meaning": "Lời chào tạm biệt"
  }
]`}</pre>
          </div>
          
          <div className="word-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModals}
              disabled={importLoading}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleImportWords}
              disabled={importLoading}
            >
              {importLoading ? 'Đang import...' : 'Import'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WordChainManager; 