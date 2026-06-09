package com.ctut.wms.controller;

import com.ctut.wms.entity.PhieuNhap;
import com.ctut.wms.repository.PhieuNhapRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/nhap-kho") // Khớp với tab "Xử lý nhập kho" trên Frontend
@RequiredArgsConstructor
public class NhapKhoController {

    private final PhieuNhapRepository phieuNhapRepository;

    // 1. Lấy danh sách phiếu nhập hiển thị lên bảng cho Thủ Kho xem
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'QUANLYKHO', 'NHANVIENKHO')")
    public ResponseEntity<List<Map<String, Object>>> getDanhSachNhapKho() {
        List<PhieuNhap> danhSach = phieuNhapRepository.findAll();

        // Map dữ liệu thành dạng cơ bản để Frontend ReactJS dễ render lên bảng
        List<Map<String, Object>> response = danhSach.stream().map(phieu -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", phieu.getId());
            map.put("maPhieu", phieu.getMaPhieu());
            map.put("ngayTao", phieu.getNgayLap());
            map.put("trangThai", phieu.getTrangThai());

            // 🟢 ĐÃ SỬA: Dùng getTenNcc() khớp với Entity NhaCungCap của bạn
            map.put("nhaCungCap", phieu.getNhaCungCap() != null ? phieu.getNhaCungCap().getTenNcc() : "Không có");

            // Lấy tên nhân viên lập phiếu
            map.put("nguoiTao", phieu.getNhanVien() != null ? phieu.getNhanVien().getHoTen() : "Không rõ");

            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // 2. Nút "Xác nhận nhập kho" (Đổi trạng thái từ DRAFT sang COMPLETED)
    @PutMapping("/{id}/xac-nhan")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'QUANLYKHO', 'NHANVIENKHO')")
    public ResponseEntity<?> xacNhanNhapKho(@PathVariable Integer id) {
        PhieuNhap phieu = phieuNhapRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu nhập"));

        // Đổi trạng thái phiếu thành COMPLETED (Hoàn thành)
        phieu.setTrangThai("COMPLETED");

        // TODO: Nơi đây sau này bạn sẽ gọi service để chạy vòng lặp CỘNG SỐ LƯỢNG TỒN KHO cho từng mặt hàng

        phieuNhapRepository.save(phieu);

        return ResponseEntity.ok(Map.of("message", "Đã xác nhận nhập kho thành công!"));
    }
}