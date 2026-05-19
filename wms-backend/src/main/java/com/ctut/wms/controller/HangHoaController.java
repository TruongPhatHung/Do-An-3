package com.ctut.wms.controller;

import com.ctut.wms.dto.HangHoaResponse;
import com.ctut.wms.dto.HangHoaRequest;
import com.ctut.wms.service.HangHoaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping
@RestController
@RequiredArgsConstructor
public class HangHoaController {
    private final HangHoaService hangHoaService;

    // 1. LẤY DANH SÁCH (GET /api/hang-hoa)
    @GetMapping
    public ResponseEntity<List<HangHoaResponse>> getAllHangHoa(){
        return ResponseEntity.ok(hangHoaService.getAllHangHoa());
    }

    // 2. LẤY CHI TIẾT (GET /api/hang-hoa/{id})
    @GetMapping("/{id}")
    public ResponseEntity<HangHoaResponse> getHangHoaById(@PathVariable Integer id){
        return ResponseEntity.ok(hangHoaService.getHangHoaById(id));
    }
    // 3. THÊM MỚI (POST /api/hang-hoa)
    @PostMapping
    public ResponseEntity<HangHoaResponse> createHangHoa(@Valid @RequestBody HangHoaRequest request){
        HangHoaResponse response = hangHoaService.createHangHoa(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    // 4. CẬP NHẬT (PUT /api/hang-hoa/{id})
    @PutMapping("/{id}")
    public ResponseEntity<HangHoaResponse> updateHangHoa(@PathVariable Integer id, @Valid @RequestBody HangHoaRequest request){
        return ResponseEntity.ok(hangHoaService.updateHangHoa(id, request));
    }

    // 5. XÓA (DELETE /api/hang-hoa/{id})
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHangHoa(@PathVariable Integer id) {
        hangHoaService.deleteHangHoa(id);
        return ResponseEntity.noContent().build();
    }
    // 6. API Thống kê cảnh báo: GET /api/hang-hoa/canh-bao/sap-het
    @GetMapping("/canh-bao/sap-het")
    public ResponseEntity<List<HangHoaResponse>> getCanhBaoSapHetHang() {
        return ResponseEntity.ok(hangHoaService.layCanhBaoSapHetHang());
    }

    // 7. API Tìm kiếm: GET /api/hang-hoa/tim-kiem?tuKhoa=iphone
    @GetMapping("/tim-kiem")
    public ResponseEntity<List<HangHoaResponse>> searchHangHoa(@RequestParam String tuKhoa) {
        return ResponseEntity.ok(hangHoaService.timKiemTheoTen(tuKhoa));
    }

}
