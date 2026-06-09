package com.ctut.wms.controller;

import com.ctut.wms.entity.PhieuXuat;
import com.ctut.wms.repository.PhieuXuatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/xuat-kho") // Khớp với tab "Xử lý xuất kho" trên Frontend
@RequiredArgsConstructor
public class XuatKhoController {

    private final PhieuXuatRepository phieuXuatRepository;

    // 1. Lấy danh sách phiếu xuất để hiển thị lên bảng cho Thủ Kho
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'QUANLYKHO', 'NHANVIENKHO')")
    public ResponseEntity<List<Map<String, Object>>> getDanhSachXuatKho() {
        List<PhieuXuat> danhSach = phieuXuatRepository.findAll();

        // Map dữ liệu thành dạng Map để Frontend ReactJS dễ đọc
        List<Map<String, Object>> response = danhSach.stream().map(phieu -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", phieu.getId());
            map.put("maPhieu", phieu.getMaPhieu());
            map.put("ngayTao", phieu.getNgayXuat());
            map.put("trangThai", phieu.getTrangThai());

            // Vì entity của bạn lưu mã đơn hàng Ecom (thay vì ID khách hàng trực tiếp),
            // nên ta truyền mã đơn hàng này ra để FE hiển thị ở cột "Thông tin giao hàng/Khách hàng"
            map.put("khachHang", phieu.getMaDonHangEcom() != null ? phieu.getMaDonHangEcom() : "Xuất nội bộ");

            // Lấy tên nhân viên lập phiếu xuất
            map.put("nguoiTao", phieu.getNhanVien() != null ? phieu.getNhanVien().getHoTen() : "Không rõ");

            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // 2. Nút "Xác nhận xuất kho" (Đổi trạng thái từ PENDING sang COMPLETED)
    @PutMapping("/{id}/xac-nhan")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'QUANLYKHO', 'NHANVIENKHO')")
    public ResponseEntity<?> xacNhanXuatKho(@PathVariable Integer id) {
        PhieuXuat phieu = phieuXuatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu xuất"));

        // Cập nhật trạng thái thành COMPLETED
        phieu.setTrangThai("COMPLETED");

        // TODO: Nơi đây sau này bạn sẽ gọi service để chạy vòng lặp TRỪ SỐ LƯỢNG TỒN KHO cho các mặt hàng trong phiếu

        phieuXuatRepository.save(phieu);

        return ResponseEntity.ok(Map.of("message", "Đã xác nhận xuất kho thành công!"));
    }
}