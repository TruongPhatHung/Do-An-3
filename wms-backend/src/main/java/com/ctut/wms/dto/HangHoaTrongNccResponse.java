package com.ctut.wms.dto;

import lombok.Data;

@Data
public class HangHoaTrongNccResponse {
    private Integer id;
    private String maHang;
    private String tenHang;

    private Double donGia;

    // 🟢 BỔ SUNG: Thêm trường hình ảnh (kiểu String để lưu URL hoặc tên file ảnh)
    private String hinhAnh;
}