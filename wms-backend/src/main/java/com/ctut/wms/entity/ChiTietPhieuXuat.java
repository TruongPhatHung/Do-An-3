package com.ctut.wms.entity;



import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "chi_tiet_phieu_xuat")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChiTietPhieuXuat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phieu_xuat_id", nullable = false)
    private PhieuXuat phieuXuat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hang_hoa_id", nullable = false)
    private HangHoa hangHoa;

    @Column(name = "so_luong", nullable = false)
    private Integer soLuong;

    @Column(name = "don_gia", precision = 15, scale = 2)
    private BigDecimal donGia;
}