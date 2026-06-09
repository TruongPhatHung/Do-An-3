import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AccountEdit.css';

const AccountEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);

  // 🟢 State quản lý hiển thị Toggle thông báo thành công
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // 🟢 2. Khởi tạo ref cho thẻ input file
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    hoTen: '',
    username: '',
    role: '',
    ngaySinh: '',
    gioiTinh: 'nam', 
    cmnd: '',
    phone: '',
    address: '',
    avatar: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/users/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const rawText = await response.text();
          let data = JSON.parse(rawText);
          
          if (data && data.data) data = data.data;
          else if (data && data.result) data = data.result;

          setFormData(prev => ({
            ...prev,
            hoTen: data.hoTen || data.ho_ten || '',
            username: data.username || '',
            role: data.role || '',
            ngaySinh: data.ngaySinh || data.ngay_sinh || '',
            gioiTinh: data.gioiTinh || data.gioi_tinh || 'nam',
            cmnd: data.cmnd || '',
            phone: data.phone || '',
            address: data.address || '',
            avatar: data.avatar || ''
          }));
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setToast({ show: true, message: 'Vui lòng chọn ảnh dưới 2MB!', type: 'error' });
        setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 🟢 Hàm xử lý Bấm nút lưu
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hoTen: formData.hoTen,
          ngaySinh: formData.ngaySinh,
          gioiTinh: formData.gioiTinh,
          cmnd: formData.cmnd,
          phone: formData.phone,
          address: formData.address,
          avatar: formData.avatar
        })
      });

      if (response.ok) {
        setToast({ show: true, message: 'Cập nhật hồ sơ nhân viên thành công!', type: 'success' });
        
        // 🟢🟢 CẬP NHẬT LOCALSTORAGE VÀ PHÁT LOA THÔNG BÁO CHO SIDEBAR ĐỔI ẢNH 🟢🟢
        if (formData.avatar) {
          localStorage.setItem('avatar', formData.avatar);
          window.dispatchEvent(new Event('avatarChanged'));
        }

        setTimeout(() => {
          setToast({ show: false, message: '', type: '' });
        }, 3000);
      } else {
        setToast({ show: true, message: 'Cập nhật thất bại, vui lòng kiểm tra lại!', type: 'error' });
      }
    } catch (error) {
      console.error('Lỗi kết nối máy chủ:', error);
      setToast({ show: true, message: 'Lỗi kết nối đến Server máy chủ Backend!', type: 'error' });
    }
  };

  if (isLoading) return <div className="p-4">Đang tải dữ liệu...</div>;

  return (
    <div className="edit-container">
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-icon-wrapper">
            {toast.type === 'success' ? '✓' : '✕'}
          </div>
          <span className="toast-text">{toast.message}</span>
        </div>
      )}

      <button className="btn-back" onClick={() => navigate('/quan-ly-tai-khoan')}>
        ⬅ Quay lại danh sách
      </button>

      <div className="edit-card">
        <div className="edit-sidebar">
          <h3>Cập nhật hồ sơ</h3>
          <ul className="edit-menu">
            <li className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>
              Cài đặt chung
            </li>
            <li className={activeTab === 'privacy' ? 'active' : ''} onClick={() => setActiveTab('privacy')}>
              Quyền riêng tư và bảo mật
            </li>
            <li className={activeTab === 'login' ? 'active' : ''} onClick={() => setActiveTab('login')}>
              Lịch sử đăng nhập
            </li>
          </ul>
        </div>

        <div className="edit-content">
          {activeTab === 'general' && (
            <form onSubmit={handleSubmit} className="fade-in">
              <h4>Cài đặt chung</h4>
              
              <div className="avatar-section">
                {formData.avatar ? (
                  <img 
                    src={formData.avatar} 
                    alt="Avatar" 
                    className="avatar-circle" 
                    style={{ objectFit: 'cover' }} 
                  />
                ) : (
                  <div className="avatar-circle">
                    {formData.hoTen ? formData.hoTen.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  style={{ display: 'none' }} 
                />
                
                <button 
                  type="button" 
                  className="btn-upload" 
                  onClick={() => fileInputRef.current.click()}
                >
                  Tải ảnh lên
                </button>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Tên nhân viên</label>
                  <input type="text" name="hoTen" value={formData.hoTen} onChange={handleChange} required />
                </div>
                
                <div className="form-group">
                  <label>Tên đăng nhập (Username)</label>
                  <input type="text" name="username" value={formData.username} readOnly className="readonly-input" />
                </div>

                <div className="form-group">
                  <label>Ngày sinh</label>
                  <input type="date" name="ngaySinh" value={formData.ngaySinh} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>Giới tính</label>
                  <div className="radio-group">
                    <label><input type="radio" name="gioiTinh" value="nam" checked={formData.gioiTinh === 'nam'} onChange={handleChange} /> Nam</label>
                    <label><input type="radio" name="gioiTinh" value="nu" checked={formData.gioiTinh === 'nu'} onChange={handleChange} /> Nữ</label>
                    <label><input type="radio" name="gioiTinh" value="khac" checked={formData.gioiTinh === 'khac'} onChange={handleChange} /> Khác</label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Số CMND / CCCD</label>
                  <input type="text" name="cmnd" value={formData.cmnd} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group mt-3">
                <label>Địa chỉ</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save">Cập nhật hồ sơ</button>
              </div>
            </form>
          )}

          {activeTab === 'privacy' && <div><h4>Bảo mật (Đang phát triển)</h4></div>}
          {activeTab === 'login' && <div><h4>Lịch sử (Đang phát triển)</h4></div>}
        </div>
      </div>
    </div>
  );
};

export default AccountEdit;