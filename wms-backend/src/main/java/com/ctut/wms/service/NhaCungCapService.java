package com.ctut.wms.service;

import com.ctut.wms.dto.NhaCungCapRequest;
import com.ctut.wms.dto.NhaCungCapResponse;
import com.ctut.wms.entity.NhaCungCap;
import com.ctut.wms.mapper.NhaCungCapMapper;
import com.ctut.wms.repository.NhaCungCapRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NhaCungCapService {

    // Tiêm (Inject) Repository để giao tiếp DB và Mapper để chuyển đổi dữ liệu
    private final NhaCungCapRepository repository;
    private final NhaCungCapMapper mapper;

    /**
     * LẤY DANH SÁCH NHÀ CUNG CẤP
     * @return Danh sách các nhà cung cấp (đã ẩn đi thông tin thừa qua DTO)
     */
    public List<NhaCungCapResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse) // MapStruct tự động chuyển Entity -> Response
                .collect(Collectors.toList());
    }

    /**
     * LẤY THÔNG TIN CHI TIẾT 1 NHÀ CUNG CẤP
     */
    public NhaCungCapResponse getById(Integer id) {
        // Tìm trong cơ sở dữ liệu, nếu không thấy sẽ bắn ra ngoại lệ
        return mapper.toResponse(repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhà Cung Cấp với ID: " + id)));
    }

    /**
     * THÊM MỚI NHÀ CUNG CẤP
     * @Transactional giúp an toàn dữ liệu: Bất kỳ lỗi nào xảy ra khi đang lưu, DB sẽ hoàn tác lại trạng thái ban đầu.
     */
    @Transactional
    public NhaCungCapResponse create(NhaCungCapRequest request) {
        // 1. Dùng mapper chuyển DTO (từ client) sang Entity
        NhaCungCap newNcc = mapper.toEntity(request);

        // 2. Lưu vào CSDL
        NhaCungCap savedNcc = repository.save(newNcc);

        // 3. Chuyển kết quả vừa lưu thành Response và trả về
        return mapper.toResponse(savedNcc);
    }

    /**
     * CẬP NHẬT THÔNG TIN NHÀ CUNG CẤP
     */
    @Transactional
    public NhaCungCapResponse update(Integer id, NhaCungCapRequest request) {
        // 1. Tìm xem nhà cung cấp có tồn tại không
        NhaCungCap existingNcc = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhà Cung Cấp với ID: " + id));

        // 2. MapStruct sẽ tự động lấy thông tin từ request và đè lên existingNcc
        mapper.updateEntityFromRequest(request, existingNcc);

        // 3. Lưu bản cập nhật và trả về kết quả
        return mapper.toResponse(repository.save(existingNcc));
    }

    /**
     * XÓA NHÀ CUNG CẤP
     */
    @Transactional
    public void delete(Integer id) {
        // Xóa cứng khỏi CSDL dựa vào ID
        repository.deleteById(id);
    }
}