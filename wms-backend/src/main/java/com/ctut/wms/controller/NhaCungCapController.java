package com.ctut.wms.controller;

import com.ctut.wms.dto.NhaCungCapRequest;
import com.ctut.wms.dto.NhaCungCapResponse;
import com.ctut.wms.service.NhaCungCapService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nha-cung-cap")
@CrossOrigin(origins = "*") // 🟢 BẮT BUỘC SỐ 1: Mở khóa CORS để React có thể gọi API không bị lỗi 403
@RequiredArgsConstructor
public class NhaCungCapController {

    private final NhaCungCapService service;

    // LẤY DANH SÁCH - Method GET: /api/nha-cung-cap
    @GetMapping
    public ResponseEntity<List<NhaCungCapResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    // LẤY CHI TIẾT - Method GET: /api/nha-cung-cap/{id}
    @GetMapping("/{id}")
    public ResponseEntity<NhaCungCapResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // THÊM MỚI - Method POST: /api/nha-cung-cap
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'QUANLYKHO', 'ROLE_QUANLYKHO')") // 🟢 Thêm phân quyền Security
    // 🟢 BẮT BUỘC SỐ 2: Đổi @RequestBody thành @ModelAttribute để nhận được FormData có chứa File ảnh
    public ResponseEntity<NhaCungCapResponse> create(@Valid @ModelAttribute NhaCungCapRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    // CẬP NHẬT - Method PUT: /api/nha-cung-cap/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN', 'QUANLYKHO', 'ROLE_QUANLYKHO')")
    // 🟢 Cập nhật cũng dùng @ModelAttribute nếu có upload lại ảnh
    public ResponseEntity<NhaCungCapResponse> update(@PathVariable Integer id, @Valid @ModelAttribute NhaCungCapRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    // XÓA - Method DELETE: /api/nha-cung-cap/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')") // Ví dụ chỉ Admin mới được xóa
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}