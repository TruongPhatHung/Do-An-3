package com.ctut.wms.service;

import com.ctut.wms.dto.LoaiHangRequest;
import com.ctut.wms.dto.LoaiHangResponse;
import com.ctut.wms.entity.LoaiHang;
import com.ctut.wms.mapper.LoaiHangMapper;
import com.ctut.wms.repository.LoaiHangRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoaiHangService {

    private final LoaiHangRepository loaiHangRepository;
    private final LoaiHangMapper loaiHangMapper;

    /**
     * LẤY DANH SÁCH TẤT CẢ LOẠI HÀNG
     * @return Danh sách các DTO đã được chuyển đổi từ Entity
     */
    public List<LoaiHangResponse> getAll() {
        return loaiHangRepository.findAll().stream()
                .map(loaiHangMapper::toResponse) // MapStruct tự động chuyển từng Entity -> Response
                .collect(Collectors.toList());
    }

    /**
     * LẤY CHI TIẾT 1 LOẠI HÀNG THEO ID
     */
    public LoaiHangResponse getById(Integer id) {
        // Tìm trong DB, nếu không có thì ném ra lỗi (sẽ được xử lý ở Giai đoạn 2)
        LoaiHang loaiHang = loaiHangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Loại hàng ID: " + id));
        return loaiHangMapper.toResponse(loaiHang);
    }

    /**
     * THÊM MỚI LOẠI HÀNG
     * @Transactional: Đảm bảo an toàn dữ liệu, nếu quá trình lưu DB bị lỗi, hệ thống sẽ tự động hoàn tác (rollback).
     */
    @Transactional
    public LoaiHangResponse create(LoaiHangRequest request) {
        // 1. Chuyển đổi dữ liệu Request (DTO) thành Entity để lưu vào DB
        LoaiHang loaiHang = loaiHangMapper.toEntity(request);

        // 2. Lưu vào DB và nhận lại đối tượng vừa được lưu (có chứa ID tự tăng)
        LoaiHang savedLoaiHang = loaiHangRepository.save(loaiHang);

        // 3. Chuyển đổi lại thành Response để trả về cho Client
        return loaiHangMapper.toResponse(savedLoaiHang);
    }

    /**
     * CẬP NHẬT LOẠI HÀNG
     */
    @Transactional
    public LoaiHangResponse update(Integer id, LoaiHangRequest request) {
        // 1. Kiểm tra xem Loại hàng này có tồn tại trong kho không
        LoaiHang loaiHang = loaiHangRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Loại hàng ID: " + id));

        // 2. Ghi đè các thông tin mới từ request vào đối tượng cũ
        loaiHangMapper.updateEntityFromRequest(request, loaiHang);

        // 3. Lưu bản cập nhật xuống DB và trả về kết quả
        return loaiHangMapper.toResponse(loaiHangRepository.save(loaiHang));
    }

    /**
     * XÓA LOẠI HÀNG
     */
    @Transactional
    public void delete(Integer id) {
        // Có thể thêm logic kiểm tra: Nếu Loại hàng này đang có Sản phẩm thì không cho xóa
        loaiHangRepository.deleteById(id);
    }
}