package com.ctut.wms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table(name = "Loai_hang")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoaiHang {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column (name = "ten_loai")
    private String tenLoai;

    @Column (name = "mo_ta")
    private String moTa;
}
