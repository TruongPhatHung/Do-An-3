package com.ctut.wms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "giao_dich")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiaoDich {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_giao_dich", nullable = false, unique = true)
    private String maGiaoDich; // VD: PT001 (Phiếu Thu), PC001 (Phiếu Chi)

    @Column(name = "loai_giao_dich")
    private String loaiGiaoDich; // "THU" hoặc "CHI"

    @Column(name = "so_tien")
    private Double soTien;

    @Column(name = "ly_do")
    private String lyDo; // Mô tả lý do thu chi

    @Column(name = "ngay_giao_dich")
    private LocalDateTime ngayGiaoDich = LocalDateTime.now();

    @Column(name = "nguoi_thuc_hien")
    private String nguoiThucHien; // Nhân viên tạo giao dịch
}
