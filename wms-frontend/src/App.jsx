// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';

import Login from './pages/Login'; 
import Dashboard from './pages/Dashboard';
import DanhMuc from './pages/DanhMuc';
import DanhSachHangHoa from './pages/DanhSachHangHoa';
import NhaCungCap from './pages/NhaCungCap';
import ThemNhaCungCap from './pages/ThemNhaCungCap'; 
import TaoPhieuNhap from './pages/TaoPhieuNhap';
import TaoPhieuXuat from './pages/TaoPhieuXuat';
import NhapKho from './pages/NhapKho';
import XuatKho from './pages/XuatKho';
import FinanceManagement from './pages/FinanceManagement'; 
import AccountList from './pages/AccountList';
import AccountDetail from './pages/AccountDetail';
import AccountEdit from './pages/AccountEdit';
import AddAccount from './pages/AddAccount'; 

// Component bảo vệ route (bắt buộc phải có token mới cho vào)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🟢 1. CẤU HÌNH MỚI: Mặc định mở web (đường dẫn "/") sẽ bị đẩy sang màn Đăng nhập */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Route Đăng nhập */}
        <Route path="/login" element={<Login />} />
        
        {/* 🟢 2. Bọc AdminLayout bằng ProtectedRoute (Không dùng path="/" nữa) */}
        <Route 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Các route con bên trong cần thêm dấu "/" ở đầu để trở thành đường dẫn độc lập */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Quản lý danh mục, hàng hóa và nhà cung cấp */}
          <Route path="/danh-muc" element={<DanhMuc />} />
          <Route path="/hang-hoa" element={<DanhSachHangHoa />} />
          <Route path="/nha-cung-cap" element={<NhaCungCap />} />
          <Route path="/nha-cung-cap/them-moi" element={<ThemNhaCungCap />} />
          
          {/* Nghiệp vụ Lên Đơn */}
          <Route path="/len-don-nhap" element={<TaoPhieuNhap />} />
          <Route path="/len-don-xuat" element={<TaoPhieuXuat />} />
          
          {/* Nghiệp vụ Xử lý Kho */}
          <Route path="/nhap-kho" element={<NhapKho />} />
          <Route path="/xuat-kho" element={<XuatKho />} /> 
          
          {/* Phân hệ Quỹ Tài chính & Công nợ */}
          <Route path="/quy-tai-chinh" element={<FinanceManagement />} />

          {/* Phân hệ Quản lý tài khoản người dùng */}
          <Route path="/quan-ly-tai-khoan" element={<AccountList />} />
          <Route path="/quan-ly-tai-khoan/them-moi" element={<AddAccount />} />
          <Route path="/quan-ly-tai-khoan/:id" element={<AccountDetail />} />
          <Route path="/quan-ly-tai-khoan/edit/:id" element={<AccountEdit />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App; 