package com.ctut.wms.controller;

import com.ctut.wms.dto.LoaiHangRequest;
import com.ctut.wms.dto.LoaiHangResponse;
import com.ctut.wms.service.LoaiHangService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loai-hang") // Đường dẫn gốc cho toàn bộ API quản lý Loại hàng
@RequiredArgsConstructor
public class LoaiHangController {

    private final LoaiHangService service;

    // API: Lấy danh sách - Phương thức GET
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'QUANLYKHO')") // 🟢 Cho phép Admin và Quản lý kho xem
    public ResponseEntity<List<LoaiHangResponse>> getAll() {
        return ResponseEntity.ok(service.getAll()); // Trả về HTTP Status 200 (OK)
    }

    // API: Lấy chi tiết - Phương thức GET kèm ID trên đường dẫn
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'QUANLYKHO')") // 🟢 Cho phép Admin và Quản lý kho xem
    public ResponseEntity<LoaiHangResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // API: Thêm mới - Phương thức POST, nhận dữ liệu JSON từ body
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'QUANLYKHO')") // 🟢 Cho phép Admin và Quản lý kho thêm
    public ResponseEntity<LoaiHangResponse> create(@Valid @RequestBody LoaiHangRequest request) {
        // Trả về HTTP Status 201 (Created) khi tạo thành công
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    // API: Cập nhật - Phương thức PUT, nhận ID và dữ liệu mới
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'QUANLYKHO')") // 🟢 Cho phép Admin và Quản lý kho sửa
    public ResponseEntity<LoaiHangResponse> update(@PathVariable Integer id,@Valid @RequestBody LoaiHangRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    // API: Xóa - Phương thức DELETE
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'QUANLYKHO')") // 🟢 Cho phép Admin và Quản lý kho xóa
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build(); // Trả về 204 (No Content) báo hiệu đã xóa thành công
    }
}