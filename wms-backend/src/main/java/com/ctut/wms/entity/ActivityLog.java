package com.ctut.wms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs") // Tên bảng trong Database
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder // Annotation này giúp sửa lỗi đỏ chỗ ActivityLog.builder()
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "hanh_dong")
    private String hanhDong;

    @Column(name = "chi_tiet")
    private String chiTiet;

    @Column(name = "thoi_gian")
    private LocalDateTime thoiGian;
}