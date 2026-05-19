package com.ctut.wms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class NhaCungCapRequest {
    @NotBlank(message = "Tên nhà cung cấp không được để trống")
    private String tenNcc;
    private String diaChi;
    @Pattern(regexp = "^(0|\\+84)[0-9]{9}$", message = "Số điện thoại không đúng định dạng")
    private String soDt;
    @Email(message = "Email không đúng định dạng")
    private String email;
}
