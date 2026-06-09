import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AccountDetail.css';

const AccountDetail = () => {
  const { id } = useParams(); // Lấy ID từ URL
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // 🟢 STATE QUẢN LÝ MODAL ĐỔI MẬT KHẨU
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordFormError, setPasswordFormError] = useState('');
  const [passwordFormSuccess, setPasswordFormSuccess] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const [activities, setActivities] = useState([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  useEffect(() => {
    const fetchUserDetail = async () => {
      console.log("=== HỆ THỐNG DÒ LỖI (DEBUG) ===");
      console.log("👉 ID lấy được từ thanh URL trình duyệt là:", id);

      if (!id || id === 'undefined') {
        setErrorMsg("Lỗi: ID trên URL bị 'undefined'. Vui lòng quay lại trang danh sách và bấm lại nút Xem chi tiết!");
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/users/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const rawText = await response.text();
          let finalUser = JSON.parse(rawText);
          
          if (finalUser && finalUser.data) finalUser = finalUser.data;
          else if (finalUser && finalUser.result) finalUser = finalUser.result;

          if (!finalUser || Object.keys(finalUser).length === 0) {
            setErrorMsg("Backend báo thành công nhưng lại trả về dữ liệu rỗng {}");
          } else {
            const normalizedUser = {
              id: finalUser.id,
              username: finalUser.username,
              hoTen: finalUser.hoTen || finalUser.ho_ten || 'Chưa cập nhật họ tên',
              role: finalUser.role || 'Chưa rõ chức vụ',
              status: finalUser.status || 'ACTIVE',
              ngaySinh: finalUser.ngaySinh || finalUser.ngay_sinh || '',
              gioiTinh: finalUser.gioiTinh || finalUser.gioi_tinh || '',
              cmnd: finalUser.cmnd || '',
              phone: finalUser.phone || '',
              address: finalUser.address || '',
              avatar: finalUser.avatar || null
            };
            setUser(normalizedUser);
          }
        } else {
          const errText = await response.text();
          setErrorMsg(`Không thể tải dữ liệu (Mã lỗi: ${response.status}).`);
        }
      } catch (error) {
        setErrorMsg("Không thể kết nối đến máy chủ Backend.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetail();
  }, [id]);
  // 🟢 GỌI API LẤY LỊCH SỬ HOẠT ĐỘNG KHI CHUYỂN TAB
  useEffect(() => {
    const fetchActivities = async () => {
      if (activeTab !== 'history') return; // Chỉ gọi khi ở tab history

      setIsLoadingActivities(true);
      try {
        const token = localStorage.getItem('token');
        // Giả sử Backend có API này
        const response = await fetch(`http://localhost:8080/api/users/${id}/activities`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setActivities(data); // Đưa dữ liệu thật vào State
        } else {
          console.error("Không thể lấy lịch sử hoạt động");
        }
      } catch (error) {
        console.error("Lỗi kết nối:", error);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    fetchActivities();
  }, [activeTab, id]);

  // Hàm phụ trợ: Format thời gian cho đẹp
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { 
      hour: '2-digit', minute: '2-digit', 
      day: '2-digit', month: '2-digit', year: 'numeric' 
    });
  };

  // 🟢 HÀM XỬ LÝ THAY ĐỔI INPUT TRONG FORM MẬT KHẨU
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  // 🟢 HÀM XỬ LÝ GỬI API ĐỔI MẬT KHẨU
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordFormError('');
    setPasswordFormSuccess('');

    // Kiểm tra tính hợp lệ dữ liệu ở Client
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordFormError('Mật khẩu mới và Nhập lại mật khẩu không trùng khớp!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordFormError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    setIsSubmittingPassword(true);

    try {
      const token = localStorage.getItem('token');
      // Gửi request PUT/POST lên endpoint đổi mật khẩu của Backend
      const response = await fetch(`http://localhost:8080/api/users/${id}/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        setPasswordFormSuccess('Thay đổi mật khẩu thành công!');
        // Reset form dữ liệu
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        // Tự động đóng modal sau 2 giây
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordFormSuccess('');
        }, 2000);
      } else {
        const errorData = await response.text();
        // Cố gắng parse JSON nếu backend trả về object lỗi, không thì lấy text thô
        try {
          const parsedErr = JSON.parse(errorData);
          setPasswordFormError(parsedErr.message || 'Mật khẩu cũ không chính xác hoặc lỗi hệ thống!');
        } catch {
          setPasswordFormError(errorData || 'Cập nhật thất bại. Vui lòng kiểm tra lại mật khẩu cũ!');
        }
      }
    } catch (error) {
      console.error(error);
      setPasswordFormError('Lỗi kết nối Server Backend không thành công!');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  if (isLoading) return <div className="loading-text">Đang tải thông tin...</div>;
  
  if (errorMsg) return (
    <div className="error-wrapper" style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', margin: '20px' }}>
      <h3 style={{ color: '#dc2626', marginBottom: '10px' }}>⚠️ Lỗi Đồng bộ Dữ liệu!</h3>
      <p style={{ color: '#4b5563', marginBottom: '20px' }}>{errorMsg}</p>
      <button className="btn-back" onClick={() => navigate('/quan-ly-tai-khoan')}>
        Quay lại danh sách tài khoản
      </button>
    </div>
  );

  if (!user) return <div className="error-text">Không tìm thấy tài khoản!</div>;

  return (
    <div className="account-detail-wrapper">
      <button className="btn-back" onClick={() => navigate('/quan-ly-tai-khoan')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Quay lại danh sách
      </button>

      <div className="detail-header">
        {/* 🟢 KIỂM TRA NẾU CÓ AVATAR THÌ HIỆN ẢNH, KHÔNG THÌ HIỆN CHỮ CÁI */}
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt="Avatar" 
            className="user-avatar-large" 
            style={{ objectFit: 'cover', borderRadius: '50%', width: '80px', height: '80px' }} 
          />
        ) : (
          <div className="user-avatar-large">{user.hoTen ? user.hoTen.charAt(0).toUpperCase() : 'U'}</div>
        )}
        
        <div className="detail-info">
          <h2>{user.hoTen}</h2>
          <p className="detail-role">{user.role}</p>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs-header">
          <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
            Thông tin cá nhân
          </button>
          <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
            Bảo mật
          </button>
          <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            Lịch sử hoạt động
          </button>
        </div>

        <div className="tab-content">
          
          {/* TAB 1: THÔNG TIN CÁ NHÂN */}
          {activeTab === 'info' && (
            <div className="tab-pane fade-in">
              <h3 className="pane-title">Thông tin cơ bản</h3>
              <div className="info-grid">
                <div className="info-group">
                  <label>ID Tài khoản</label>
                  <input type="text" value={user.id ? `#${user.id}` : '#'} readOnly className="input-readonly" />
                </div>
                <div className="info-group">
                  <label>Tên đăng nhập</label>
                  <input type="text" value={user.username || ''} readOnly className="input-readonly" />
                </div>
                <div className="info-group">
                  <label>Họ và tên</label>
                  <input type="text" value={user.hoTen || ''} readOnly className="input-readonly" />
                </div>
                <div className="info-group">
                  <label>Chức vụ / Vai trò</label>
                  <input type="text" value={user.role || ''} readOnly className="input-readonly" />
                </div>
              </div>

              <h3 className="pane-title" style={{ marginTop: '30px' }}>Liên hệ & Cá nhân</h3>
              <div className="info-grid">
                <div className="info-group">
                  <label>Giới tính</label>
                  <input type="text" value={user.gioiTinh === 'nam' ? 'Nam' : user.gioiTinh === 'nu' ? 'Nữ' : user.gioiTinh === 'khac' ? 'Khác' : 'Chưa cập nhật'} readOnly className="input-readonly" />
                </div>
                <div className="info-group">
                  <label>Ngày sinh</label>
                  <input type="text" value={user.ngaySinh || 'Chưa cập nhật'} readOnly className="input-readonly" />
                </div>
                <div className="info-group">
                  <label>Số điện thoại</label>
                  <input type="text" value={user.phone || 'Chưa cập nhật'} readOnly className="input-readonly" />
                </div>
                <div className="info-group">
                  <label>Số CMND / CCCD</label>
                  <input type="text" value={user.cmnd || 'Chưa cập nhật'} readOnly className="input-readonly" />
                </div>
              </div>
              <div className="info-group" style={{ marginTop: '20px' }}>
                <label>Địa chỉ hiện tại</label>
                <input type="text" value={user.address || 'Chưa cập nhật'} readOnly className="input-readonly" />
              </div>
            </div>
          )}

          {/* TAB 2: BẢO MẬT */}
          {activeTab === 'security' && (
            <div className="tab-pane fade-in">
              <h3 className="pane-title">Cài đặt bảo mật</h3>
              <div className="security-section">
                <div className="sec-item">
                  <div>
                    <h4>Đổi mật khẩu</h4>
                    <p>Khuyến nghị thay đổi mật khẩu định kỳ để bảo mật tài khoản.</p>
                  </div>
                  {/* 🟢 GẮN SỰ KIỆN CLICK ĐỂ BẬT MODAL POPUP */}
                  <button className="btn-outline" onClick={() => setShowPasswordModal(true)}>
                    Đổi mật khẩu
                  </button>
                </div>
                <div className="sec-item">
                  <div>
                    <h4>Khóa tài khoản</h4>
                    <p>Tạm thời vô hiệu hóa quyền truy cập của người dùng này.</p>
                  </div>
                  <button className="btn-danger">Khóa tài khoản</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="tab-pane fade-in">
              <h3 className="pane-title">Lịch sử hệ thống</h3>
              
              {isLoadingActivities ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>Đang tải dữ liệu lịch sử...</p>
              ) : activities.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>Chưa ghi nhận hoạt động nào của người dùng này.</p>
              ) : (
                <ul className="timeline">
                  {activities.map((act, index) => (
                    <li className="timeline-item" key={index}>
                      <span className="time">{formatDateTime(act.thoiGian)}</span>
                      <p>
                        {act.hanhDong} 
                        {act.chiTiet && <strong> [{act.chiTiet}]</strong>}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

        </div>
      </div>

      {/* 🟢 KHU VỰC ĐƯỢC THÊM MỚI: MODAL OVERLAY ĐỔI MẬT KHẨU */}
      {showPasswordModal && (
        <div className="pwd-modal-overlay">
          <div className="pwd-modal-content fade-in">
            <div className="pwd-modal-header">
              <h3>Đổi mật khẩu tài khoản</h3>
              <button className="pwd-modal-close-x" onClick={() => setShowPasswordModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handlePasswordSubmit}>
              {passwordFormError && <div className="pwd-alert pwd-alert-danger">{passwordFormError}</div>}
              {passwordFormSuccess && <div className="pwd-alert pwd-alert-success">{passwordFormSuccess}</div>}

              <div className="pwd-form-group">
                <label>Mật khẩu hiện tại <span style={{color: 'red'}}>*</span></label>
                <input 
                  type="password" 
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordInputChange}
                  required 
                  placeholder="Nhập mật khẩu hiện tại đang dùng"
                />
              </div>

              <div className="pwd-form-group">
                <label>Mật khẩu mới <span style={{color: 'red'}}>*</span></label>
                <input 
                  type="password" 
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  required 
                  placeholder="Mật khẩu mới ít nhất 6 ký tự"
                />
              </div>

              <div className="pwd-form-group">
                <label>Nhập lại mật khẩu mới <span style={{color: 'red'}}>*</span></label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  required 
                  placeholder="Xác nhận lại mật khẩu mới"
                />
              </div>

              <div className="pwd-modal-actions">
                <button 
                  type="button" 
                  className="pwd-btn-cancel" 
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordFormError('');
                  }}
                  disabled={isSubmittingPassword}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="pwd-btn-submit"
                  disabled={isSubmittingPassword}
                >
                  {isSubmittingPassword ? 'Đang cập nhật...' : 'Xác nhận thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AccountDetail;