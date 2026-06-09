package com.ctut.wms.controller;

import com.ctut.wms.entity.ActivityLog;
import com.ctut.wms.entity.NguoiDung;
import com.ctut.wms.repository.ActivityLogRepository;
import com.ctut.wms.repository.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final NguoiDungRepository nguoiDungRepository;
    private final PasswordEncoder passwordEncoder;
    private final ActivityLogRepository activityLogRepository;

    // 1. Lấy danh sách - Hiển thị Hoạt động cuối và Trạng thái thực tế
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<NguoiDung> danhSachNguoiDung = nguoiDungRepository.findAll();

        List<Map<String, Object>> response = danhSachNguoiDung.stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", user.getId());
            map.put("username", user.getUsername());
            map.put("hoTen", user.getHoTen());
            map.put("role", user.getRole());
            map.put("avatar", user.getAvatar());

            // 🟢 Lấy Hoạt động cuối cùng của nhân viên này từ bảng ActivityLog
            List<ActivityLog> logs = activityLogRepository.findByUserIdOrderByThoiGianDesc(user.getId());
            if (!logs.isEmpty()) {
                ActivityLog latestLog = logs.get(0);
                map.put("lastAction", latestLog.getChiTiet());
                map.put("lastActionTime", latestLog.getThoiGian());
            } else {
                map.put("lastAction", "Chưa có hoạt động");
                map.put("lastActionTime", null);
            }

            // Lấy trạng thái thực tế từ cột status trong DB (ACTIVE / OFFLINE)
            map.put("status", user.getStatus() != null ? user.getStatus() : "OFFLINE");

            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // 2. Lấy chi tiết
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Integer id) {
        NguoiDung user = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("username", user.getUsername());
        map.put("hoTen", user.getHoTen());
        map.put("role", user.getRole());

        map.put("status", user.getStatus() != null ? user.getStatus() : "OFFLINE");

        map.put("ngaySinh", user.getNgaySinh());
        map.put("gioiTinh", user.getGioiTinh());
        map.put("cmnd", user.getCmnd());
        map.put("phone", user.getPhone());
        map.put("address", user.getAddress());
        map.put("avatar", user.getAvatar());
        return ResponseEntity.ok(map);
    }

    // 3. API cập nhật thông tin hồ sơ
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> updateUser(@PathVariable Integer id, @RequestBody Map<String, Object> updateData) {
        NguoiDung user = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        if (updateData.containsKey("hoTen")) user.setHoTen((String) updateData.get("hoTen"));
        if (updateData.containsKey("ngaySinh")) user.setNgaySinh((String) updateData.get("ngaySinh"));
        if (updateData.containsKey("gioiTinh")) user.setGioiTinh((String) updateData.get("gioiTinh"));
        if (updateData.containsKey("cmnd")) user.setCmnd((String) updateData.get("cmnd"));
        if (updateData.containsKey("phone")) user.setPhone((String) updateData.get("phone"));
        if (updateData.containsKey("address")) user.setAddress((String) updateData.get("address"));
        if (updateData.containsKey("avatar")) user.setAvatar((String) updateData.get("avatar"));

        nguoiDungRepository.save(user);

        // 🟢 ĐÃ SỬA: Log thuộc về người đang đăng nhập thực hiện thao tác
        String currentActionUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<NguoiDung> actorOpt = nguoiDungRepository.findByUsername(currentActionUsername);

        if (actorOpt.isPresent()) {
            ActivityLog log = ActivityLog.builder()
                    .userId(actorOpt.get().getId()) // Ghi log vào ID của người thao tác
                    .hanhDong("Cập nhật hồ sơ")
                    .chiTiet("Đã cập nhật thông tin cho tài khoản: " + user.getUsername())
                    .thoiGian(LocalDateTime.now())
                    .build();
            activityLogRepository.save(log);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        return ResponseEntity.ok(response);
    }

    // 4. API ĐỔI MẬT KHẨU
    @PutMapping("/{id}/change-password")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<?> changePassword(@PathVariable Integer id, @RequestBody Map<String, String> request) {
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        NguoiDung user = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu hiện tại không chính xác!"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        nguoiDungRepository.save(user);

        // 🟢 ĐÃ SỬA: Log thuộc về người đang đăng nhập thực hiện thao tác
        String currentActionUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<NguoiDung> actorOpt = nguoiDungRepository.findByUsername(currentActionUsername);

        if (actorOpt.isPresent()) {
            ActivityLog log = ActivityLog.builder()
                    .userId(actorOpt.get().getId()) // Ghi log vào ID của người thao tác
                    .hanhDong("Đổi mật khẩu")
                    .chiTiet("Đã đổi mật khẩu cho tài khoản: " + user.getUsername())
                    .thoiGian(LocalDateTime.now())
                    .build();
            activityLogRepository.save(log);
        }

        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công!"));
    }

    // 5. API TRẢ VỀ DANH SÁCH LỊCH SỬ HOẠT ĐỘNG
    @GetMapping("/{id}/activities")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<List<ActivityLog>> getUserActivities(@PathVariable Integer id) {
        List<ActivityLog> logs = activityLogRepository.findByUserIdOrderByThoiGianDesc(id);
        return ResponseEntity.ok(logs);
    }

    // 6. API TIẾP NHẬN DỮ LIỆU TẠO TÀI KHOẢN TỪ FRONTEND
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> requestData) {
        try {
            String username = (String) requestData.get("username");

            if (nguoiDungRepository.findByUsername(username).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Tên đăng nhập này đã tồn tại trên hệ thống!"));
            }

            NguoiDung user = new NguoiDung();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode((String) requestData.get("password")));
            user.setRole((String) requestData.get("role"));
            user.setHoTen((String) requestData.get("hoTen"));
            user.setNgaySinh((String) requestData.get("ngaySinh"));
            user.setGioiTinh((String) requestData.get("gioiTinh"));

            // Mặc định tài khoản mới khởi tạo sẽ ở trạng thái OFFLINE
            user.setStatus("OFFLINE");

            user.setCmnd((String) requestData.get("cccd"));
            user.setPhone((String) requestData.get("soDienThoai"));
            user.setAddress((String) requestData.get("diaChi"));
            user.setAvatar((String) requestData.get("avatar"));

            NguoiDung savedUser = nguoiDungRepository.save(user);

            // 🟢 ĐÃ SỬA: Log thuộc về Admin/Người tạo chứ KHÔNG thuộc về tài khoản mới
            String currentActionUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            Optional<NguoiDung> actorOpt = nguoiDungRepository.findByUsername(currentActionUsername);

            if (actorOpt.isPresent()) {
                ActivityLog log = ActivityLog.builder()
                        .userId(actorOpt.get().getId()) // Lấy chuẩn ID của người đang thực hiện request
                        .hanhDong("Tạo tài khoản")
                        .chiTiet("Đã khởi tạo tài khoản mới cho nhân viên: " + username)
                        .thoiGian(LocalDateTime.now())
                        .build();
                activityLogRepository.save(log);
            }

            return ResponseEntity.ok(Map.of("message", "Tạo tài khoản thành công!"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Có lỗi xảy ra khi tạo tài khoản: " + e.getMessage()));
        }
    }
}