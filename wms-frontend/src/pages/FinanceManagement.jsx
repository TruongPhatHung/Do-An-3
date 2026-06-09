// src/pages/FinanceManagement.jsx
import { useState, useEffect } from 'react';
import axiosClient from '../services/axiosClient';
import { toast } from 'react-toastify';
import './FinanceManagement.css';

const FinanceManagement = () => {
  const [summary, setSummary] = useState({
    soDuQuy: 0,
    tongPhaiThu: 0,
    tongPhaiTra: 0
  });
  const [transactions, setTransactions] = useState([]); 
  const [partnerDebts, setPartnerDebts] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [payAmount, setPayAmount] = useState(0);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const [summaryRes, transRes, debtRes] = await Promise.all([
        axiosClient.get('/finance/summary').catch(() => ({ soDuQuy: 0, tongPhaiThu: 0, tongPhaiTra: 0 })),
        axiosClient.get('/finance/transactions').catch(() => []),
        axiosClient.get('/finance/debts').catch(() => [])
      ]);

      setSummary(summaryRes);
      setTransactions(transRes);
      setPartnerDebts(debtRes);
    } catch (error) {
      toast.error("Không thể kết nối đến phân hệ tài chính backend!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const openPaymentModal = (debt) => {
    setSelectedDebt(debt);
    // 🟢 SỬA LẠI: Lấy đúng biến conLai từ Backend
    setPayAmount(debt.conLai); 
    setShowPayModal(true);
  };

  const handleConfirmPayment = async () => {
    if (payAmount <= 0) {
      toast.warning("Số tiền xử lý giao dịch phải lớn hơn 0!");
      return;
    }
    try {
      await axiosClient.post('/finance/pay-debt', {
        // 🟢 SỬA LẠI: Trả về ID của bản ghi công nợ
        debtId: selectedDebt.id, 
        amount: payAmount
      });

      toast.success("Xử lý chứng từ thanh toán công nợ thành công!");
      setShowPayModal(false);
      fetchFinanceData(); 
    } catch (error) {
      toast.error("Giao dịch thất bại, vui lòng kiểm tra lại hệ thống!");
    }
  };

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  };

  if (loading) {
    return <div className="loading-container">💰 Đang tải dữ liệu quỹ và đối soát công nợ...</div>;
  }

  return (
    <div className="finance-root">
      <div className="finance-header">
        <div>
          <h2>💰 Quản Lý Quỹ Tài Chính & Công Nợ Hệ Thống</h2>
          <p className="subtitle">Kiểm soát dòng tiền Inbound/Outbound và số dư tài khoản doanh nghiệp</p>
        </div>
      </div>

      <div className="finance-summary-grid">
        <div className="fin-card total-cash">
          <span className="fin-card-label">Số Dư Quỹ Tiền Mặt hiện tại</span>
          <span className="fin-card-value text-green">{formatVND(summary.soDuQuy)}</span>
          <div className="fin-card-footer">Dòng tiền sẵn sàng thanh toán</div>
        </div>

        <div className="fin-card total-receivables">
          <span className="fin-card-label">Tổng Công Nợ Phải Thu (Khách hàng)</span>
          <span className="fin-card-value text-blue">{formatVND(summary.tongPhaiThu)}</span>
          <div className="fin-card-footer">Tiền kẹt ngoài thị trường từ đơn Xuất</div>
        </div>

        <div className="fin-card total-payables">
          <span className="fin-card-label">Tổng Công Nợ Phải Trả (Nhà cung cấp)</span>
          <span className="fin-card-value text-red">{formatVND(summary.tongPhaiTra)}</span>
          <div className="fin-card-footer">Gánh nặng tài chính từ đơn Nhập hàng</div>
        </div>
      </div>

      <div className="finance-main-layout">
        
        {/* CỘT TRÁI: BIẾN ĐỘNG SỔ QUỸ */}
        <div className="finance-column shadow-box">
          <h3>📜 Nhật Ký Biến Động Sổ Quỹ (Thu / Chi)</h3>
          <div className="table-container">
            <table className="finance-table">
              <thead>
                <tr>
                  <th>Mã GD</th>
                  <th>Lý do / Nội dung</th>
                  <th>Số tiền</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, idx) => (
                  <tr key={idx}>
                    <td><code>{t.maGiaoDich}</code></td>
                    <td>
                      {/* 🟢 SỬA LẠI: Dùng biến lyDo của Backend */}
                      <div><b>{t.lyDo}</b></div> 
                    </td>
                    <td className={t.loaiGiaoDich === 'THU' ? 'text-green text-bold' : 'text-red text-bold'}>
                      {t.loaiGiaoDich === 'THU' ? '+' : '-'}{formatVND(t.soTien)}
                    </td>
                    {/* 🟢 SỬA LẠI: Dùng biến ngayGiaoDich của Backend */}
                    <td><small>{new Date(t.ngayGiaoDich).toLocaleString('vi-VN')}</small></td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr><td colSpan="4" className="text-center text-muted">Chưa ghi nhận dòng tiền phát sinh.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CỘT PHẢI: CHI TIẾT NỢ ĐỐI TÁC */}
        <div className="finance-column shadow-box">
          <h3>🤝 Theo Dõi Công Nợ Chi Tiết Theo Đối Tác</h3>
          <div className="table-container">
            <table className="finance-table">
              <thead>
                <tr>
                  <th>Tên Đối Tác</th>
                  <th>Phân loại</th>
                  <th>Còn nợ</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {partnerDebts.map((d, idx) => (
                  <tr key={idx}>
                    <td>
                      {/* 🟢 SỬA LẠI: Dùng biến doiTac của Backend */}
                      <strong>{d.doiTac}</strong>
                    </td>
                    <td>
                      {/* 🟢 SỬA LẠI: Dùng biến loaiCongNo của Backend */}
                      <span className={`role-badge ${d.loaiCongNo}`}>
                        {d.loaiCongNo === 'PHAI_TRA' ? 'Nhà cung cấp' : 'Khách mua hàng'}
                      </span>
                    </td>
                    {/* 🟢 SỬA LẠI: Dùng biến conLai của Backend */}
                    <td className="text-bold">{formatVND(d.conLai)}</td>
                    <td className="text-center">
                      {d.conLai > 0 ? (
                        <button className="btn-action-pay" onClick={() => openPaymentModal(d)}>
                          {d.loaiCongNo === 'PHAI_TRA' ? 'Trả nợ' : 'Thu nợ'}
                        </button>
                      ) : (
                        <span className="text-green text-bold">✓ Đã tất toán</span>
                      )}
                    </td>
                  </tr>
                ))}
                {partnerDebts.length === 0 && (
                  <tr><td colSpan="4" className="text-center text-muted">Không có dữ liệu đối tác công nợ.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ================= MODAL XỬ LÝ THANH TOÁN ================= */}
      {showPayModal && selectedDebt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Xử lý chứng từ thanh toán tài chính</h4>
            <p>
              Đối tác: <strong>{selectedDebt.doiTac}</strong> ({selectedDebt.loaiCongNo === 'PHAI_TRA' ? 'Nhà cung cấp' : 'Khách hàng'})
            </p>
            <p>Khoản nợ hiện tại: <span className="text-red text-bold">{formatVND(selectedDebt.conLai)}</span></p>
            
            <div className="form-group-fin">
              <label>Số tiền giao dịch (VND):</label>
              <input 
                type="number" 
                value={payAmount} 
                onChange={(e) => setPayAmount(Number(e.target.value))} 
                max={selectedDebt.conLai}
              />
            </div>

            <div className="modal-actions-fin">
              <button className="btn-cancel" onClick={() => setShowPayModal(false)}>Hủy bỏ</button>
              <button className="btn-submit-fin" onClick={handleConfirmPayment}>
                Xác nhận thực chi/thực thu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceManagement;