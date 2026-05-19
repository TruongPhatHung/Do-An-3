package com.ctut.wms.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HangHoaRequest {

    @NotBlank(message = "Mã hàng không được để trống")
    private String maHang;

    @NotBlank(message = "Tên hàng không được để trống")
    private String tenHang;

    @NotNull(message = "Số lượng tồn không được để null")
    @Min(value = 0, message = "Số lượng tồn không được nhỏ hơn 0")
    private Integer soLuongTon;

    @NotNull(message = "ID Loại hàng không được để trống")
    private Integer loaiHangId;
}