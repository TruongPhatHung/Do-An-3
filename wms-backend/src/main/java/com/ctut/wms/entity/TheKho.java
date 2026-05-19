package com.ctut.wms.entity;



import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "the_kho")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TheKho {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "thoi_gian", nullable = false)
    private LocalDateTime thoiGian;

    @Column(name = "loai_thay_doi", nullable = false)
    private String loaiThayDoi; // NHAP, XUAT, KIEM_KE

    @Column(name = "so_luong_thay_doi", nullable = false)
    private Integer soLuongThayDoi; // Có thể mang dấu dương (+10) hoặc âm (-5)

    @Column(name = "ma_phieu_tham_chieu")
    private String maPhieuThamChieu; // Lưu mã phiếu xuất hoặc phiếu nhập

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hang_hoa_id", nullable = false)
    private HangHoa hangHoa;
}
