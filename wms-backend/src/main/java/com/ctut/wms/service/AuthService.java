package com.ctut.wms.service;

import com.ctut.wms.entity.NguoiDung;
import com.ctut.wms.dto.AuthenticationRequest;
import com.ctut.wms.dto.AuthenticationResponse;
import com.ctut.wms.dto.RegisterRequest;
import com.ctut.wms.repository.NguoiDungRepository;
import com.ctut.wms.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final NguoiDungRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // HÀM ĐĂNG KÝ
    public AuthenticationResponse register(RegisterRequest request) {
        // 1. Tạo đối tượng Người Dùng mới
        var user = NguoiDung.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword())) // Bắt buộc phải mã hóa mật khẩu!
                .hoTen(request.getHoTen())
                .role(request.getRole())
                .build();

        // 2. Lưu vào Database
        repository.save(user);

        // 3. Tạo Token cho user này và trả về
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    // HÀM ĐĂNG NHẬP
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        // 1. Spring Security tự động kiểm tra username và password
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // 2. Nếu code chạy đến đây nghĩa là mật khẩu đúng, tiến hành lấy User từ DB
        var user = repository.findByUsername(request.getUsername())
                .orElseThrow();

        // 3. Tạo Token và trả về
        var jwtToken = jwtService.generateToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }
}