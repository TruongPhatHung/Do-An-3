package com.ctut.wms.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ChiTietPhieuNhapRequest {
    @NotNull(message = "ID hàng hóa không được để trống")
    private Integer hangHoaId;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng nhập phải lớn hơn 0")
    private Integer soLuong;

    @NotNull(message = "Đơn giá không được để trống")
    @Min(value = 0, message = "Đơn giá không được âm")
    private BigDecimal donGia;
}