package com.ctut.wms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoaiHangRequest {
    @NotBlank(message = "Tên loại hàng không được để trống")
    private String tenLoai;
    private String moTa;
}
