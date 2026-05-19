package com.ctut.wms.controller;

import com.ctut.wms.dto.PhieuNhapRequest;
import com.ctut.wms.service.PhieuNhapService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/phieu-nhap")
@RequiredArgsConstructor
public class PhieuNhapController {

    private final PhieuNhapService phieuNhapService;

    @PostMapping
    public ResponseEntity<String> taoPhieuNhap(@Valid @RequestBody PhieuNhapRequest request) {
        String ketQua = phieuNhapService.taoPhieuNhap(request);
        return ResponseEntity.ok(ketQua);
    }
}