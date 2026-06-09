package com.ctut.wms.controller;

import com.ctut.wms.entity.CongNo;
import com.ctut.wms.entity.GiaoDich;
import com.ctut.wms.repository.CongNoRepository;
import com.ctut.wms.repository.GiaoDichRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance")
@CrossOrigin(origins = "*") // 🟢 BỔ SUNG: Mở khóa CORS cho phép ReactJS gọi sang không bị chặn
@RequiredArgsConstructor
public class FinanceController {

    private final GiaoDichRepository giaoDichRepository;
    private final CongNoRepository congNoRepository;

    // 1. API: Lấy danh sách giao dịch Thu / Chi (Sổ quỹ)
    @GetMapping("/transactions")
    // 🟢 BỔ SUNG: Chặn luôn cả trường hợp Spring Boot tự gắn thêm chữ ROLE_
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'QUANLYKHO', 'ROLE_QUANLYKHO', 'KETOAN')")
    public ResponseEntity<List<GiaoDich>> getAllTransactions() {
        return ResponseEntity.ok(giaoDichRepository.findAll());
    }

    // 2. API: Lấy danh sách công nợ
    @GetMapping("/debts")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'QUANLYKHO', 'ROLE_QUANLYKHO', 'KETOAN')")
    public ResponseEntity<List<CongNo>> getAllDebts() {
        return ResponseEntity.ok(congNoRepository.findAll());
    }

    // 3. API: Lấy thông tin Tổng quan
    @GetMapping("/summary")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'QUANLYKHO', 'ROLE_QUANLYKHO', 'KETOAN')")
    public ResponseEntity<Map<String, Object>> getSummary() {
        List<GiaoDich> giaoDichList = giaoDichRepository.findAll();
        List<CongNo> congNoList = congNoRepository.findAll();

        double tongThu = giaoDichList.stream()
                .filter(g -> "THU".equals(g.getLoaiGiaoDich()) && g.getSoTien() != null)
                .mapToDouble(GiaoDich::getSoTien).sum();

        double tongChi = giaoDichList.stream()
                .filter(g -> "CHI".equals(g.getLoaiGiaoDich()) && g.getSoTien() != null)
                .mapToDouble(GiaoDich::getSoTien).sum();

        double soDuQuy = tongThu - tongChi;

        double tongPhaiThu = congNoList.stream()
                .filter(c -> "PHAI_THU".equals(c.getLoaiCongNo()) && c.getConLai() != null)
                .mapToDouble(CongNo::getConLai).sum();

        double tongPhaiTra = congNoList.stream()
                .filter(c -> "PHAI_TRA".equals(c.getLoaiCongNo()) && c.getConLai() != null)
                .mapToDouble(CongNo::getConLai).sum();

        Map<String, Object> summary = new HashMap<>();
        summary.put("soDuQuy", soDuQuy);
        summary.put("tongPhaiThu", tongPhaiThu);
        summary.put("tongPhaiTra", tongPhaiTra);

        return ResponseEntity.ok(summary);
    }

    // 4. API: Thanh toán công nợ
    @PostMapping("/pay-debt")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'QUANLYKHO', 'ROLE_QUANLYKHO', 'KETOAN')")
    public ResponseEntity<?> payDebt(@RequestBody Map<String, Object> request) {
        try {
            Integer debtId = Integer.parseInt(request.get("debtId").toString());
            Double amount = Double.parseDouble(request.get("amount").toString());

            CongNo congNo = congNoRepository.findById(debtId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy dữ liệu công nợ!"));

            Double daThanhToanMoi = (congNo.getDaThanhToan() != null ? congNo.getDaThanhToan() : 0) + amount;
            congNo.setDaThanhToan(daThanhToanMoi);
            congNo.setConLai(congNo.getTongNo() - daThanhToanMoi);
            congNo.setNgayCapNhat(LocalDateTime.now());
            congNoRepository.save(congNo);

            GiaoDich giaoDich = new GiaoDich();
            giaoDich.setMaGiaoDich("GD" + System.currentTimeMillis());
            String loaiGiaoDich = "PHAI_TRA".equals(congNo.getLoaiCongNo()) ? "CHI" : "THU";
            giaoDich.setLoaiGiaoDich(loaiGiaoDich);
            giaoDich.setSoTien(amount);
            giaoDich.setLyDo("Thanh toán công nợ cho đối tác: " + congNo.getDoiTac());
            giaoDich.setNgayGiaoDich(LocalDateTime.now());
            giaoDich.setNguoiThucHien("Hệ thống");

            giaoDichRepository.save(giaoDich);

            return ResponseEntity.ok(Map.of("message", "Thanh toán công nợ thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Lỗi xử lý giao dịch: " + e.getMessage()));
        }
    }
}