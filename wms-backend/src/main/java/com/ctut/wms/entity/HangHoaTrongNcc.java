package com.ctut.wms.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "san_pham_ncc") // Tên bảng mới trong Database
@Builder
@Entity
public class HangHoaTrongNcc {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_hang")
    private String maHang;

    @Column(name = "ten_hang")
    private String tenHang;

    @Column(name = "don_gia")
    private Double donGia;

    @Column(name = "hinh_anh")
    private String hinhAnh;

    // Liên kết trực tiếp với Nhà Cung Cấp
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nha_cung_cap_id")
    @JsonBackReference
    private NhaCungCap nhaCungCap;
}