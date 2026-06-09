package com.ctut.wms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cong_no")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CongNo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "doi_tac")
    private String doiTac; // Tên khách hàng hoặc tên nhà cung cấp

    @Column(name = "loai_cong_no")
    private String loaiCongNo; // "PHAI_THU" hoặc "PHAI_TRA"

    @Column(name = "tong_no")
    private Double tongNo; // Tổng số tiền nợ

    @Column(name = "da_thanh_toan")
    private Double daThanhToan; // Đã trả được bao nhiêu

    @Column(name = "con_lai")
    private Double conLai; // Còn nợ bao nhiêu

    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat = LocalDateTime.now();
}
