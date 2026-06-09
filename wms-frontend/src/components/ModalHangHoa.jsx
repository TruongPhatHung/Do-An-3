// src/components/ModalHangHoa.jsx
import { useState, useEffect } from 'react';
import axiosClient from '../services/axiosClient';
import { toast } from 'react-toastify';
import './ModalHangHoa.css';

const ModalHangHoa = ({ isOpen, onClose, fetchHangHoa, editingItem }) => {
  const [categories, setCategories] = useState([]); // Danh sách loại hàng từ DB
  const [formData, setFormData] = useState({
    maHangHoa: '',
    tenHangHoa: '',
    danhMucId: '',
    tonKho: 0,
    donGia: 0,
    trangThai: 'ACTIVE'
  });
  const [errors, setErrors] = useState({});

  // 1. Lấy danh sách danh mục (Loại hàng) từ Backend để đổ vào ô Select
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Thay đường dẫn API danh mục thật của bạn ở đây (VD: /danh-muc hoặc /loai-hang)
        const data = await axiosClient.get('/danh-muc');
        setCategories(data || []);
      } catch (error) {
        console.error("Không thể tải danh sách danh mục:", error);
      }
    };
    if (isOpen) fetchCategories();
  }, [isOpen]);

  // 2. Điền dữ liệu cũ vào Form nếu bấm nút "Sửa"
  useEffect(() => {
    if (editingItem) {
      setFormData({
        maHangHoa: editingItem.maHangHoa || '',
        tenHangHoa: editingItem.tenHangHoa || '',
        danhMucId: editingItem.danhMuc?.id || '',
        tonKho: editingItem.tonKho || 0,
        donGia: editingItem.donGia || 0,
        trangThai: editingItem.trangThai || 'ACTIVE'
      });
      setErrors({});
    } else {
      // Nếu là Thêm mới thì reset form trắng
      setFormData({ maHangHoa: '', tenHangHoa: '', danhMucId: '', tonKho: 0, donGia: 0, trangThai: 'ACTIVE' });
      setErrors({});
    }
  }, [editingItem, isOpen]);

  // 3. Kiểm tra lỗi trực tiếp khi người dùng gõ phím (Validation)
  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'maHangHoa' && !value.trim()) errorMsg = 'Mã hàng hóa không được để trống';
    if (name === 'tenHangHoa' && !value.trim()) errorMsg = 'Tên hàng hóa không được để trống';
    if (name === 'danhMucId' && !value) errorMsg = 'Vui lòng chọn danh mục sản phẩm';
    if (name === 'tonKho' && (value < 0 || isNaN(value))) errorMsg = 'Số lượng tồn không được nhỏ hơn 0';
    if (name === 'donGia' && (value <= 0 || isNaN(value))) errorMsg = 'Đơn giá phải lớn hơn 0';

    setErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const finalValue = (name === 'tonKho' || name === 'donGia') ? Number(value) : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    validateField(name, finalValue);
  };

  // 4. Kiểm tra toàn bộ form trước khi gửi đi
  const isFormInvalid = () => {
    if (!formData.maHangHoa || !formData.tenHangHoa || !formData.danhMucId || formData.tonKho < 0 || formData.donGia <= 0) return true;
    return Object.values(errors).some(err => err !== '');
  };

  // 5. Submit Form lên Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormInvalid()) return;

    try {
      if (editingItem) {
        // Luồng PUT: Cập nhật sản phẩm đang có
        await axiosClient.put(`/hang-hoa/${editingItem.id}`, formData);
        toast.success('Cập nhật thông tin hàng hóa thành công!');
      } else {
        // Luồng POST: Tạo mới sản phẩm hoàn toàn
        await axiosClient.post('/hang-hoa', formData);
        toast.success('Thêm mới hàng hóa thành công!');
      }
      fetchHangHoa(); // Tải lại bảng dữ liệu ở trang cha
      onClose();      // Đóng modal
    } catch (error) {
      // Lỗi hệ thống đã có Axios Interceptor lo và hiện Toast đỏ
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h3>{editingItem ? '✏️ Cập nhật Hàng hóa' : '📦 Thêm Hàng hóa mới'}</h3>
          <button className="close-x-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Mã hàng hóa <span className="required">*</span></label>
            <input 
              type="text" name="maHangHoa" disabled={!!editingItem} // Không cho sửa Mã SP khi cập nhật
              className={errors.maHangHoa ? 'input-error' : ''}
              value={formData.maHangHoa} onChange={handleChange} 
            />
            {errors.maHangHoa && <span className="error-text">{errors.maHangHoa}</span>}
          </div>

          <div className="form-group">
            <label>Tên hàng hóa <span className="required">*</span></label>
            <input 
              type="text" name="tenHangHoa" 
              className={errors.tenHangHoa ? 'input-error' : ''}
              value={formData.tenHangHoa} onChange={handleChange} 
            />
            {errors.tenHangHoa && <span className="error-text">{errors.tenHangHoa}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Danh mục phân loại <span className="required">*</span></label>
              <select 
                name="danhMucId" 
                className={errors.danhMucId ? 'input-error' : ''}
                value={formData.danhMucId} onChange={handleChange}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.tenDanhMuc}</option>
                ))}
              </select>
              {errors.danhMucId && <span className="error-text">{errors.danhMucId}</span>}
            </div>

            <div className="form-group">
              <label>Trạng thái</label>
              <select name="trangThai" value={formData.trangThai} onChange={handleChange}>
                <option value="ACTIVE">Đang giao dịch</option>
                <option value="INACTIVE">Ngừng bán</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Số lượng tồn đầu kho</label>
              <input 
                type="number" name="tonKho" 
                className={errors.tonKho ? 'input-error' : ''}
                value={formData.tonKho} onChange={handleChange} 
              />
              {errors.tonKho && <span className="error-text">{errors.tonKho}</span>}
            </div>

            <div className="form-group">
              <label>Đơn giá xuất (đ) <span className="required">*</span></label>
              <input 
                type="number" name="donGia" 
                className={errors.donGia ? 'input-error' : ''}
                value={formData.donGia} onChange={handleChange} 
              />
              {errors.donGia && <span className="error-text">{errors.donGia}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Hủy bỏ</button>
            <button type="submit" className="btn-submit" disabled={isFormInvalid()}>
              {editingItem ? 'Cập nhật ngay' : 'Lưu sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalHangHoa;