package com.ctut.wms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "nguoi_dung")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NguoiDung implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(name = "ho_ten")
    private String hoTen;

    @Column(nullable = false)
    private String role; // ADMIN, THU_KHO, KE_TOAN...

    // 🟢 THÊM CỘT TRẠNG THÁI ĐỂ FIX LỖI ĐỎ Ở CONTROLLER
    // Mặc định khi tạo tài khoản mới hoặc khởi tạo sẽ là OFFLINE
    @Column(name = "status")
    private String status = "OFFLINE";

    // CÁC CỘT HỒ SƠ
    @Column(name = "ngay_sinh")
    private String ngaySinh;

    @Column(name = "gioi_tinh")
    private String gioiTinh;

    @Column(name = "cmnd")
    private String cmnd;

    @Column(name = "phone")
    private String phone;

    @Column(name = "address")
    private String address;

    @Column(name = "avatar", columnDefinition = "TEXT")
    private String avatar;

    // --- CÁC HÀM BẮT BUỘC CỦA SPRING SECURITY ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}