package com.ctut.wms.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ChiTietPhieuXuatRequest {
    @NotNull(message = "ID hàng hóa không được để trống")
    private Integer hangHoaId;

    @NotNull(message = "Số lượng xuất không được để trống")
    @Min(value = 1, message = "Số lượng xuất phải lớn hơn 0")
    private Integer soLuong;

    @NotNull(message = "Giá bán không được để trống")
    @Min(value = 0, message = "Giá bán không được âm")
    private BigDecimal donGia; // Giá bán chốt tại thời điểm khách đặt hàng
}