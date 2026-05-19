package com.ctut.wms.service;

import com.ctut.wms.dto.PhieuXuatRequest;
import com.ctut.wms.entity.*;
import com.ctut.wms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PhieuXuatService {

    private final PhieuXuatRepository phieuXuatRepository;
    private final ChiTietPhieuXuatRepository chiTietPhieuXuatRepository;
    private final HangHoaRepository hangHoaRepository;
    private final TheKhoRepository theKhoRepository;
    private final NguoiDungRepository nguoiDungRepository;

    @Transactional
    public String taoPhieuXuat(PhieuXuatRequest request) {

        NguoiDung nhanVien = nguoiDungRepository.findById(request.getNhanVienId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhân viên ID: " + request.getNhanVienId()));

        // 1. Tạo Phiếu Xuất (Đại diện cho 1 đơn hàng E-commerce cần đóng gói)
        String maPhieu = "PX" + System.currentTimeMillis();
        PhieuXuat phieuXuat = PhieuXuat.builder()
                .maPhieu(maPhieu)
                .ngayXuat(LocalDateTime.now())
                .trangThai("COMPLETED")
                .maDonHangEcom(request.getMaDonHangEcom())
                .nhanVien(nhanVien)
                .build();
        phieuXuat = phieuXuatRepository.save(phieuXuat);

        // 2. Xử lý trừ kho cho từng mặt hàng
        for (var chiTietReq : request.getChiTietList()) {

            HangHoa hangHoa = hangHoaRepository.findById(chiTietReq.getHangHoaId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Hàng hóa ID: " + chiTietReq.getHangHoaId()));

            // ==========================================
            // CHỐT CHẶN 1: KIỂM TRA SỐ LƯỢNG TỒN (AVAILABILITY CHECK)
            // ==========================================
            if (hangHoa.getSoLuongTon() < chiTietReq.getSoLuong()) {
                // Nếu không đủ hàng, ném lỗi ngay lập tức. Toàn bộ @Transactional sẽ bị hủy (Rollback).
                throw new RuntimeException("Sản phẩm [" + hangHoa.getTenHang() +
                        "] không đủ số lượng tồn! (Chỉ còn: " + hangHoa.getSoLuongTon() + ")");
            }

            // 2.1 Lưu Chi tiết xuất
            ChiTietPhieuXuat chiTiet = ChiTietPhieuXuat.builder()
                    .phieuXuat(phieuXuat)
                    .hangHoa(hangHoa)
                    .soLuong(chiTietReq.getSoLuong())
                    .donGia(chiTietReq.getDonGia()) // Ghi nhận doanh thu lúc bán
                    .build();
            chiTietPhieuXuatRepository.save(chiTiet);

            // ==========================================
            // CHỐT CHẶN 2: TRỪ TỒN KHO & KHÓA LẠC QUAN (@Version)
            // ==========================================
            // Khi .save() được gọi, Hibernate sẽ tự động check trường @Version trong DB.
            // Nếu phát hiện Version đã bị một luồng khác thay đổi tích tắc trước đó,
            // Hibernate sẽ ném ra ObjectOptimisticLockingFailureException và chặn giao dịch này lại.
            hangHoa.setSoLuongTon(hangHoa.getSoLuongTon() - chiTietReq.getSoLuong());
            hangHoaRepository.save(hangHoa);

            // 2.3 Ghi nhận Thẻ kho (Lưu ý: Số lượng mang dấu ÂM để biểu diễn xuất kho)
            TheKho theKho = TheKho.builder()
                    .thoiGian(LocalDateTime.now())
                    .loaiThayDoi("XUAT")
                    .soLuongThayDoi(-chiTietReq.getSoLuong()) // DẤU ÂM MỚI CHUẨN KẾ TOÁN
                    .maPhieuThamChieu(maPhieu)
                    .hangHoa(hangHoa)
                    .build();
            theKhoRepository.save(theKho);
        }

        return "Xuất kho thành công! Mã phiếu: " + maPhieu;
    }
}