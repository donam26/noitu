import React, { useState, useEffect, useCallback } from 'react';
import { guessWhoAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import GuessWhoCharacterForm from '../../components/Admin/GuessWhoCharacterForm';
import './AdminPages.css';

const GuessWhoAdminPage = () => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [deletingCharacter, setDeletingCharacter] = useState(null);

  const fetchCharacters = useCallback(async (page, search) => {
    setLoading(true);
    const response = await guessWhoAPI.getCharacters(page, 10, search);
    if (response.success) {
      setCharacters(response.data);
      setPagination(response.pagination);
      setError(null);
    } else {
      setError(response.message);
      showError(response.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCharacters(currentPage, searchTerm);
  }, [currentPage, searchTerm, fetchCharacters]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleOpenModal = (character = null) => {
    setEditingCharacter(character);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCharacter(null);
  };

  const handleSaveCharacter = async (formData) => {
    let response;
    if (editingCharacter) {
      response = await guessWhoAPI.updateCharacter(editingCharacter.id, formData);
    } else {
      response = await guessWhoAPI.createCharacter(formData);
    }

    if (response.success) {
      showSuccess(response.message || 'Lưu nhân vật thành công!');
      handleCloseModal();
      fetchCharacters(currentPage, searchTerm);
    } else {
      showError(response.message || 'Lưu nhân vật thất bại.');
    }
  };

  const handleDeleteClick = (character) => {
    setDeletingCharacter(character);
  };

  const confirmDelete = async () => {
    if (!deletingCharacter) return;
    const response = await guessWhoAPI.deleteCharacter(deletingCharacter.id);
    if (response.success) {
      showSuccess(response.message || 'Xóa nhân vật thành công!');
      setDeletingCharacter(null);
      fetchCharacters(currentPage, searchTerm);
    } else {
      showError(response.message || 'Xóa nhân vật thất bại.');
    }
  };

  if (error && !characters.length) return <div className="error-message">Lỗi: {error}</div>;

  return (
    <div className="admin-page">
      <h1 className="admin-page-title">Quản lý Nhân vật "Tôi là ai?"</h1>

      <div className="admin-page-controls">
        <input
          type="text"
          placeholder="Tìm kiếm nhân vật..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <Button onClick={() => handleOpenModal()} className="add-new-btn">+ Thêm nhân vật mới</Button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên nhân vật</th>
                <th>Giới tính</th>
                <th>Danh mục</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {characters.map(char => (
                <tr key={char.id}>
                  <td>{char.name}</td>
                  <td>{char.gender}</td>
                  <td>{char.category}</td>
                  <td>{char.is_active ? 'Hoạt động' : 'Ẩn'}</td>
                  <td className="action-buttons">
                    <Button size="small" onClick={() => handleOpenModal(char)}>Sửa</Button>
                    <Button size="small" variant="danger" onClick={() => handleDeleteClick(char)}>Xóa</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            currentPage={pagination.page || 1}
            totalPages={pagination.pages || 1}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {isModalOpen && (
        <Modal onClose={handleCloseModal} title={editingCharacter ? 'Sửa nhân vật' : 'Thêm nhân vật mới'}>
          <GuessWhoCharacterForm
            character={editingCharacter}
            onSave={handleSaveCharacter}
            onCancel={handleCloseModal}
          />
        </Modal>
      )}

      {deletingCharacter && (
        <Modal onClose={() => setDeletingCharacter(null)} title="Xác nhận xóa">
          <p>Bạn có chắc chắn muốn xóa nhân vật "{deletingCharacter.name}"?</p>
          <div className="form-actions">
            <Button variant="secondary" onClick={() => setDeletingCharacter(null)}>Hủy</Button>
            <Button variant="danger" onClick={confirmDelete}>Xóa</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default GuessWhoAdminPage;

