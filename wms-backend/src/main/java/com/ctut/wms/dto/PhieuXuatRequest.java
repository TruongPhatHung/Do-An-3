package com.ctut.wms.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class PhieuXuatRequest {

    @NotBlank(message = "Mã đơn hàng E-commerce không được để trống")
    private String maDonHangEcom; // Rất quan trọng để đối soát với web bán hàng

    // Tạm thời truyền ID nhân viên kho phụ trách xuất đơn
    @NotNull(message = "ID Nhân viên xuất kho không được để trống")
    private Integer nhanVienId;

    @NotEmpty(message = "Đơn xuất phải có ít nhất 1 mặt hàng")
    private List<@Valid ChiTietPhieuXuatRequest> chiTietList;
}