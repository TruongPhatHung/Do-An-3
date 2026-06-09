import { useState, useEffect } from 'react'; 
import { Link, Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import './AdminLayout.css';

const SIDEBAR_ROLE_LABELS = {
  'ADMIN': 'Quản trị viên',
  'QUANLYKHO': 'Quản lý kho',
  'NHANVIENKHO': 'Nhân viên kho',
  'NHANVIENMUAHANG': 'Nhân viên mua hàng',
  'USER': 'Người dùng hệ thống' 
};

const AdminLayout = () => {
  const location = useLocation(); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState({ name: 'User', role: 'USER',avatar: null });

useEffect(() => {
    // Tách logic ra một hàm riêng để có thể gọi lại nhiều lần
    const loadUserData = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const payload = JSON.parse(jsonPayload);
          
          let rawRole = payload.role || payload.roles || payload.authorities || 'USER';
          
          if (Array.isArray(rawRole)) {
            rawRole = rawRole[0];
            if (typeof rawRole === 'object' && rawRole !== null) {
              rawRole = rawRole.authority || rawRole.name || 'USER';
            }
          }

          let cleanRole = String(rawRole).replace('ROLE_', '').trim().toUpperCase();
          if (payload.sub === 'admin') cleanRole = 'ADMIN';

          const displayName = payload.fullName || payload.hoTen || payload.name || payload.sub || 'Người dùng';
          
          // Lấy avatar mới nhất từ localStorage
          const userAvatar = localStorage.getItem('avatar') || payload.avatar || null;

          setUser({
            name: displayName,
            role: cleanRole,
            avatar: userAvatar 
          });
        } catch (error) {
          console.error('Lỗi giải mã token tại Sidebar:', error);
        }
      }
    };

    // 1. Chạy lần đầu tiên khi load layout
    loadUserData();

    // 2. Lắng nghe "tiếng gọi" từ trang Cập nhật hồ sơ
    window.addEventListener('avatarChanged', loadUserData);

    // 3. Dọn dẹp sự kiện khi component bị unmount
    return () => window.removeEventListener('avatarChanged', loadUserData);
  }, []);
  const menuItems = [
    { path: '/dashboard', label: 'Thống Kê Tổng Quan', roles: ['ADMIN', 'QUANLYKHO'], icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z"></path></svg> },
    { path: '/danh-muc', label: 'Quản lý Danh mục', roles: ['ADMIN', 'QUANLYKHO'], icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg> },
    { path: '/hang-hoa', label: 'Danh sách hàng hóa', roles: ['ADMIN', 'QUANLYKHO', 'NHANVIENKHO', 'NHANVIENMUAHANG'], icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> },
    { path: '/nha-cung-cap', label: 'Quản lý Nhà cung cấp', roles: ['ADMIN', 'QUANLYKHO', 'NHANVIENMUAHANG'], icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
    { path: '/len-don-nhap', label: 'Lên đơn Nhập', roles: ['ADMIN', 'QUANLYKHO', 'NHANVIENMUAHANG'], icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><polyline points="9 15 12 18 15 15"></polyline></svg> },
    { path: '/len-don-xuat', label: 'Lên đơn Xuất', roles: ['ADMIN', 'QUANLYKHO', 'NHANVIENMUAHANG'], icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="12" x2="12" y2="18"></line><polyline points="9 15 12 12 15 15"></polyline></svg> },
    { path: '/nhap-kho', label: 'Xử lý Nhập kho', roles: ['ADMIN', 'QUANLYKHO', 'NHANVIENKHO'], icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg> },
    { path: '/xuat-kho', label: 'Xử lý Xuất kho', roles: ['ADMIN', 'QUANLYKHO', 'NHANVIENKHO'], icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg> },
    { path: '/quy-tai-chinh', label: 'Quỹ tài chính', roles: ['ADMIN', 'QUANLYKHO'], icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg> },
    { path: '/quan-ly-tai-khoan', label: 'Quản lý Tài khoản', roles: ['ADMIN'], icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> }
  ];

  const allowedMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="admin-container">
      <aside className={`sidebar-dark ${!isSidebarOpen ? 'hidden' : ''}`}>
        <div className="sidebar-profile">
          {/* 🟢 KIỂM TRA AVATAR ĐỂ RENDER ẢNH HOẶC CHỮ CÁI */}
          {user.avatar ? (
             <img 
               src={user.avatar} 
               alt="Avatar" 
               className="sidebar-avatar" 
               style={{ objectFit: 'cover', borderRadius: '50%', width: '40px', height: '40px' }} 
             />
          ) : (
             <div className="sidebar-avatar">{user.name.charAt(0).toUpperCase()}</div>
          )}
          
          <div className="sidebar-user-info">
            <div className="sidebar-name" title={user.name} style={{ textTransform: 'capitalize' }}>
              {user.name}
            </div>
            <div className="sidebar-role">{SIDEBAR_ROLE_LABELS[user.role] || user.role}</div>
          </div>
        </div>

        <div className="menu-group-title">BÁO CÁO CHIẾN LƯỢC</div>

        <nav className="menu-dark">
          {allowedMenuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`menu-item-dark ${location.pathname.includes(item.path) ? 'active' : ''}`}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-text">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} /> 
        
        <div className="content-area-light">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;