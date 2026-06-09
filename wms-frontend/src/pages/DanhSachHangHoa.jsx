// src/pages/DanhSachHangHoa.jsx
import { useState, useEffect } from 'react';
import axiosClient from '../services/axiosClient';
import { toast } from 'react-toastify';
import './DanhSachHangHoa.css'; // Tí mình thêm css cho đẹp
import ModalHangHoa from '../components/ModalHangHoa'; // Modal Thêm/Sửa hàng hóa

const DanhSachHangHoa = () => {
  const [dsHangHoa, setDsHangHoa] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Hàm gọi API lấy danh sách hàng hóa
  const fetchHangHoa = async () => {
    setLoading(true);
    try {
      // Thay url bằng API thật của bạn (VD: /api/hang-hoa)
      const data = await axiosClient.get('/hang-hoa'); 
      setDsHangHoa(data); // Giả sử Backend trả về 1 mảng các object hàng hóa
    } catch (error) {
      console.error("Lỗi khi tải danh sách:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Chạy hàm lấy dữ liệu khi trang vừa render xong
  useEffect(() => {
    fetchHangHoa();
  }, []);

  // 3. Xử lý nút Xóa (Sẽ gọi API DELETE)
  const handleDelete = async (id, tenHangHoa) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm: ${tenHangHoa}?`)) {
      try {
        await axiosClient.delete(`/hang-hoa/${id}`);
        toast.success('Xóa hàng hóa thành công!');
        fetchHangHoa(); // Load lại bảng sau khi xóa
      } catch (error) {
        // Lỗi đã được axiosClient tự động bắt và hiển thị Toast
      }
    }
  };

  // Lọc dữ liệu tìm kiếm ở Front-end (hoặc bạn có thể gọi API truyền param)
  const filteredData = dsHangHoa.filter(item => 
    item.tenHangHoa?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.maHangHoa?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>📦 Quản lý Danh sách Hàng hóa</h2>
        <button className="btn-primary">
          + Thêm hàng hóa mới
        </button>
      </div>

      <div className="toolbar-section">
        <input 
          type="text" 
          className="search-input"
          placeholder="🔍 Tìm kiếm theo mã hoặc tên sản phẩm..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn-outline">Kiểm kho</button>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-text">Đang tải dữ liệu từ máy chủ...</div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Mã SP</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Số lượng tồn</th>
                <th>Đơn giá</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">Không tìm thấy dữ liệu hàng hóa.</td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-bold">{item.maHangHoa}</td>
                    <td>{item.tenHangHoa}</td>
                    <td>{item.danhMuc?.tenDanhMuc || 'Chưa phân loại'}</td>
                    <td>
                      <span className={`stock-badge ${item.tonKho < 10 ? 'danger' : 'safe'}`}>
                        {item.tonKho}
                      </span>
                    </td>
                    <td>{item.donGia?.toLocaleString('vi-VN')} đ</td>
                    <td>{item.trangThai === 'ACTIVE' ? 'Đang giao dịch' : 'Ngừng bán'}</td>
                    <td className="action-cell">
                      <button className="btn-edit" onClick={() => toast.info('Tính năng Sửa đang cập nhật')}>Sửa</button>
                      <button className="btn-delete" onClick={() => handleDelete(item.id, item.tenHangHoa)}>Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DanhSachHangHoa;