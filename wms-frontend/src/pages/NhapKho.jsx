// src/pages/NhapKho.jsx
import { useState, useEffect } from 'react';
import axiosClient from '../services/axiosClient';
import { toast } from 'react-toastify';
import './NhapKho.css'; 

const NhapKho = () => {
  const [dsPhieuNhap, setDsPhieuNhap] = useState([]);
  const [selectedPhieu, setSelectedPhieu] = useState(null);

  const loadPhieuNhap = async () => {
    try {
      // 🟢 ĐÃ SỬA: Gọi đúng API /nhap-kho
      const data = await axiosClient.get('/nhap-kho');
      setDsPhieuNhap(data || []);
    } catch (error) {
      console.error("Lỗi tải danh sách phiếu nhập:", error);
    }
  };

  useEffect(() => {
    loadPhieuNhap();
  }, []);

  const handleUpdateStatus = async (id, currentStatus) => {
    let nextStatus = '';
    let msgSuccess = '';

    if (currentStatus === 'CHO_NHAN_HANG' || currentStatus === 'DRAFT') {
      nextStatus = 'DA_NHAN_HANG';
      msgSuccess = 'Đã hoàn thành bước: Nhận hàng & Kiểm tra!';
    } else if (currentStatus === 'DA_NHAN_HANG') {
      nextStatus = 'COMPLETED';
      msgSuccess = 'Đã hoàn thành Cất hàng & Sắp xếp. Hàng hóa đã chính thức cộng vào kho!';
    }

    try {
      // 🟢 ĐÃ SỬA: Gọi đúng API xác nhận của Backend (Truyền thêm trạng thái nếu Backend cần)
      await axiosClient.put(`/nhap-kho/${id}/xac-nhan`, { trangThai: nextStatus });
      toast.success(msgSuccess);
      loadPhieuNhap(); 
      if (selectedPhieu && selectedPhieu.id === id) setSelectedPhieu(null); 
    } catch (error) {}
  };

  const renderStatusBadge = (status) => {
    // 🟢 Cập nhật thêm điều kiện DRAFT/COMPLETED cho khớp Database
    switch(status) {
      case 'DRAFT': 
      case 'CHO_NHAN_HANG': return <span className="badge badge-warning">⏳ Chờ nhận hàng</span>;
      case 'DA_NHAN_HANG': return <span className="badge badge-info">📦 Chờ cất hàng</span>;
      case 'COMPLETED':
      case 'HOAN_THANH': return <span className="badge badge-success">✅ Đã vào kho</span>;
      default: return <span className="badge badge-secondary">{status}</span>;
    }
  };

  return (
    <div className="kho-execution-container">
      <div className="page-header">
        <h2>🛠️ Xử lý Nghiệp vụ Nhập Kho (Inbound)</h2>
      </div>

      <div className="execution-layout">
        <div className="list-panel">
          <table className="execution-table">
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Nhà Cung Cấp</th>
                <th>Tổng Tiền</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {dsPhieuNhap.map(phieu => (
                <tr key={phieu.id} className={selectedPhieu?.id === phieu.id ? 'row-selected' : ''} onClick={() => setSelectedPhieu(phieu)}>
                  <td><b>{phieu.maPhieu || `#PN-${phieu.id}`}</b></td>
                  {/* 🟢 ĐÃ SỬA: Lấy đúng biến nhaCungCap từ Backend trả về */}
                  <td>{phieu.nhaCungCap}</td>
                  <td>{phieu.tongTien?.toLocaleString('vi-VN')} đ</td>
                  <td>{renderStatusBadge(phieu.trangThai)}</td>
                  <td>
                    <button className="btn-view-detail" onClick={(e) => { e.stopPropagation(); setSelectedPhieu(phieu); }}>
                      👁️ Xem
                    </button>
                  </td>
                </tr>
              ))}
              {dsPhieuNhap.length === 0 && <tr><td colSpan="5" className="text-center">Không có đơn nhập nào cần xử lý.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="action-panel">
          {selectedPhieu ? (
            <div className="detail-card">
              <h3>Chi tiết {selectedPhieu.maPhieu || `#PN-${selectedPhieu.id}`}</h3>
              <p><b>Nhà cung cấp:</b> {selectedPhieu.nhaCungCap}</p>
              <p><b>Người lập phiếu:</b> {selectedPhieu.nguoiTao}</p>
              <p><b>Trạng thái hiện tại:</b> {renderStatusBadge(selectedPhieu.trangThai)}</p>

              <div className="status-flow-actions">
                {(selectedPhieu.trangThai === 'CHO_NHAN_HANG' || selectedPhieu.trangThai === 'DRAFT') && (
                  <button className="btn-execute btn-step-1" onClick={() => handleUpdateStatus(selectedPhieu.id, selectedPhieu.trangThai)}>
                    🚚 Bước 1: Nhận hàng & Kiểm tra số lượng
                  </button>
                )}
                
                {selectedPhieu.trangThai === 'DA_NHAN_HANG' && (
                  <button className="btn-execute btn-step-2" onClick={() => handleUpdateStatus(selectedPhieu.id, 'DA_NHAN_HANG')}>
                    🏗️ Bước 2: Cất hàng & Sắp xếp lên kệ
                  </button>
                )}

                {(selectedPhieu.trangThai === 'HOAN_THANH' || selectedPhieu.trangThai === 'COMPLETED') && (
                  <div className="success-alert-box">
                    🎉 Đơn hàng này đã hoàn thành toàn bộ quy trình nhập kho quy chuẩn!
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-panel-message">
              👈 Vui lòng bấm vào một đơn nhập bên danh sách để tiến hành.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NhapKho;