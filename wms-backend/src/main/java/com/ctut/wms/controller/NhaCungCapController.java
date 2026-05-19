package com.ctut.wms.controller;

import com.ctut.wms.dto.NhaCungCapRequest;
import com.ctut.wms.dto.NhaCungCapResponse;
import com.ctut.wms.service.NhaCungCapService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nha-cung-cap") // Endpoint gốc cho toàn bộ API liên quan đến NCC
@RequiredArgsConstructor
public class NhaCungCapController {

    private final NhaCungCapService service;

    // LẤY DANH SÁCH - Method GET: /api/nha-cung-cap
    @GetMapping
    public ResponseEntity<List<NhaCungCapResponse>> getAll() {
        return ResponseEntity.ok(service.getAll()); // HTTP 200 OK
    }

    // LẤY CHI TIẾT - Method GET: /api/nha-cung-cap/{id}
    @GetMapping("/{id}")
    public ResponseEntity<NhaCungCapResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // THÊM MỚI - Method POST: /api/nha-cung-cap
    @PostMapping
    public ResponseEntity<NhaCungCapResponse> create( @Valid @RequestBody NhaCungCapRequest request) {
        // HTTP 201 Created: Chuẩn RESTful khi tạo mới tài nguyên thành công
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    // CẬP NHẬT - Method PUT: /api/nha-cung-cap/{id}
    @PutMapping("/{id}")
    public ResponseEntity<NhaCungCapResponse> update(@PathVariable Integer id, @Valid @RequestBody NhaCungCapRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    // XÓA - Method DELETE: /api/nha-cung-cap/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build(); // HTTP 204 No Content: Xóa thành công, không trả về body
    }
}