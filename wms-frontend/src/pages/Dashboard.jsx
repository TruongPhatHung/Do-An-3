// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area 
} from 'recharts';
import axiosClient from '../services/axiosClient';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  // 1. Khởi tạo toàn bộ State rỗng, chờ nạp từ Backend
  const [summary, setSummary] = useState({
    tongHangHoa: 0,
    soLuongCanhBaoTon: 0,
    tongPhieuNhap: 0,
    tongPhieuXuat: 0,
    soDuQuyTaiChinh: 0 // Gắn thêm phần Tài chính/Quỹ tiền của bạn vào đây
  });

  const [revenueData, setRevenueData] = useState([]); // Biểu đồ doanh thu
  const [topProducts, setTopProducts] = useState([]); // Top sản phẩm xuất nhập
  const [lowStockList, setLowStockList] = useState([]); // Danh sách hàng sắp hết

  const [loading, setLoading] = useState(true);

 // 2. Fetch dữ liệu thực tế đồng thời từ các API phân hệ
  useEffect(() => {
    const fetchDashboardContent = async () => {
      try {
        setLoading(true);
        const [statsRes, revenueRes, topRes, lowStockRes] = await Promise.all([
          axiosClient.get('/dashboard/summary').catch(() => ({})),
          axiosClient.get('/dashboard/doanh-thu').catch(() => []),
          axiosClient.get('/dashboard/top-hang-hoa').catch(() => []),
          
          // ĐÃ SỬA DÒNG NÀY: Đổi từ /dashboard/... thành /hang-hoa/...
          axiosClient.get('/hang-hoa/canh-bao-ton').catch(() => []) 
        ]);

        setSummary(statsRes);
        setRevenueData(revenueRes);
        setTopProducts(topRes);
        setLowStockList(lowStockRes);
      } catch (error) {
        toast.error("Không thể tải dữ liệu Dashboard từ máy chủ!");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardContent();
  }, []);

  // 3. Xử lý hàm In báo cáo nhanh cho hội đồng xem (Sử dụng window.print())
  const handlePrintReport = () => {
    window.print();
  };

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (loading) {
    return <div className="loading-container">⏳ Đang đồng bộ dữ liệu thời gian thực...</div>;
  }

  return (
    <div className="dashboard-root print-section">
      {/* HEADER DASHBOARD + NÚT IN ẤN */}
      <div className="dashboard-header no-print">
        <div>
          <h2>📊 Trung tâm Điều hành Kho vận & Tài chính</h2>
          <p className="subtitle">Số liệu phân tích tổng hợp hệ thống WMS</p>
        </div>
        <button className="btn-print-action" onClick={handlePrintReport}>
          🖨️ In báo cáo hệ thống
        </button>
      </div>

      {/* ================= KHU VỰC 4 THẺ THỐNG KÊ (CARDS) ================= */}
      <div className="summary-cards-grid">
        <div className="card-item card-finance">
          <div className="card-left">
            <span className="card-label">Quỹ Tài Chính Hiện Tại</span>
            <span className="card-num">{formatVND(summary.soDuQuyTaiChinh || 0)}</span>
          </div>
          <div className="card-icon">💰</div>
        </div>

        <div className="card-item card-alert">
          <div className="card-left">
            <span className="card-label">Cảnh Báo Tồn Kho Đỏ</span>
            <span className="card-num text-red">{summary.soLuongCanhBaoTon || 0} mã</span>
          </div>
          <div className="card-icon">⚠️</div>
        </div>

        <div className="card-item card-inbound">
          <div className="card-left">
            <span className="card-label">Giao Dịch Nhập Kho</span>
            <span className="card-num">{summary.tongPhieuNhap || 0} đơn</span>
          </div>
          <div className="card-icon">📥</div>
        </div>

        <div className="card-item card-outbound">
          <div className="card-left">
            <span className="card-label">Giao Dịch Xuất Kho</span>
            <span className="card-num">{summary.tongPhieuXuat || 0} đơn</span>
          </div>
          <div className="card-icon">📤</div>
        </div>
      </div>

      {/* ================= KHU VỰC BIỂU ĐỒ DOANH THU ================= */}
      <div className="dashboard-main-chart">
        <div className="chart-card-header">
          <h3>📈 Biểu Đồ Doanh Thu & Chi Phí Doanh Nghiệp (Dòng Tiền)</h3>
        </div>
        <div className="chart-body-wrapper">
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorXuat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#52c41a" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#52c41a" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNhap" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f5222d" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f5222d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#8c8c8c" />
                <YAxis tickFormatter={(v) => `${v / 1000000}M`} stroke="#8c8c8c" />
                <Tooltip formatter={(v) => formatVND(v)} />
                <Legend />
                <Area type="monotone" dataKey="xuat" name="Doanh Thu Xuất Kho" stroke="#52c41a" fillOpacity={1} fill="url(#colorXuat)" strokeWidth={2} />
                <Area type="monotone" dataKey="nhap" name="Chi Phí Nhập Kho" stroke="#f5222d" fillOpacity={1} fill="url(#colorNhap)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-chart-msg">Chưa ghi nhận dữ liệu biến động tài chính từ luồng giao dịch.</div>
          )}
        </div>
      </div>

      {/* ================= KHU VỰC CHIA ĐÔI: TOP XUẤT NHẬP & BẢNG CẢNH BÁO TỒN ================= */}
      <div className="dashboard-twin-grid">
        
        {/* KHỐI 1: TOP SẢN PHẨM BIẾN ĐỘNG MẠNH */}
        <div className="twin-box">
          <h3>🔥 Top Mặt Hàng Giao Dịch Nhiều Nhất</h3>
          <div className="table-wrapper">
            <table className="mini-dashboard-table">
              <thead>
                <tr>
                  <th>Mã Hàng</th>
                  <th>Tên Sản Phẩm</th>
                  <th className="text-right">Đã Nhập</th>
                  <th className="text-right">Đã Xuất</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((prod, index) => (
                  <tr key={index}>
                    <td><code>{prod.maHang}</code></td>
                    <td><b>{prod.tenHang}</b></td>
                    <td className="text-right text-blue">+{prod.daNhap || 0}</td>
                    <td className="text-right text-green">-{prod.daXuat || 0}</td>
                  </tr>
                ))}
                {topProducts.length === 0 && <tr><td colSpan="4" className="text-center text-muted">Chưa có số liệu xếp hạng hàng hóa</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* KHỐI 2: CHI TIẾT BẢNG CẢNH BÁO TỒN KHO (DƯỚI ĐỊNH MỨC AN TOÀN) */}
        <div className="twin-box border-top-red">
          <h3>🚨 Danh Sách Mặt Hàng Sắp Hết Trong Kho (Cảnh Báo Tồn)</h3>
          <div className="table-wrapper">
            <table className="mini-dashboard-table">
              <thead>
                <tr>
                  <th>Mã Hàng</th>
                  <th>Tên Sản Phẩm</th>
                  <th>Tồn Hiện Tại</th>
                  <th>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {lowStockList.map((item, index) => (
                  <tr key={index} className="row-danger-bg">
                    <td><code>{item.maHangHoa || item.maHang}</code></td>
                    <td>{item.tenHangHoa || item.tenHang}</td>
                    <td className="text-bold text-red">{item.tonKho}</td>
                    <td>
                      <span className="danger-badge">
                        {item.tonKho === 0 ? "Hết sạch hàng" : "Chạm đáy kho"}
                      </span>
                    </td>
                  </tr>
                ))}
                {lowStockList.length === 0 && <tr><td colSpan="4" className="text-center text-green text-bold">🎉 Tuyệt vời! Không có mặt hàng nào bị cảnh báo thiếu hàng.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;