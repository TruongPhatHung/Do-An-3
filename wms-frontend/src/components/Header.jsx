import { useState, useEffect } from 'react';
import axiosClient from '../services/axiosClient';

const Header = ({ onToggleSidebar }) => {
  const [showNotify, setShowNotify] = useState(false);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [user, setUser] = useState({ name: 'User', role: 'USER' });

  useEffect(() => {
    // 1. Đọc token từ localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        let rawRole = payload.role || payload.roles || payload.authorities || 'USER';
        if (Array.isArray(rawRole)) rawRole = rawRole[0];
        
        let cleanRole = String(rawRole).replace('ROLE_', '');
        
        // Cứu cánh: Nếu tên đăng nhập là admin, tự động ép quyền thành ADMIN
        if (payload.sub === 'admin') {
           cleanRole = 'ADMIN';
        }

        setUser({
          name: payload.sub || payload.fullName || 'Người dùng', // Vẫn lấy tên để tạo avatar cho đúng chữ cái đầu
          role: cleanRole
        });
      } catch (error) {
        console.error('Lỗi giải mã token tại Header:', error);
      }
    }

    // 2. Gọi API danh sách cảnh báo tồn kho
    const fetchAlerts = async () => {
      try {
        const data = await axiosClient.get('/hang-hoa/canh-bao-ton'); 
        setLowStockItems(data || []);
      } catch (error) {
        setLowStockItems([]);
      }
    };
    fetchAlerts();
  }, []);

  // 🟢 Gọi API Logout để Backend cập nhật trạng thái OFFLINE
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://localhost:8080/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Lỗi khi gọi API đăng xuất:', error);
    } finally {
      // Dù API có lỗi hay không, vẫn phải xóa token và đá về trang login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  return (
    <header className="admin-header-dark">
      {/* TRÁI: Nút Hamburger Menu */}
      <div className="header-left">
        <button className="icon-btn header-text-white" onClick={onToggleSidebar}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      </div>

      {/* GIỮA: Logo Hệ thống */}
      <div className="header-center">
        <div className="system-logo">
          <div className="logo-icon-orange">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinejoin="round"/></svg>
          </div>
          <span className="logo-text">WMS-SYSTEM</span>
        </div>
      </div>

      {/* PHẢI: Các cụm tiện ích & User Info */}
      <div className="header-right">
        {/* Nút Làm mới trang */}
        <button className="icon-btn header-text-white" onClick={() => window.location.reload()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
        </button>

        {/* Chuông thông báo */}
        <div className="header-icon-wrapper">
          <button className="icon-btn header-text-white" onClick={() => setShowNotify(!showNotify)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            <span className="badge-count-red">{lowStockItems.length > 0 ? lowStockItems.length : '0'}</span>
          </button>

          {/* Panel danh sách dropdown thông báo */}
          {showNotify && (
            <div className="dropdown-panel notify-dropdown">
              <div className="dropdown-title">Cảnh báo tồn kho</div>
              <div className="dropdown-body">
                {lowStockItems.length === 0 ? (
                  <p className="empty-text">Kho hàng an toàn.</p>
                ) : (
                  lowStockItems.map((item, index) => (
                    <div key={index} className="notify-item">
                      <div className="notify-dot"></div>
                      <div className="notify-info">
                        <p className="notify-msg"><strong>{item.tenHangHoa || 'Sản phẩm'}</strong> sắp hết!</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 🟢 KHỐI HIỂN THỊ THÔNG TIN USER (ĐÃ SỬA: Chào Vai Trò + bỏ chữ cam) */}
        <div className="header-user-block" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1890ff&color=fff`} 
            alt="avatar" 
            className="header-avatar" 
            style={{ width: '35px', height: '35px', borderRadius: '50%' }}
          />
          <span className="header-greeting" style={{ fontSize: '14px', lineHeight: '1.2' }}>
            Chào, <strong style={{ textTransform: 'uppercase' }}>{user.role}</strong>
          </span>
        </div>

        {/* Nút Đăng xuất */}
        <button className="btn-logout-red" onClick={handleLogout} style={{ marginLeft: '8px' }}>
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default Header;