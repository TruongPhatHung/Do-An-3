package com.ctut.wms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "phieu_xuat")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhieuXuat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_phieu", nullable = false, unique = true)
    private String maPhieu;

    @Column(name = "ngay_xuat")
    private LocalDateTime ngayXuat;

    @Column(name = "trang_thai")
    private String trangThai; // PENDING, COMPLETED

    @Column(name = "ma_don_hang_ecom")
    private String maDonHangEcom; // Liên kết với đơn hàng bên web bán hàng

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nhan_vien_id")
    private NguoiDung nhanVien;
}