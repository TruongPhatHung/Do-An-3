package com.ctut.wms.dto;

import lombok.Data;
import java.util.List;

@Data
public class NhaCungCapResponse {
    private Integer id;

    // 🟢 THÊM: Mã NCC và Lĩnh vực
    private String maNcc;
    private String linhVuc;

    private String tenNcc;
    private String diaChi;
    private String soDt;
    private String email;

    // Trong file NhaCungCapResponse.java
    private List<HangHoaTrongNccResponse> sanPhams;
}