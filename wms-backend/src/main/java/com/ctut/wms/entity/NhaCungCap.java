package com.ctut.wms.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.util.List;

@Entity
@Table(name = "nha_cung_cap")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhaCungCap {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // 1. Thêm Mã NCC (Frontend đang gọi item.maNcc)
    @Column(name = "ma_ncc")
    private String maNcc;

    @Column(name = "ten_ncc", nullable = false)
    private String tenNcc;

    // 2. Thêm Lĩnh vực (Frontend đang gọi item.linhVuc dưới dạng chuỗi JSON hoặc Text)
    @Column(name = "linh_vuc")
    private String linhVuc;

    @Column(name = "dia_chi")
    private String diaChi;

    @Column(name = "so_dt")
    private String soDt;

    private String email;

    // 3. Thêm mối quan hệ với bảng Hàng Hóa để trượt xuống hiển thị Sản phẩm
    @OneToMany(mappedBy = "nhaCungCap", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<HangHoaTrongNcc> sanPhams;
}