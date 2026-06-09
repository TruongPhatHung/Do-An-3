import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AccountList.css';

const AccountList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // LOGIC PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8080/api/users', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          console.error('Lỗi khi tải danh sách người dùng');
        }
      } catch (error) {
        console.error('Lỗi kết nối server:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const totalPages = Math.max(1, Math.ceil(users.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const renderRoleBadge = (role) => {
    const roleMap = {
      'ADMIN': { text: 'Quản trị viên', className: 'badge-admin' },
      'ROLE_ADMIN': { text: 'Quản trị viên', className: 'badge-admin' },
      'QUANLYKHO': { text: 'Quản lý kho', className: 'badge-quanly' },
      'NHANVIENKHO': { text: 'Thủ kho', className: 'badge-nhanvien' },
      'NHANVIENMUAHANG': { text: 'Nhân viên Mua hàng', className: 'badge-muahang' },
      'NHANVIENBANHANG': { text: 'Nhân viên Bán hàng', className: 'badge-banhang' },
      'KETOAN': { text: 'Kế toán', className: 'badge-ketoan' },
      'USER': { text: 'Khách hàng', className: 'badge-user' }
    };
    
    const mappedRole = roleMap[role] || { text: role, className: 'badge-default' };
    return <span className={`role-badge ${mappedRole.className}`}>{mappedRole.text}</span>;
  };

  // 🟢 HÀM HIỂN THỊ TRẠNG THÁI TỪ BACKEND
  const renderStatus = (status) => {
    if (status === 'OFFLINE') {
      return (
        <div className="status-indicator status-offline">
          <span className="status-dot" style={{ backgroundColor: '#ccc' }}></span> Đang offline
        </div>
      );
    } else if (status === 'LOCKED') {
      return (
        <div className="status-indicator status-locked">
          <span className="status-dot" style={{ backgroundColor: '#ff4d4f' }}></span> Bị khóa
        </div>
      );
    } else {
      return (
        <div className="status-indicator status-active">
          <span className="status-dot" style={{ backgroundColor: '#52c41a' }}></span> Đang hoạt động
        </div>
      );
    }
  };

  return (
    <div className="account-list-wrapper">
      <div className="al-header">
        <div className="al-title-group">
          <h2>Quản lý tài khoản</h2>
          <span className="al-subtitle">Cập nhật lúc: {new Date().toLocaleString('vi-VN')}</span>
        </div>
        <button className="btn-add-account" onClick={() => navigate('/quan-ly-tai-khoan/them-moi')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Thêm tài khoản mới
        </button>
      </div>

      <div className="al-filters">
        <div className="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Tìm kiếm theo tên, email..." />
        </div>
      </div>

      <div className="table-responsive">
        <table className="al-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên người dùng</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Hoạt động cuối</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" className="text-center">Đang tải dữ liệu...</td></tr>
            ) : currentUsers.length === 0 ? (
              <tr><td colSpan="6" className="text-center">Không có dữ liệu</td></tr>
            ) : (
              currentUsers.map(user => (
                <tr key={user.id}>
                  <td className="fw-500">#{user.id}</td>
                  <td>
                    <div className="user-info-cell">
                      <div className="user-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e2e8f0' }}>
                        {user.avatar ? (
                          <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#64748b' }}>
                            {user.hoTen ? user.hoTen.charAt(0).toUpperCase() : 'U'}
                          </span>
                        )}
                      </div>
                      <div className="user-details" style={{ marginLeft: '12px' }}>
                        <span className="user-name" style={{ display: 'block', fontWeight: 'bold' }}>{user.hoTen || 'Chưa cập nhật'}</span>
                        <span className="user-email" style={{ fontSize: '0.85rem', color: '#64748b' }}>{user.username}</span>
                      </div>
                    </div>
                  </td>
                  <td>{renderRoleBadge(user.role)}</td>
                  <td>{renderStatus(user.status)}</td>
                  
                  {/* 🟢 HIỂN THỊ HOẠT ĐỘNG CUỐI TỪ BACKEND TRUYỀN SANG */}
                  <td>
                    <div style={{ fontSize: '0.9rem' }}>
                      <strong style={{ color: '#0f172a' }}>{user.lastAction || 'Chưa có hoạt động'}</strong>
                      {user.lastActionTime && (
                         <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                           {new Date(user.lastActionTime).toLocaleString('vi-VN')}
                         </div>
                      )}
                    </div>
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button onClick={() => navigate(`/quan-ly-tai-khoan/${user.id}`)} className="btn-icon btn-view" title="Xem chi tiết">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </button>
                      <button onClick={() => navigate(`/quan-ly-tai-khoan/edit/${user.id}`)} className="btn-icon btn-edit" title="Chỉnh sửa">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="al-pagination">
        <span className="page-info">Trang {currentPage} / {totalPages}</span>
        <div className="page-controls">
          <button className="btn-page" onClick={handlePrevPage} disabled={currentPage === 1 || users.length === 0}>Trước</button>
          <button className="btn-page" onClick={handleNextPage} disabled={currentPage === totalPages || users.length === 0}>Sau</button>
        </div>
      </div>
    </div>
  );
};

export default AccountList;