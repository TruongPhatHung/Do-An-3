// src/pages/LenDon.jsx
import { useState, useEffect } from 'react';
import axiosClient from '../services/axiosClient';
import { toast } from 'react-toastify';
import './LenDon.css';

const LenDon = () => {
  // Quản lý Tab hoạt động: 'NHAP' hoặc 'XUAT'
  const [activeTab, setActiveTab] = useState('NHAP');

  // Master Data gọi từ Backend
  const [dsNhaCungCap, setDsNhaCungCap] = useState([]);
  const [dsHangHoa, setDsHangHoa] = useState([]);

  // State cho Đơn Nhập Kho
  const [nccId, setNccId] = useState('');
  const [ghiChuNhap, setGhiChuNhap] = useState('');
  const [chiTietNhap, setChiTietNhap] = useState([{ hangHoaId: '', soLuong: 1, donGia: 0 }]);

  // State cho Đơn Xuất Kho
  const [nguoiNhan, setNguoiNhan] = useState('');
  const [ghiChuXuat, setGhiChuXuat] = useState('');
  const [chiTietXuat, setChiTietXuat] = useState([{ hangHoaId: '', soLuong: 1, donGia: 0, tonKhoHienTai: 0 }]);

  // Tải dữ liệu nền khi vào trang
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nccData, hhData] = await Promise.all([
          axiosClient.get('/nha-cung-cap'),
          axiosClient.get('/hang-hoa')
        ]);
        setDsNhaCungCap(nccData || []);
        setDsHangHoa(hhData || []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu Master Data:", error);
      }
    };
    fetchData();
  }, []);

  // ==========================================
  // LOGIC XỬ LÝ TAB 1: LÊN ĐƠN NHẬP KHO
  // ==========================================
  const handleAddRowNhap = () => setChiTietNhap([...chiTietNhap, { hangHoaId: '', soLuong: 1, donGia: 0 }]);
  const handleRemoveRowNhap = (index) => {
    if (chiTietNhap.length === 1) return toast.warning('Phải có ít nhất 1 mặt hàng!');
    setChiTietNhap(chiTietNhap.filter((_, i) => i !== index));
  };
  const handleRowChangeNhap = (index, field, value) => {
    const newData = [...chiTietNhap];
    newData[index][field] = (field === 'soLuong' || field === 'donGia') ? Number(value) : value;
    if (field === 'hangHoaId') {
      const selected = dsHangHoa.find(hh => hh.id === Number(value) || hh.id === value);
      if (selected) newData[index]['donGia'] = selected.donGia || 0;
    }
    setChiTietNhap(newData);
  };
  const tongTienNhap = chiTietNhap.reduce((sum, item) => sum + (item.soLuong * item.donGia), 0);

  const handleSubmitNhap = async () => {
    if (!nccId) return toast.error('Vui lòng chọn Nhà cung cấp!');
    if (chiTietNhap.some(item => !item.hangHoaId || item.soLuong <= 0 || item.donGia < 0)) {
      return toast.error('Thông tin hàng nhập trên các dòng chưa hợp lệ!');
    }
    const payload = {
      nhaCungCapId: nccId, ghiChu: ghiChuNhap, tongTien: tongTienNhap,
      chiTiet: chiTietNhap
    };
    try {
      await axiosClient.post('/phieu-nhap', payload);
      toast.success('Lập đơn Nhập kho thành công (Trạng thái: Chờ nhận hàng)!');
      setNccId(''); setGhiChuNhap('');
      setChiTietNhap([{ hangHoaId: '', soLuong: 1, donGia: 0 }]);
    } catch (error) {}
  };

  // ==========================================
  // LOGIC XỬ LÝ TAB 2: LÊN ĐƠN XUẤT KHO
  // ==========================================
  const handleAddRowXuat = () => setChiTietXuat([...chiTietXuat, { hangHoaId: '', soLuong: 1, donGia: 0, tonKhoHienTai: 0 }]);
  const handleRemoveRowXuat = (index) => {
    if (chiTietXuat.length === 1) return toast.warning('Phải có ít nhất 1 mặt hàng!');
    setChiTietXuat(chiTietXuat.filter((_, i) => i !== index));
  };
  const handleRowChangeXuat = (index, field, value) => {
    const newData = [...chiTietXuat];
    if (field === 'hangHoaId') {
      const selected = dsHangHoa.find(hh => hh.id === Number(value) || hh.id === value);
      newData[index]['hangHoaId'] = value;
      if (selected) {
        newData[index]['donGia'] = selected.donGia || 0;
        newData[index]['tonKhoHienTai'] = selected.tonKho || 0;
        newData[index]['soLuong'] = selected.tonKho > 0 ? 1 : 0;
      }
    } else {
      newData[index][field] = (field === 'soLuong' || field === 'donGia') ? Number(value) : value;
    }
    setChiTietXuat(newData);
  };
  const tongTienXuat = chiTietXuat.reduce((sum, item) => sum + (item.soLuong * item.donGia), 0);

  const handleSubmitXuat = async () => {
    if (!nguoiNhan.trim()) return toast.error('Vui lòng nhập người nhận hàng!');
    for (let i = 0; i < chiTietXuat.length; i++) {
      const item = chiTietXuat[i];
      if (!item.hangHoaId) return toast.error(`Dòng ${i+1} chưa chọn hàng hóa!`);
      if (item.soLuong > item.tonKhoHienTai) {
        return toast.error(`Dòng ${i+1}: Số lượng xuất vượt quá tồn kho thực tế (${item.tonKhoHienTai})!`);
      }
    }
    const payload = {
      nguoiNhan, ghiChu: ghiChuXuat, tongTien: tongTienXuat,
      chiTiet: chiTietXuat.map(i => ({ hangHoaId: i.hangHoaId, soLuong: i.soLuong, donGia: i.donGia }))
    };
    try {
      await axiosClient.post('/phieu-xuat', payload);
      toast.success('Lập đơn Xuất kho thành công (Trạng thái: Chờ lấy hàng)!');
      setNguoiNhan(''); setGhiChuXuat('');
      setChiTietXuat([{ hangHoaId: '', soLuong: 1, donGia: 0, tonKhoHienTai: 0 }]);
    } catch (error) {}
  };

  return (
    <div className="lendon-container">
      {/* THANH CHỌN TABS ĐƠN HÀNG */}
      <div className="tabs-header">
        <button className={`tab-button ${activeTab === 'NHAP' ? 'active-tab' : ''}`} onClick={() => setActiveTab('NHAP')}>
          📥 1. Lập Đơn Nhập Kho
        </button>
        <button className={`tab-button ${activeTab === 'XUAT' ? 'active-tab' : ''}`} onClick={() => setActiveTab('XUAT')}>
          📤 2. Lập Đơn Xuất Kho
        </button>
      </div>

      <div className="tab-content-wrapper">
        {/* ================= GIAO DIỆN TAB NHẬP ================= */}
        {activeTab === 'NHAP' && (
          <div className="fade-in">
            <div className="section-box">
              <h4>Thông tin chung đơn nhập</h4>
              <div className="grid-2-col">
                <div className="form-item">
                  <label>Chọn Nhà Cung Cấp <span className="red-star">*</span></label>
                  <select value={nccId} onChange={(e) => setNccId(e.target.value)}>
                    <option value="">-- Chọn nhà cung cấp --</option>
                    {dsNhaCungCap.map(ncc => <option key={ncc.id} value={ncc.id}>{ncc.tenNhaCungCap}</option>)}
                  </select>
                </div>
                <div className="form-item">
                  <label>Ghi chú đơn nhập</label>
                  <input type="text" placeholder="Nhập ghi chú hoặc lý do nhập..." value={ghiChuNhap} onChange={(e) => setGhiChuNhap(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="section-box">
              <div className="flex-space">
                <h4>Chi tiết danh sách hàng nhập</h4>
                <button className="add-row-btn" onClick={handleAddRowNhap}>+ Thêm dòng</button>
              </div>
              <table className="order-table">
                <thead>
                  <tr>
                    <th>STT</th><th>Hàng hóa <span className="red-star">*</span></th><th width="15%">Số lượng</th><th width="20%">Đơn giá nhập (đ)</th><th>Thành tiền</th><th>Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {chiTietNhap.map((row, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <select value={row.hangHoaId} onChange={(e) => handleRowChangeNhap(index, 'hangHoaId', e.target.value)}>
                          <option value="">-- Chọn hàng hóa --</option>
                          {dsHangHoa.map(hh => <option key={hh.id} value={hh.id}>[{hh.maHangHoa}] {hh.tenHangHoa}</option>)}
                        </select>
                      </td>
                      <td><input type="number" min="1" value={row.soLuong} onChange={(e) => handleRowChangeNhap(index, 'soLuong', e.target.value)} /></td>
                      <td><input type="number" min="0" value={row.donGia} onChange={(e) => handleRowChangeNhap(index, 'donGia', e.target.value)} /></td>
                      <td className="text-right text-bold">{(row.soLuong * row.donGia).toLocaleString('vi-VN')} đ</td>
                      <td><button className="del-btn" onClick={() => handleRemoveRowNhap(index)}>&times;</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="total-bar">
                <span>Tổng giá trị đơn nhập:</span>
                <span className="price-tag">{tongTienNhap.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
            <div className="action-bar"><button className="submit-main-btn btn-blue" onClick={handleSubmitNhap}>Xác Nhận Lên Đơn Nhập</button></div>
          </div>
        )}

        {/* ================= GIAO DIỆN TAB XUẤT ================= */}
        {activeTab === 'XUAT' && (
          <div className="fade-in">
            <div className="section-box">
              <h4>Thông tin chung đơn xuất</h4>
              <div className="grid-2-col">
                <div className="form-item">
                  <label>Tên Khách hàng / Người nhận <span className="red-star">*</span></label>
                  <input type="text" placeholder="Nhập tên người nhận hàng..." value={nguoiNhan} onChange={(e) => setNguoiNhan(e.target.value)} />
                </div>
                <div className="form-item">
                  <label>Ghi chú lý do xuất</label>
                  <input type="text" placeholder="Lý do xuất kho..." value={ghiChuXuat} onChange={(e) => setGhiChuXuat(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="section-box">
              <div className="flex-space">
                <h4>Chi tiết danh sách hàng xuất</h4>
                <button className="add-row-btn" onClick={handleAddRowXuat}>+ Thêm dòng</button>
              </div>
              <table className="order-table">
                <thead>
                  <tr>
                    <th>STT</th><th>Hàng hóa xuất <span className="red-star">*</span></th><th width="18%">Số lượng</th><th width="20%">Đơn giá xuất (đ)</th><th>Thành tiền</th><th>Xóa</th>
                  </tr>
                </thead>
                <tbody>
                  {chiTietXuat.map((row, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>
                        <select value={row.hangHoaId} onChange={(e) => handleRowChangeXuat(index, 'hangHoaId', e.target.value)}>
                          <option value="">-- Chọn hàng hóa --</option>
                          {dsHangHoa.map(hh => (
                            <option key={hh.id} value={hh.id} disabled={hh.tonKho <= 0}>
                              [{hh.maHangHoa}] {hh.tenHangHoa} (Sẵn có: {hh.tonKho})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input 
                          type="number" min="1" 
                          className={row.soLuong > row.tonKhoHienTai ? 'border-red' : ''}
                          value={row.soLuong} onChange={(e) => handleRowChangeXuat(index, 'soLuong', e.target.value)}
                          disabled={!row.hangHoaId}
                        />
                        {row.hangHoaId && row.soLuong > row.tonKhoHienTai && (
                          <div className="alert-text">Vượt kho (Tồn: {row.tonKhoHienTai})</div>
                        )}
                      </td>
                      <td><input type="number" min="0" value={row.donGia} onChange={(e) => handleRowChangeXuat(index, 'donGia', e.target.value)} /></td>
                      <td className="text-right text-bold">{(row.soLuong * row.donGia).toLocaleString('vi-VN')} đ</td>
                      <td><button className="del-btn" onClick={() => handleRemoveRowXuat(index)}>&times;</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="total-bar">
                <span>Tổng giá trị đơn xuất:</span>
                <span className="price-tag red-price">{tongTienXuat.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
            <div className="action-bar"><button className="submit-main-btn btn-orange" onClick={handleSubmitXuat}>Xác Nhận Lên Đơn Xuất</button></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LenDon;
