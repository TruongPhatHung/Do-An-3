package com.ctut.wms.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class PhieuNhapRequest {
    @NotNull(message = "ID Nhà cung cấp không được để trống")
    private Integer nhaCungCapId;

    // Tạm thời truyền ID nhân viên từ Postman cho dễ test
    @NotNull(message = "ID Nhân viên lập phiếu không được để trống")
    private Integer nhanVienId;

    @NotEmpty(message = "Phiếu nhập phải có ít nhất 1 mặt hàng")
    private List<@Valid ChiTietPhieuNhapRequest> chiTietList;
}