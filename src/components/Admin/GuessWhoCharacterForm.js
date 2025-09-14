import React, { useState, useEffect } from 'react';
import Button from '../common/Button';
import './AdminForm.css';

const GuessWhoCharacterForm = ({ character, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    category: 'Nhân vật',
    hint1: '',
    hint2: '',
    hint3: '',
    hint4: '',
    is_active: true,
  });

  useEffect(() => {
    if (character) {
      setFormData(character);
    }
  }, [character]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="form-group">
        <label>Tên nhân vật</label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Giới tính</label>
        <select name="gender" value={formData.gender} onChange={handleChange}>
          <option value="male">Nam</option>
          <option value="female">Nữ</option>
          <option value="other">Khác</option>
        </select>
      </div>
      <div className="form-group">
        <label>Danh mục</label>
        <input type="text" name="category" value={formData.category} onChange={handleChange} />
      </div>
      <div className="form-group">
        <label>Gợi ý 1</label>
        <textarea name="hint1" value={formData.hint1} onChange={handleChange}></textarea>
      </div>
      <div className="form-group">
        <label>Gợi ý 2</label>
        <textarea name="hint2" value={formData.hint2} onChange={handleChange}></textarea>
      </div>
      <div className="form-group">
        <label>Gợi ý 3</label>
        <textarea name="hint3" value={formData.hint3} onChange={handleChange}></textarea>
      </div>
       <div className="form-group">
        <label>Gợi ý 4</label>
        <textarea name="hint4" value={formData.hint4} onChange={handleChange}></textarea>
      </div>
      <div className="form-group form-group-checkbox">
        <label>
          <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
          Đang hoạt động
        </label>
      </div>
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>Hủy</Button>
        <Button type="submit">Lưu</Button>
      </div>
    </form>
  );
};

export default GuessWhoCharacterForm;

