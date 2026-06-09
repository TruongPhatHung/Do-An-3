// src/pages/XuatKho.jsx
import { useState, useEffect } from 'react';
import axiosClient from '../services/axiosClient';
import { toast } from 'react-toastify';
import './XuatKho.css';

const XuatKho = () => {
  const [dsPhieuXuat, setDsPhieuXuat] = useState([]);
  const [selectedPhieu, setSelectedPhieu] = useState(null);

  const loadPhieuXuat = async () => {
    try {
      // 🟢 ĐÃ SỬA: Gọi API /xuat-kho
      const data = await axiosClient.get('/xuat-kho');
      setDsPhieuXuat(data || []);
    } catch (error) {
      console.error("Lỗi tải danh sách phiếu xuất:", error);
    }
  };

  useEffect(() => { loadPhieuXuat(); }, []);

  const handleUpdateStatus = async (id, currentStatus) => {
    let nextStatus = '';
    let msgSuccess = '';

    if (currentStatus === 'CHO_LAY_HANG' || currentStatus === 'PENDING') {
      nextStatus = 'DA_LAY_HANG';
      msgSuccess = 'Đã hoàn thành Lấy hàng (Picking) khỏi vị trí kệ!';
    } else if (currentStatus === 'DA_LAY_HANG') {
      nextStatus = 'COMPLETED';
      msgSuccess = 'Đã Đóng gói & Xuất kho bàn giao Vận chuyển thành công! Kho đã tự động trừ!';
    }

    try {
      // 🟢 ĐÃ SỬA: Gọi API xác nhận xuất kho
      await axiosClient.put(`/xuat-kho/${id}/xac-nhan`, { trangThai: nextStatus });
      toast.success(msgSuccess);
      loadPhieuXuat();
      if (selectedPhieu && selectedPhieu.id === id) setSelectedPhieu(null);
    } catch (error) {}
  };

  const renderStatusBadge = (status) => {
    switch(status) {
      case 'PENDING':
      case 'CHO_LAY_HANG': return <span className="badge badge-warning">🏃 Chờ lấy hàng</span>;
      case 'DA_LAY_HANG': return <span className="badge badge-info">📦 Chờ đóng gói</span>;
      case 'COMPLETED':
      case 'HOAN_THANH': return <span className="badge badge-success">🚚 Đã xuất kho</span>;
      default: return <span className="badge badge-secondary">{status}</span>;
    }
  };

  return (
    <div className="kho-execution-container">
      <div className="page-header">
        <h2>🛠️ Xử lý Nghiệp vụ Xuất Kho (Outbound)</h2>
      </div>

      <div className="execution-layout">
        <div className="list-panel">
          <table className="execution-table">
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Khách Hàng/Đơn hàng</th>
                <th>Tổng Tiền</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {dsPhieuXuat.map(phieu => (
                <tr key={phieu.id} className={selectedPhieu?.id === phieu.id ? 'row-selected' : ''} onClick={() => setSelectedPhieu(phieu)}>
                  <td><b>{phieu.maPhieu || `#PX-${phieu.id}`}</b></td>
                  {/* 🟢 ĐÃ SỬA: Lấy đúng biến khachHang do Controller trả ra */}
                  <td>{phieu.khachHang}</td>
                  <td>{phieu.tongTien?.toLocaleString('vi-VN')} đ</td>
                  <td>{renderStatusBadge(phieu.trangThai)}</td>
                  <td>
                    <button className="btn-view-detail" onClick={(e) => { e.stopPropagation(); setSelectedPhieu(phieu); }}>
                      👁️ Xem
                    </button>
                  </td>
                </tr>
              ))}
              {dsPhieuXuat.length === 0 && <tr><td colSpan="5" className="text-center">Không có đơn xuất nào cần xử lý.</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="action-panel">
          {selectedPhieu ? (
            <div className="detail-card">
              <h3>Chi tiết {selectedPhieu.maPhieu || `#PX-${selectedPhieu.id}`}</h3>
              <p><b>Khách hàng/Đơn hàng:</b> {selectedPhieu.khachHang}</p>
              <p><b>Người lập phiếu:</b> {selectedPhieu.nguoiTao}</p>
              <p><b>Trạng thái đơn:</b> {renderStatusBadge(selectedPhieu.trangThai)}</p>

              <div className="status-flow-actions">
                {(selectedPhieu.trangThai === 'CHO_LAY_HANG' || selectedPhieu.trangThai === 'PENDING') && (
                  <button className="btn-execute btn-step-picking" onClick={() => handleUpdateStatus(selectedPhieu.id, selectedPhieu.trangThai)}>
                    🏃 Tiến hành Lấy hàng (Picking) khỏi kệ kho
                  </button>
                )}
                
                {selectedPhieu.trangThai === 'DA_LAY_HANG' && (
                  <button className="btn-execute btn-step-packing" onClick={() => handleUpdateStatus(selectedPhieu.id, 'DA_LAY_HANG')}>
                    🎁 Hoàn thành Đóng gói & Xuất Vận Chuyển
                  </button>
                )}

                {(selectedPhieu.trangThai === 'HOAN_THANH' || selectedPhieu.trangThai === 'COMPLETED') && (
                  <div className="success-alert-box-outbound">
                    🚀 Đơn hàng đã được đóng gói kĩ càng và xuất bến!
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-panel-message">
              👈 Vui lòng lựa chọn một đơn xuất hàng bên danh sách để thực hiện.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default XuatKho;