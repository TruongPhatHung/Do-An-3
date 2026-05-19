package com.ctut.wms.service;

import com.ctut.wms.dto.PhieuNhapRequest;
import com.ctut.wms.entity.*;
import com.ctut.wms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PhieuNhapService {

    private final PhieuNhapRepository phieuNhapRepository;
    private final ChiTietPhieuNhapRepository chiTietPhieuNhapRepository;
    private final HangHoaRepository hangHoaRepository;
    private final TheKhoRepository theKhoRepository;
    private final NhaCungCapRepository nhaCungCapRepository;
    private final NguoiDungRepository nguoiDungRepository;

    /**
     * @Transactional: Đảm bảo nếu bị lỗi giữa chừng (VD: sai ID hàng hóa),
     * toàn bộ quá trình sẽ Rollback, không có dữ liệu rác nào được lưu vào DB.
     */
    @Transactional
    public String taoPhieuNhap(PhieuNhapRequest request) {

        // 1. Kiểm tra Nhà cung cấp và Nhân viên
        NhaCungCap ncc = nhaCungCapRepository.findById(request.getNhaCungCapId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhà cung cấp ID: " + request.getNhaCungCapId()));
        NguoiDung nhanVien = nguoiDungRepository.findById(request.getNhanVienId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhân viên ID: " + request.getNhanVienId()));

        // 2. Tạo Phiếu Nhập
        String maPhieu = "PN" + System.currentTimeMillis(); // Tạo mã phiếu ngẫu nhiên (VD: PN1678901234)
        PhieuNhap phieuNhap = PhieuNhap.builder()
                .maPhieu(maPhieu)
                .ngayLap(LocalDateTime.now())
                .trangThai("COMPLETED") // Giả định nhập kho thành công ngay lập tức
                .nhaCungCap(ncc)
                .nhanVien(nhanVien)
                .build();
        phieuNhap = phieuNhapRepository.save(phieuNhap); // Lưu để lấy ID

        // 3. Xử lý từng mặt hàng trong phiếu
        for (var chiTietReq : request.getChiTietList()) {

            HangHoa hangHoa = hangHoaRepository.findById(chiTietReq.getHangHoaId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Hàng hóa ID: " + chiTietReq.getHangHoaId()));

            // 3.1. Lưu Chi tiết phiếu nhập
            ChiTietPhieuNhap chiTiet = ChiTietPhieuNhap.builder()
                    .phieuNhap(phieuNhap)
                    .hangHoa(hangHoa)
                    .soLuong(chiTietReq.getSoLuong())
                    .donGia(chiTietReq.getDonGia())
                    .build();
            chiTietPhieuNhapRepository.save(chiTiet);

            // 3.2. CỘNG TỒN KHO VÀO BẢNG HÀNG HÓA
            hangHoa.setSoLuongTon(hangHoa.getSoLuongTon() + chiTietReq.getSoLuong());
            hangHoaRepository.save(hangHoa);

            // 3.3. GHI NHẬN LỊCH SỬ VÀO THẺ KHO
            TheKho theKho = TheKho.builder()
                    .thoiGian(LocalDateTime.now())
                    .loaiThayDoi("NHAP")
                    .soLuongThayDoi(chiTietReq.getSoLuong()) // Số dương vì là nhập vào
                    .maPhieuThamChieu(maPhieu)
                    .hangHoa(hangHoa)
                    .build();
            theKhoRepository.save(theKho);
        }

        return "Nhập kho thành công! Mã phiếu: " + maPhieu;
    }
}