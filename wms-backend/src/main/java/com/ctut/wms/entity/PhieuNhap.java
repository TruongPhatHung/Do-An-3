package com.ctut.wms.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "phieu_nhap")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhieuNhap {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_phieu", nullable = false, unique = true)
    private String maPhieu;

    @Column(name = "ngay_lap")
    private LocalDateTime ngayLap;

    @Column(name = "trang_thai")
    private String trangThai; // DRAFT, COMPLETED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ncc_id")
    private NhaCungCap nhaCungCap;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nhan_vien_id")
    private NguoiDung nhanVien;
}
