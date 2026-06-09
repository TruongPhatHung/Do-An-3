package com.ctut.wms.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    // 1. API Thống kê tổng quan
    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN') or hasRole('QUANLYKHO')")
    public ResponseEntity<Map<String, Object>> getDashboardSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("soDuQuyTaiChinh", 0);
        summary.put("soLuongCanhBaoTon", 0);
        summary.put("tongPhieuNhap", 0);
        summary.put("tongPhieuXuat", 0);

        return ResponseEntity.ok(summary);
    }

    // 2. API Top Hàng Hóa (Giúp sửa lỗi 403 /top-hang-hoa)
    @GetMapping("/top-hang-hoa")
    @PreAuthorize("hasRole('ADMIN') or hasRole('QUANLYKHO')")
    public ResponseEntity<List<Object>> getTopHangHoa() {
        // Tạm thời trả về mảng rỗng để ReactJS render giao diện.
        // Sau này bạn có thể query database và điền dữ liệu thật vào đây
        return ResponseEntity.ok(new ArrayList<>());
    }

    // 3. API Biểu đồ doanh thu (Giúp sửa lỗi 403 /doanh-thu)
    @GetMapping("/doanh-thu")
    @PreAuthorize("hasRole('ADMIN') or hasRole('QUANLYKHO')")
    public ResponseEntity<List<Object>> getDoanhThu() {
        // Tạm thời trả về mảng rỗng
        return ResponseEntity.ok(new ArrayList<>());
    }
}