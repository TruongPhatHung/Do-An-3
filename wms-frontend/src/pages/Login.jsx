// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', 
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(''); 
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Sai tài khoản hoặc mật khẩu!');
      }

      const data = await response.json();
      
      if (data && data.token) {
        // 1. Lưu token để xài cho các API khác
        localStorage.setItem('token', data.token);
        
        // 🟢 2. LƯU AVATAR VÀO LOCAL STORAGE (Để Sidebar đọc được)
        // Nó sẽ cố tìm avatar nằm ngoài hoặc nằm trong object user do Backend trả về
        const userAvatar = data.avatar || (data.user && data.user.avatar) || '';
        localStorage.setItem('avatar', userAvatar);

        // 3. Chuyển hướng
        navigate('/dashboard'); 
      } else {
        setError('Không nhận được token từ server.');
      }
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      if (err.message.includes('Failed to fetch')) {
        setError('Không thể kết nối đến Server (Lỗi CORS hoặc Server đang tắt).');
      } else {
        setError(err.message || 'Có lỗi xảy ra khi kết nối đến server.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h2>Đăng Nhập WMS</h2>
          <p>Hệ thống Quản lý Kho CTUT</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Tên đăng nhập</label>
            <input 
              type="text" 
              name="username" 
              placeholder="Nhập tên đăng nhập của bạn..." 
              value={formData.username} 
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input 
              type="password" 
              name="password" 
              placeholder="Nhập mật khẩu..." 
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;