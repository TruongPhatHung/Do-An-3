package com.ctut.wms.entity;



import jakarta.persistence.*;
import lombok.*;

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

    @Column(name = "ten_ncc", nullable = false)
    private String tenNcc;

    @Column(name = "dia_chi")
    private String diaChi;

    @Column(name = "so_dt")
    private String soDt;

    private String email;
}
