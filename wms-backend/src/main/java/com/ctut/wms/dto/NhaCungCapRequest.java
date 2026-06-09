package com.ctut.wms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import java.util.List;

@Data
public class NhaCungCapRequest {

    @NotBlank(message = "Mã nhà cung cấp không được để trống")
    private String maNcc;

    @NotBlank(message = "Tên nhà cung cấp không được để trống")
    private String tenNcc;

    private String diaChi;

    @Pattern(regexp = "^(0|\\+84)[0-9]{9}$", message = "Số điện thoại không đúng định dạng")
    private String soDt;

    @Email(message = "Email không đúng định dạng")
    private String email;

    private String linhVuc;

    // Sử dụng class HangHoaTrongNCC từ file mới tạo ở trên
    private List<HangHoaTrongNCC> sanPhams;
}