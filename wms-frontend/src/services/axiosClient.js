import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Đảm bảo đúng port backend của bạn
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTOR: Can thiệp vào request TRƯỚC KHI gửi lên server
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('token');
    
    // Nếu có token, nhét nó vào Header dưới dạng Bearer Token
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// INTERCEPTOR: Xử lý response TỪ server trả về
axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data; // Tự động bóc tách data, không cần gọi .data nhiều lần
    }
    return response;
  },
  (error) => {
    // Nếu lỗi 401 (Hết hạn Token) hoặc 403 (Cấm truy cập) -> Xóa token và văng ra trang Login
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error("Token không hợp lệ hoặc đã hết hạn!");
      localStorage.removeItem('token');
    //   window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default axiosClient;