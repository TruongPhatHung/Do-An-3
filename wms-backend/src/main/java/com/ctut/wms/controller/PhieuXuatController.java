package com.ctut.wms.controller;

import com.ctut.wms.dto.PhieuXuatRequest;
import com.ctut.wms.service.PhieuXuatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/phieu-xuat")
@RequiredArgsConstructor
public class PhieuXuatController {

    private final PhieuXuatService phieuXuatService;

    @PostMapping
    public ResponseEntity<String> taoPhieuXuat(@Valid @RequestBody PhieuXuatRequest request) {
        String ketQua = phieuXuatService.taoPhieuXuat(request);
        return ResponseEntity.ok(ketQua);
    }
}