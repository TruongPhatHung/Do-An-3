// src/pages/DanhMuc.jsx
import { useState, useEffect } from 'react';
import axiosClient from '../services/axiosClient';
import './DanhMuc.css';

const DanhMuc = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Tải danh sách từ Backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        
        const response = await axiosClient.get('/loai-hang');
        // Tuỳ thuộc vào cấu trúc trả về của API, có thể là response.data hoặc response
        setCategories(response || []); 
      } catch (error) {
        console.error('Lỗi khi tải danh sách danh mục:', error);
        setCategories([]); // Đảm bảo state là mảng rỗng khi API lỗi
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(item =>
    item.tenDanhMuc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.maDanhMuc?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-card">
      <div className="page-header-row">
        <h2>Quản lý Danh mục sản phẩm</h2>
        <button className="btn-primary-blue">+ Thêm danh mục mới</button>
      </div>

      <div className="search-bar-wrapper">
        <input 
          type="text" 
          placeholder="Tìm theo mã hoặc tên danh mục..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-search"
        />
      </div>

      <table className="wms-table">
        <thead>
          <tr>
            <th>Mã danh mục</th>
            <th>Tên danh mục</th>
            <th>Mô tả chi tiết</th>
            <th style={{ textAlign: 'center' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.length > 0 ? (
            filteredCategories.map((item) => (
              <tr key={item.id}>
                <td className="font-bold-code">{item.maDanhMuc}</td>
                <td><strong>{item.tenDanhMuc}</strong></td>
                <td className="text-muted">{item.moTa || '---'}</td>
                <td style={{ textAlign: 'center' }}>
                  <button className="btn-action-edit">Sửa</button>
                  <button className="btn-action-delete">Xóa</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                Không tìm thấy danh mục nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DanhMuc;