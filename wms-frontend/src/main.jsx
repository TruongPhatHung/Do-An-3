import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Import CSS và Component của Toastify để thông báo có thể nổi lên trên toàn hệ thống
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* Đặt ToastContainer ở root để trang nào gọi toast() cũng chạy được */}
    <ToastContainer position="top-right" autoClose={3000} />
  </StrictMode>,
)