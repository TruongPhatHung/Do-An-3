// src/pages/TaoPhieuXuat.jsx
import { useState, useEffect } from 'react';
import axiosClient from '../services/axiosClient';
import { toast } from 'react-toastify';
import './TaoPhieuNhap.css'; // Tái sử dụng CSS của trang Phiếu Nhập cho đồng bộ UI

const TaoPhieuXuat = () => {
  const [dsHangHoa, setDsHangHoa] = useState([]);
  
  // Thông tin chung của phiếu xuất
  const [nguoiNhan, setNguoiNhan] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  
  // Giỏ hàng xuất (Dynamic Form)
  const [chiTietPhieu, setChiTietPhieu] = useState([
    { hangHoaId: '', soLuong: 1, donGia: 0, tonKhoHienTai: 0 }
  ]);

  // Tải danh sách Hàng Hóa (kèm số lượng tồn kho)
  useEffect(() => {
    const fetchHangHoa = async () => {
      try {
        const data = await axiosClient.get('/hang-hoa');
        setDsHangHoa(data || []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu hàng hóa:", error);
      }
    };
    fetchHangHoa();
  }, []);

  const handleAddRow = () => {
    setChiTietPhieu([...chiTietPhieu, { hangHoaId: '', soLuong: 1, donGia: 0, tonKhoHienTai: 0 }]);
  };

  const handleRemoveRow = (index) => {
    if (chiTietPhieu.length === 1) {
      toast.warning('Phiếu xuất phải có ít nhất 1 mặt hàng!');
      return;
    }
    const newData = chiTietPhieu.filter((_, i) => i !== index);
    setChiTietPhieu(newData);
  };

  const handleRowChange = (index, field, value) => {
    const newData = [...chiTietPhieu];
    
    if (field === 'hangHoaId') {
      const selectedHH = dsHangHoa.find(hh => hh.id === Number(value) || hh.id === value);
      newData[index]['hangHoaId'] = value;
      if (selectedHH) {
        newData[index]['donGia'] = selectedHH.donGia || 0;
        newData[index]['tonKhoHienTai'] = selectedHH.tonKho || 0; // Lưu lại tồn kho để kiểm tra
        
        // Reset lại số lượng về 1 khi đổi mặt hàng, nếu tồn kho = 0 thì gán = 0
        newData[index]['soLuong'] = selectedHH.tonKho > 0 ? 1 : 0; 
      }
    } else {
      newData[index][field] = (field === 'soLuong' || field === 'donGia') ? Number(value) : value;
    }
    
    setChiTietPhieu(newData);
  };

  const tongTienPhieu = chiTietPhieu.reduce((total, item) => total + (item.soLuong * item.donGia), 0);

  // LOGIC SUBMIT & KIỂM TRA TỒN KHO TRƯỚC KHI GỬI
  const handleSubmit = async () => {
    if (!nguoiNhan.trim()) return toast.error('Vui lòng nhập thông tin Người nhận hàng!');
    
    // Kiểm tra các lỗi logic (Trống hàng, xuất âm, XUẤT QUÁ TỒN KHO)
    for (let i = 0; i < chiTietPhieu.length; i++) {
      const item = chiTietPhieu[i];
      if (!item.hangHoaId) return toast.error(`Dòng thứ ${i + 1} chưa chọn mặt hàng!`);
      if (item.soLuong <= 0) return toast.error(`Dòng thứ ${i + 1} số lượng xuất phải lớn hơn 0!`);
      
      // LOGIC CHẶN XUẤT QUÁ KHO (Nghiệp vụ cốt lõi)
      if (item.soLuong > item.tonKhoHienTai) {
        return toast.error(`Lỗi dòng ${i + 1}: Vượt mức tồn kho! (Trong kho chỉ còn ${item.tonKhoHienTai})`);
      }
    }

    const payload = {
      nguoiNhan: nguoiNhan,
      ghiChu: ghiChu,
      tongTien: tongTienPhieu,
      chiTiet: chiTietPhieu.map(item => ({
        hangHoaId: item.hangHoaId,
        soLuong: item.soLuong,
        donGia: item.donGia
      }))
    };

    try {
      await axiosClient.post('/phieu-xuat', payload);
      toast.success('Tạo Phiếu Xuất Kho thành công!');
      setNguoiNhan(''); setGhiChu('');
      setChiTietPhieu([{ hangHoaId: '', soLuong: 1, donGia: 0, tonKhoHienTai: 0 }]);
    } catch (error) {
      // Lỗi được Axios bắt tự động
    }
  };

  return (
    <div className="page-container inbound-page">
      <div className="page-header">
        <h2>📤 Tạo Yêu Cầu Xuất Kho (Outbound)</h2>
        <div className="header-actions">
          <button className="btn-cancel" onClick={() => window.history.back()}>Quay lại</button>
          <button className="btn-primary" onClick={handleSubmit}>Lưu Phiếu Xuất</button>
        </div>
      </div>

      <div className="inbound-content">
        <div className="info-section">
          <h3>Thông tin chứng từ</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Người nhận / Khách hàng <span className="required">*</span></label>
              <input type="text" placeholder="Nhập tên người nhận hàng..." value={nguoiNhan} onChange={(e) => setNguoiNhan(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Ghi chú lý do xuất</label>
              <input type="text" placeholder="Nhập lý do xuất kho..." value={ghiChu} onChange={(e) => setGhiChu(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="details-section">
          <div className="section-header">
            <h3>Danh sách mặt hàng xuất</h3>
            <button className="btn-add-row" onClick={handleAddRow}>+ Thêm dòng</button>
          </div>

          <table className="dynamic-table">
            <thead>
              <tr>
                <th>STT</th>
                <th width="35%">Mặt hàng <span className="required">*</span></th>
                <th width="15%">Số lượng xuất <span className="required">*</span></th>
                <th width="20%">Đơn giá (đ) <span className="required">*</span></th>
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
                        <option key={hh.id} value={hh.id} disabled={hh.tonKho <= 0}>
                          [{hh.maHangHoa}] {hh.tenHangHoa} (Tồn: {hh.tonKho})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div style={{display: 'flex', flexDirection: 'column'}}>
                      <input 
                        type="number" min="1" 
                        // Đổi viền đỏ ngay lập tức nếu gõ lố số tồn kho
                        className={row.soLuong > row.tonKhoHienTai || row.soLuong <= 0 ? 'input-error' : ''}
                        value={row.soLuong} onChange={(e) => handleRowChange(index, 'soLuong', e.target.value)} 
                        disabled={!row.hangHoaId} // Khóa ô nhập nếu chưa chọn hàng
                      />
                      {row.hangHoaId && row.soLuong > row.tonKhoHienTai && (
                        <span className="error-text" style={{fontSize: '11px', marginTop: '4px'}}>
                          Vượt tồn kho ({row.tonKhoHienTai})
                        </span>
                      )}
                    </div>
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

          <div className="total-summary">
            <span>Tổng giá trị phiếu xuất:</span>
            <span className="total-amount">{tongTienPhieu.toLocaleString('vi-VN')} VNĐ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaoPhieuXuat;