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

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final NguoiDungRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // HÀM ĐĂNG KÝ
    public AuthenticationResponse register(RegisterRequest request) {
        var user = NguoiDung.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .hoTen(request.getHoTen())
                .role(request.getRole())
                .status("ACTIVE") // 🟢 Vừa đăng ký xong có thể cho ACTIVE luôn
                .build();

        repository.save(user);

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("hoTen", user.getHoTen());
        extraClaims.put("role", user.getRole());

        var jwtToken = jwtService.generateToken(extraClaims, user);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .avatar(user.getAvatar())
                .build();
    }

    // HÀM ĐĂNG NHẬP
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        // 1. Kiểm tra tài khoản mật khẩu
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // 2. Lấy User từ DB
        var user = repository.findByUsername(request.getUsername())
                .orElseThrow();

        // 🟢 CẬP NHẬT TRẠNG THÁI ACTIVE KHI ĐĂNG NHẬP THÀNH CÔNG
        user.setStatus("ACTIVE");
        repository.save(user);

        // 3. Tạo Token
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("hoTen", user.getHoTen());
        extraClaims.put("role", user.getRole());
        var jwtToken = jwtService.generateToken(extraClaims, user);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .avatar(user.getAvatar())
                .build();
    }

    // 🟢 THÊM HÀM ĐĂNG XUẤT ĐỂ ĐỔI TRẠNG THÁI THÀNH OFFLINE
    public void logout(String username) {
        repository.findByUsername(username).ifPresent(user -> {
            user.setStatus("OFFLINE");
            repository.save(user);
        });
    }
}