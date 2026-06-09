// src/pages/ThemNhaCungCap.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosClient from '../services/axiosClient';
import './ThemNhaCungCap.css';

// Khai báo sẵn tập hợp các Lĩnh vực/Loại hàng phổ biến
const PRESET_CATEGORIES = ['Laptop', 'Main-board', 'VGA', 'Case', 'RAM', 'SSD', 'Điện tử', 'Gia dụng'];

const ThemNhaCungCap = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    maNCC: '',
    tenNCC: '',
    email: '',
    diaChi: ''
  });

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const [danhMucHang, setDanhMucHang] = useState([
    { id: 1, maHang: 'SP01', tenHang: '', donGia: 0, imageFile: null, imagePreview: '' }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectCategory = (e) => {
    const value = e.target.value;
    if (value && !selectedCategories.includes(value)) {
      setSelectedCategories([...selectedCategories, value]);
    }
    e.target.value = '';
  };

  const handleCustomCategoryKeyDown = (e) => {
    if (e.key === 'Enter' && customCategoryInput.trim()) {
      e.preventDefault();
      if (!selectedCategories.includes(customCategoryInput.trim())) {
        setSelectedCategories([...selectedCategories, customCategoryInput.trim()]);
      }
      setCustomCategoryInput('');
    }
  };

  const handleRemoveCategory = (tagToRemove) => {
    setSelectedCategories(selectedCategories.filter(tag => tag !== tagToRemove));
  };

  const handleAddRow = () => {
    const newId = danhMucHang.length > 0 ? danhMucHang[danhMucHang.length - 1].id + 1 : 1;
    const newMaHang = `SP0${newId}`; 
    setDanhMucHang([...danhMucHang, { id: newId, maHang: newMaHang, tenHang: '', donGia: 0, imageFile: null, imagePreview: '' }]);
  };

  const handleRemoveRow = (id) => {
    setDanhMucHang(danhMucHang.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    const updatedList = danhMucHang.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setDanhMucHang(updatedList);
  };

  const handleImageChange = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      const updatedList = danhMucHang.map(item => 
        item.id === id ? { ...item, imageFile: file, imagePreview: previewUrl } : item
      );
      setDanhMucHang(updatedList);
    }
  };

  const handleSave = async () => {
    if (!formData.maNCC || !formData.tenNCC || selectedCategories.length === 0) {
      toast.warning('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
      return;
    }

    const uploadData = new FormData();
    
    // 🟢 ĐÃ ĐỒNG BỘ KEY: Đổi thành 'maNcc' và 'tenNcc' để khớp chuẩn 100% với DTO trong Spring Boot
    uploadData.append('maNcc', formData.maNCC);
    uploadData.append('tenNcc', formData.tenNCC);
    uploadData.append('email', formData.email);
    uploadData.append('diaChi', formData.diaChi);
    
    // Gửi chuỗi ngăn cách bởi dấu phẩy phù hợp với kiểu String linhVuc bên Backend
    uploadData.append('linhVuc', selectedCategories.join(', ')); 

    danhMucHang.forEach((sp, index) => {
      // Chỉ gửi những hàng hóa có nhập đầy đủ mã và tên hàng
      if (sp.maHang && sp.tenHang) {
        uploadData.append(`sanPhams[${index}].maHang`, sp.maHang);
        uploadData.append(`sanPhams[${index}].tenHang`, sp.tenHang);
        uploadData.append(`sanPhams[${index}].donGia`, sp.donGia || 0);
        if (sp.imageFile) {
          uploadData.append(`sanPhams[${index}].hinhAnh`, sp.imageFile);
        }
      }
    });

    try {
      await axiosClient.post('/nha-cung-cap', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data', 
        },
      });
      
      toast.success('Lưu thông tin nhà cung cấp thành công!');
      setTimeout(() => {
        navigate('/nha-cung-cap');
      }, 800);
      
    } catch (error) {
      console.error('Lỗi khi lưu nhà cung cấp:', error);
      toast.error('Có lỗi xảy ra khi lưu thông tin. Vui lòng kiểm tra lại!');
    }
  };

  return (
    <div className="add-supplier-wrapper">
      <div className="back-navigation-row">
        <button type="button" className="btn-back-link" onClick={() => navigate('/nha-cung-cap')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Quay lại trang danh sách
        </button>
      </div>

      <div className="add-supplier-title-section">
        <h3>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          Thêm Mới Nhà Cung Cấp
        </h3>
        <p>Điền thông tin chi tiết để thêm đối tác mới vào hệ thống.</p>
      </div>

      <div className="form-scrollable-container">
        {/* Khối 1: Thông tin nhà cung cấp */}
        <div className="form-card-box">
          <div className="box-section-indicator">
            <span>1</span> THÔNG TIN NHÀ CUNG CẤP
          </div>

          <div className="input-fields-layout">
            <div className="field-row-grid">
              <div className="input-control-group">
                <label>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                  Mã Nhà Cung Cấp <span className="text-red-asterisk">*</span>
                </label>
                <input type="text" name="maNCC" placeholder="VD: NCC001" value={formData.maNCC} onChange={handleInputChange} />
              </div>

              <div className="input-control-group">
                <label>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18"></path><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"></path><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"></path></svg>
                  Tên nhà cung cấp <span className="text-red-asterisk">*</span>
                </label>
                <input type="text" name="tenNCC" placeholder="Công ty TNHH..." value={formData.tenNCC} onChange={handleInputChange} />
              </div>
            </div>

            <div className="input-control-group">
              <label>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2 22 7"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                Lĩnh vực / Loại Hàng (Có thể chọn nhiều) <span className="text-red-asterisk">*</span>
              </label>
              
              {selectedCategories.length > 0 && (
                <div className="selected-tags-container">
                  {selectedCategories.map(tag => (
                    <span key={tag} className="category-interactive-tag">
                      {tag}
                      <button type="button" onClick={() => handleRemoveCategory(tag)} className="btn-remove-tag">✕</button>
                    </span>
                  ))}
                </div>
              )}

              <div className="composite-input-action-bar">
                {isCustomMode ? (
                  <input 
                    type="text" 
                    placeholder="Gõ lĩnh vực mới rồi ấn Enter để thêm..." 
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    onKeyDown={handleCustomCategoryKeyDown}
                    className="flex-fill-input"
                  />
                ) : (
                  <select onChange={handleSelectCategory} defaultValue="" className="flex-fill-input">
                    <option value="" disabled>-- Chọn lĩnh vực hàng hóa cung ứng --</option>
                    {PRESET_CATEGORIES.map(cat => (
                      <option key={cat} value={cat} disabled={selectedCategories.includes(cat)}>
                        {cat} {selectedCategories.includes(cat) ? '(Đã chọn)' : ''}
                      </option>
                    ))}
                  </select>
                )}
                <button 
                  type="button" 
                  className="btn-toggle-input-mode" 
                  onClick={() => {
                    setIsCustomMode(!isCustomMode);
                    setCustomCategoryInput('');
                  }}
                >
                  {isCustomMode ? 'Chọn sẵn có' : '+ Thêm Mới'}
                </button>
              </div>
            </div>

            <div className="input-control-group">
              <label>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                Email liên hệ
              </label>
              <input type="email" name="email" placeholder="example@domain.com" value={formData.email} onChange={handleInputChange} />
            </div>

            <div className="input-control-group">
              <label>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                Địa chỉ văn phòng / Kho
              </label>
              <input type="text" name="diaChi" placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện..." value={formData.diaChi} onChange={handleInputChange} />
            </div>
          </div>
        </div>

        {/* Khối 2: Danh mục hàng hóa */}
        <div className="form-card-box mt-24">
          <div className="box-section-indicator justify-space-between">
            <div><span>2</span> DANH MỤC HÀNG HÓA (TÙY CHỌN)</div>
            <button type="button" className="btn-dashed-add-item" onClick={handleAddRow}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Thêm mặt hàng
            </button>
          </div>

          <div className="table-responsive-wrapper">
            <table className="form-items-data-table">
              <thead>
                <tr>
                  <th style={{ width: '8%', textAlign: 'center' }}>ẢNH SP</th>
                  <th style={{ width: '22%' }}>MÃ HÀNG</th>
                  <th>TÊN MẶT HÀNG</th>
                  <th style={{ width: '22%' }}>ĐƠN GIÁ GỐC (VND)</th>
                  <th style={{ width: '8%', textAlign: 'center' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {danhMucHang.map((item) => (
                  <tr key={item.id}>
                    <td style={{ textAlign: 'center' }}>
                      <div className="cell-image-upload-wrapper">
                        {item.imagePreview ? (
                          <img src={item.imagePreview} alt="Preview" className="cell-image-view" />
                        ) : (
                          <div className="cell-image-placeholder-icon">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleImageChange(item.id, e)}
                          className="cell-hidden-file-input"
                          title="Bấm để tải ảnh sản phẩm"
                        />
                      </div>
                    </td>
                    <td>
                      <input type="text" placeholder="VD: SP01" className="embedded-table-input" value={item.maHang} onChange={(e) => handleItemChange(item.id, 'maHang', e.target.value)} />
                    </td>
                    <td>
                      <input type="text" placeholder="Tên sản phẩm..." className="embedded-table-input" value={item.tenHang} onChange={(e) => handleItemChange(item.id, 'tenHang', e.target.value)} />
                    </td>
                    <td>
                      <input type="number" className="embedded-table-input" value={item.donGia} onChange={(e) => handleItemChange(item.id, 'donGia', Number(e.target.value))} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button type="button" className="btn-table-row-delete" onClick={() => handleRemoveRow(item.id)} title="Xóa dòng này">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {danhMucHang.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty-table-prompt">
                      Chưa có mặt hàng nào. Hãy bấm nút "+ Thêm mặt hàng".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="form-integrated-actions-row">
          <button type="button" className="btn-block-cancel" onClick={() => navigate('/nha-cung-cap')}>Hủy bỏ</button>
          <button type="button" className="btn-block-submit" onClick={handleSave}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px', verticalAlign: 'middle' }}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            Lưu Thông Tin
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemNhaCungCap;