// src/pages/NhaCungCap.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../services/axiosClient';
import './NhaCungCap.css';

const NhaCungCap = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({}); // Trạng thái ẩn/hiện danh mục sản phẩm
  const [loading, setLoading] = useState(false); // Trạng thái tải dữ liệu
  const navigate = useNavigate();

  // Hàm tải danh sách từ Backend
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/nha-cung-cap');
      // LƯU Ý: Nếu axiosClient của bạn CHƯA tự động trích xuất .data ở interceptor, 
      // hãy đổi thành: setSuppliers(response.data || []);
      setSuppliers(response || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách nhà cung cấp:', error);
      alert('Không thể tải danh sách nhà cung cấp. Vui lòng thử lại!');
      setSuppliers([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Ẩn/hiện dòng sản phẩm
  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Hàm xử lý XÓA nhà cung cấp
  const handleDelete = async (id, tenNcc) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhà cung cấp "${tenNcc}" không? Hành động này không thể hoàn tác!`)) {
      try {
        await axiosClient.delete(`/nha-cung-cap/${id}`);
        alert('Xóa nhà cung cấp thành công!');
        // Cập nhật lại giao diện ngay lập tức mà không cần reload trang
        setSuppliers(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error('Lỗi khi xóa nhà cung cấp:', error);
        // Bắt các lỗi ràng buộc khóa ngoại (ví dụ nhà cung cấp đang có hàng hóa)
        const errorMsg = error.response?.data?.message || 'Không thể xóa nhà cung cấp này do có ràng buộc dữ liệu sản phẩm!';
        alert(errorMsg);
      }
    }
  };

  // Tìm kiếm theo tên hoặc mã NCC
  const filtered = suppliers.filter(s => 
    (s.tenNcc?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (s.maNcc?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  // Hàm xử lý hiển thị lĩnh vực
  const renderLinhVucTags = (linhVucData) => {
    if (!linhVucData) return <span className="category-tag tag-empty">Chưa phân loại</span>;
    try {
      const parsed = JSON.parse(linhVucData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return (
          <div className="category-tags-wrapper">
            {parsed.map((tag, idx) => (
              <span key={idx} className="category-tag">{tag}</span>
            ))}
          </div>
        );
      }
    } catch (error) {
      return <span className="category-tag">{linhVucData}</span>;
    }
    return <span className="category-tag tag-empty">Chưa phân loại</span>;
  };

  return (
    <div className="page-card">
      {/* Header */}
      <div className="page-header-row">
        <div className="header-title-group">
          <h2>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" className="header-icon">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>
            </svg>
            Quản lý Đối tác & Nhà cung cấp
          </h2>
          <p className="page-subtitle">Quản lý thông tin liên hệ và danh mục sản phẩm cung ứng</p>
        </div>
        <button className="btn-primary-blue" onClick={() => navigate('/nha-cung-cap/them-moi')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
            <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Thêm nhà cung cấp
        </button>
      </div>

      {/* Thanh Tìm Kiếm */}
      <div className="search-bar-wrapper">
        <div className="search-input-container">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Tìm theo mã hoặc tên đối tác..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-search"
          />
        </div>
      </div>

      {/* Bảng Dữ Liệu */}
      <div className="table-responsive">
        <table className="wms-table">
          <thead>
            <tr>
              <th style={{ width: '10%' }}>MÃ NCC</th>
              <th style={{ width: '22%' }}>TÊN NHÀ CUNG CẤP</th>
              <th style={{ width: '20%' }}>LĨNH VỰC CUNG ỨNG</th>
              <th style={{ width: '23%' }}>THÔNG TIN LIÊN HỆ</th>
              <th className="text-center" style={{ width: '13%' }}>SẢN PHẨM</th>
              <th className="text-center" style={{ width: '12%' }}>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center empty-table">Đang tải dữ liệu...</td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((item) => {
                // Ưu tiên lấy sanPhams đã được đồng bộ với thuộc tính backend mới cập nhật
                const productList = item.sanPhams || item.danhMucHang || item.products || [];

                return (
                  <React.Fragment key={item.id}>
                    {/* Dòng hiển thị thông tin chính */}
                    <tr className={expandedRows[item.id] ? 'row-expanded-active' : ''}>
                      <td>
                        <span className="badge-gray">{item.maNcc}</span>
                      </td>
                      <td className="font-bold-name">{item.tenNcc}</td>
                      <td>
                        {renderLinhVucTags(item.linhVuc || item.loaiHang)}
                      </td>
                      <td className="contact-column">
                        <div className="contact-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                          <span>{item.soDt || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="contact-item">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                          <span>{item.email || 'Chưa có email'}</span>
                        </div>
                        <div className="contact-item text-muted">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                          <span className="truncate-text" title={item.diaChi}>{item.diaChi || 'Chưa có địa chỉ'}</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <button 
                          className={`btn-expand-products ${expandedRows[item.id] ? 'active' : ''}`}
                          onClick={() => toggleRow(item.id)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                          {productList.length} 
                          {expandedRows[item.id] ? 
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"></polyline></svg> 
                            : 
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                          }
                        </button>
                      </td>
                      <td className="text-center">
                        {/* 🟢 BỔ SUNG: Chuyển hướng sang trang cập nhật kèm theo ID */}
                        <button 
                          className="btn-action-edit" 
                          title="Chỉnh sửa"
                          onClick={() => navigate(`/nha-cung-cap/chinh-sua/${item.id}`)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        {/* 🟢 BỔ SUNG: Sự kiện xóa dữ liệu */}
                        <button 
                          className="btn-action-delete" 
                          title="Xóa"
                          onClick={() => handleDelete(item.id, item.tenNcc)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </td>
                    </tr>

                    {/* Dòng mở rộng chứa danh mục sản phẩm */}
                    {expandedRows[item.id] && (
                      <tr className="sub-row">
                        <td colSpan="6" className="sub-row-td">
                          <div className="sub-row-box">
                            <h4>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px', color: '#64748b' }}><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                              Danh mục sản phẩm cung ứng:
                            </h4>
                            
                            <div className="product-grid">
                              {productList.length > 0 ? (
                                productList.map((sp, idx) => (
                                  <div key={sp.id || idx} className="product-card">
                                    <div className="product-img-wrapper">
                                      {sp.hinhAnh || sp.imageUrl ? (
                                        <img 
                                          // 🟢 Nối chuỗi đường dẫn URL của Backend vào trước tên file hinhAnh
                                          src={sp.hinhAnh ? `http://localhost:8080/uploads/${sp.hinhAnh}` : sp.imageUrl} 
                                          alt={sp.tenHang || sp.tenSP} 
                                          className="product-img" 
                                          // 🟢 Phòng trường hợp file ảnh dưới local của bạn bị xóa hoặc sai tên, nó sẽ hiện ảnh lỗi thay thế gọn gàng
                                          onError={(e) => {
                                            e.target.src = "https://placehold.co/150x150?text=No+Image";
                                          }}
                                        />
                                      ) : (
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                      )}
                                    </div>
                                    <div className="product-info">
                                      {/* Đã đồng bộ với cấu trúc maHang, tenHang, donGia của HangHoa.java */}
                                      <span className="product-sku">{sp.maHang || sp.maSP}</span>
                                      <span className="product-name" title={sp.tenHang || sp.tenSP}>
                                        {sp.tenHang || sp.tenSP}
                                      </span>
                                      <span className="product-price">
                                        {Number(sp.donGia || 0).toLocaleString('vi-VN')} VND
                                      </span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="empty-products">
                                  Nhà cung cấp này hiện chưa khai báo mặt hàng nào.
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center empty-table">
                  Không có nhà cung cấp nào được tìm thấy.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NhaCungCap; 