import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddAccount.css';

const AddAccount = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    hoTen: '',
    ngaySinh: '',
    gioiTinh: 'NAM',
    soDienThoai: '',
    cccd: '',
    diaChi: '',
    username: '',
    password: '',
    role: 'NHANVIENKHO'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Tạo tài khoản và hồ sơ nhân viên thành công!');
        navigate('/quan-ly-tai-khoan');
      } else {
        // 🟢 XỬ LÝ LỖI 403 (Không có quyền)
        if (response.status === 403) {
          setError('Tài khoản của bạn không có quyền thêm nhân viên mới (Lỗi 403 Forbidden). Cần tài khoản ADMIN!');
          return;
        }

        // 🟢 Bắt lỗi an toàn đề phòng Backend trả về rỗng không phải JSON
        const errorText = await response.text(); 
        try {
          const errData = errorText ? JSON.parse(errorText) : {};
          setError(errData.message || `Lỗi server: ${response.status}. Kiểm tra lại dữ liệu trùng lặp.`);
        } catch (parseError) {
          setError(`Lỗi server: ${response.status}. Hệ thống từ chối yêu cầu.`);
        }
      }
    } catch (err) {
      console.error('Lỗi kết nối server:', err);
      setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại hệ thống.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-account-container">
      <div className="add-account-wrapper">
        
        <div className="form-header">
          <button type="button" className="btn-back" onClick={() => navigate('/quan-ly-tai-khoan')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Quay lại
          </button>
          <h2>Thêm tài khoản & Hồ sơ nhân sự</h2>
        </div>

        <div className="form-card">
          {error && <div className="alert alert-danger">{error}</div>}
          
          <form onSubmit={handleSubmit} className="account-form">
            
            {/* PHẦN 1: THÔNG TIN CÁ NHÂN */}
            <div className="form-section">
              <div className="section-title">
                <span className="section-number">1</span>
                <h3>Thông tin cá nhân cơ bản</h3>
              </div>
              
              <div className="form-grid tree-cols">
                <div className="form-group">
                  <label>Họ và tên <span className="required">*</span></label>
                  <input 
                    type="text" 
                    name="hoTen" 
                    value={formData.hoTen} 
                    onChange={handleChange} 
                    placeholder="Nguyễn Văn A" 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Ngày sinh <span className="required">*</span></label>
                  <input 
                    type="date" 
                    name="ngaySinh" 
                    value={formData.ngaySinh} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Giới tính <span className="required">*</span></label>
                  <select name="gioiTinh" value={formData.gioiTinh} onChange={handleChange} required>
                    <option value="NAM">Nam</option>
                    <option value="NU">Nữ</option>
                    <option value="KHAC">Khác</option>
                  </select>
                </div>
              </div>

              <div className="form-grid two-cols mt-3">
                <div className="form-group">
                  <label>Số điện thoại <span className="required">*</span></label>
                  <input 
                    type="tel" 
                    name="soDienThoai" 
                    value={formData.soDienThoai} 
                    onChange={handleChange} 
                    placeholder="0912345678" 
                    pattern="[0-9]{10}"
                    title="Số điện thoại phải bao gồm 10 chữ số"
                    required 
                  />
                </div>

                <div className="form-group">
                  <label>Số CCCD / Định danh <span className="required">*</span></label>
                  <input 
                    type="text" 
                    name="cccd" 
                    value={formData.cccd} 
                    onChange={handleChange} 
                    placeholder="012345678901" 
                    required 
                  />
                </div>
              </div>

              <div className="form-group mt-3">
                <label>Địa chỉ thường trú <span className="required">*</span></label>
                <input 
                  type="text" 
                  name="diaChi" 
                  value={formData.diaChi} 
                  onChange={handleChange} 
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" 
                  required 
                />
              </div>
            </div>

            {/* PHẦN 2: TÀI KHOẢN HỆ THỐNG */}
            <div className="form-section mb-0">
              <div className="section-title">
                <span className="section-number">2</span>
                <h3>Tài khoản đăng nhập & Phân quyền</h3>
              </div>
              
              {/* Đưa 3 trường này lên cùng 1 hàng để tiết kiệm diện tích tối đa */}
             <div className="form-grid tree-cols">
                <div className="form-group">
                  <label>Tên đăng nhập <span className="required">*</span></label>
                  <input 
                    type="text" 
                    name="username" 
                    value={formData.username} 
                    onChange={handleChange} 
                    placeholder="VD: nhanvien_01" 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>Mật khẩu khởi tạo <span className="required">*</span></label>
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="Tối thiểu 6 ký tự" 
                    required 
                    minLength="6"
                  />
                </div>

                <div className="form-group">
                  <label>Vai trò chức vụ <span className="required">*</span></label>
                  <select name="role" value={formData.role} onChange={handleChange} required>
                    <option value="NHANVIENKHO">Thủ kho</option>
                    <option value="QUANLYKHO">Quản lý kho</option>
                    <option value="NHANVIENMUAHANG">Nhân viên Mua hàng</option>
                    <option value="NHANVIENBANHANG">Nhân viên Bán hàng</option>
                    <option value="KETOAN">Kế toán</option>
                    <option value="ADMIN">Quản trị viên (ADMIN)</option>
                    {/* Đã loại bỏ vai trò USER (Khách hàng) */}
                  </select>
                </div>
              </div>
            </div>

            {/* THANH NÚT BẤM XÁC NHẬN */}
            <div className="form-actions">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={() => navigate('/quan-ly-tai-khoan')}
              >
                Hủy tác vụ
              </button>
              <button 
                type="submit" 
                className="btn-submit" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <><span className="spinner"></span> Đang xử lý...</>
                ) : 'Khởi tạo tài khoản'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAccount;