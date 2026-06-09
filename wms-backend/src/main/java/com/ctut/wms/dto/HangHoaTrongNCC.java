package com.ctut.wms.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class HangHoaTrongNCC {
    private String maHang;
    private String tenHang;
    private Double donGia;

    // Hứng trực tiếp file ảnh tải lên của từng món hàng
    private MultipartFile hinhAnh;
}
