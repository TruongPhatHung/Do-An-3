// src/pages/TaoPhieuNhap.jsx
import { useState, useEffect } from 'react';
import axiosClient from '../services/axiosClient';
import { toast } from 'react-toastify';
import './TaoPhieuNhap.css';

const TaoPhieuNhap = () => {
  // 1. Quản lý dữ liệu Master Data để đổ vào dropdown
  const [dsNhaCungCap, setDsNhaCungCap] = useState([]);
  const [dsHangHoa, setDsHangHoa] = useState([]);

  // 2. State quản lý Form gửi lên Backend
  const [nhaCungCapId, setNhaCungCapId] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  
  // Dynamic Form (Giỏ hàng tạm) - Khởi tạo mặc định có 1 dòng trống
  const [chiTietPhieu, setChiTietPhieu] = useState([
    { hangHoaId: '', soLuong: 1, donGia: 0 }
  ]);

  // Lấy dữ liệu nền (Nhà cung cấp & Hàng hóa) khi trang vừa load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nccData, hhData] = await Promise.all([
          axiosClient.get('/nha-cung-cap'), // Đảm bảo API này đã có trên Backend
          axiosClient.get('/hang-hoa')
        ]);
        setDsNhaCungCap(nccData || []);
        setDsHangHoa(hhData || []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu nền:", error);
      }
    };
    fetchData();
  }, []);

  // --- LOGIC XỬ LÝ DYNAMIC FORM (THÊM/XÓA/SỬA DÒNG) ---

  const handleAddRow = () => {
    setChiTietPhieu([...chiTietPhieu, { hangHoaId: '', soLuong: 1, donGia: 0 }]);
  };

  const handleRemoveRow = (index) => {
    if (chiTietPhieu.length === 1) {
      toast.warning('Phiếu nhập phải có ít nhất 1 mặt hàng!');
      return;
    }
    const newData = chiTietPhieu.filter((_, i) => i !== index);
    setChiTietPhieu(newData);
  };

  const handleRowChange = (index, field, value) => {
    const newData = [...chiTietPhieu];
    newData[index][field] = (field === 'soLuong' || field === 'donGia') ? Number(value) : value;
    
    // Tự động điền "Đơn giá" mặc định của Hàng hóa nếu user vừa chọn Hàng hóa
    if (field === 'hangHoaId') {
      const selectedHH = dsHangHoa.find(hh => hh.id === Number(value) || hh.id === value);
      if (selectedHH) {
        newData[index]['donGia'] = selectedHH.donGia || 0;
      }
    }
    setChiTietPhieu(newData);
  };

  // Tính tổng tiền tự động
  const tongTienPhieu = chiTietPhieu.reduce((total, item) => total + (item.soLuong * item.donGia), 0);

  // --- LOGIC SUBMIT (LƯU PHIẾU) ---
  const handleSubmit = async () => {
    // 1. Bẫy lỗi cơ bản (Validation Front-end)
    if (!nhaCungCapId) return toast.error('Vui lòng chọn Nhà cung cấp!');
    
    const hasErrorRow = chiTietPhieu.some(item => !item.hangHoaId || item.soLuong <= 0 || item.donGia < 0);
    if (hasErrorRow) return toast.error('Có dòng chi tiết chưa chọn hàng hóa hoặc số lượng/đơn giá không hợp lệ!');

    // 2. Gom dữ liệu thành 1 cục JSON lớn theo đúng chuẩn
    const payload = {
      nhaCungCapId: nhaCungCapId,
      ghiChu: ghiChu,
      tongTien: tongTienPhieu,
      chiTiet: chiTietPhieu.map(item => ({
        hangHoaId: item.hangHoaId,
        soLuong: item.soLuong,
        donGia: item.donGia
      }))
    };

    // 3. Bắn lên Backend
    try {
      await axiosClient.post('/phieu-nhap', payload);
      toast.success('Tạo Phiếu Nhập Kho thành công!');
      // Reset form sau khi tạo thành công
      setNhaCungCapId(''); setGhiChu('');
      setChiTietPhieu([{ hangHoaId: '', soLuong: 1, donGia: 0 }]);
    } catch (error) {
      // Axios Interceptor tự lo thông báo lỗi từ backend
    }
  };

  return (
    <div className="page-container inbound-page">
      <div className="page-header">
        <h2>📥 Tạo Yêu Cầu Nhập Kho (Inbound)</h2>
        <div className="header-actions">
          <button className="btn-cancel" onClick={() => window.history.back()}>Quay lại</button>
          <button className="btn-primary" onClick={handleSubmit}>Lưu Phiếu Nhập</button>
        </div>
      </div>

      <div className="inbound-content">
        {/* THÔNG TIN CHUNG (PHIẾU) */}
        <div className="info-section">
          <h3>Thông tin chứng từ</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nhà Cung Cấp <span className="required">*</span></label>
              <select value={nhaCungCapId} onChange={(e) => setNhaCungCapId(e.target.value)}>
                <option value="">-- Chọn Nhà Cung Cấp --</option>
                {dsNhaCungCap.map(ncc => (
                  <option key={ncc.id} value={ncc.id}>{ncc.tenNhaCungCap}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Ghi chú / Số hóa đơn (nếu có)</label>
              <input type="text" placeholder="Nhập ghi chú..." value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} />
            </div>
          </div>
        </div>

        {/* DYNAMIC FORM (CHI TIẾT PHIẾU) */}
        <div className="details-section">
          <div className="section-header">
            <h3>Danh sách mặt hàng nhập</h3>
            <button className="btn-add-row" onClick={handleAddRow}>+ Thêm dòng</button>
          </div>

          <table className="dynamic-table">
            <thead>
              <tr>
                <th>STT</th>
                <th width="35%">Mặt hàng <span className="required">*</span></th>
                <th width="15%">Số lượng <span className="required">*</span></th>
                <th width="20%">Đơn giá nhập (đ) <span className="required">*</span></th>
                <th width="20%">Thành tiền (đ)</th>
                <th width="10%">Xóa</th>
              </tr>
            </thead>
            <tbody>
              {chiTietPhieu.map((row, index) => (
                <tr key={index}>
                  <td className="text-center">{index + 1}</td>
                  <td>
                    <select value={row.hangHoaId} onChange={(e) => handleRowChange(index, 'hangHoaId', e.target.value)}>
                      <option value="">-- Chọn Hàng --</option>
                      {dsHangHoa.map(hh => (
                        <option key={hh.id} value={hh.id}>[{hh.maHangHoa}] {hh.tenHangHoa}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input 
                      type="number" min="1" className={row.soLuong <= 0 ? 'input-error' : ''}
                      value={row.soLuong} onChange={(e) => handleRowChange(index, 'soLuong', e.target.value)} 
                    />
                  </td>
                  <td>
                    <input 
                      type="number" min="0" className={row.donGia < 0 ? 'input-error' : ''}
                      value={row.donGia} onChange={(e) => handleRowChange(index, 'donGia', e.target.value)} 
                    />
                  </td>
                  <td className="fw-bold text-blue">
                    {(row.soLuong * row.donGia).toLocaleString('vi-VN')}
                  </td>
                  <td className="text-center">
                    <button className="btn-delete-icon" onClick={() => handleRemoveRow(index)}>&times;</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* TỔNG TIỀN */}
          <div className="total-summary">
            <span>Tổng giá trị phiếu nhập:</span>
            <span className="total-amount">{tongTienPhieu.toLocaleString('vi-VN')} VNĐ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaoPhieuNhap;