package com.ctut.wms.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "Hang_Hoa")
@Builder
@Entity
public class HangHoa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_hang", nullable = false, unique = true)
    private String maHang;

    @Column(name = "ten_hang", nullable = false)
    private String tenHang;

    @Column(name = "so_luong_ton", nullable = false)
    private Integer soLuongTon;

    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loai_id")
    private LoaiHang loaiHang;
}