package com.ctut.wms.dto;


import lombok.Data;

@Data
public class HangHoaResponse {
    private Integer id;
    private String maHang;
    private String tenHang;
    private Integer soLuongTon;

    // Trả về cả ID và Tên loại hàng để Frontend dễ hiển thị lên bảng (Table)
    private Integer loaiHangId;
    private String tenLoaiHang;

}
