package com.ctut.wms.service;

import com.ctut.wms.dto.NhaCungCapRequest;
import com.ctut.wms.dto.NhaCungCapResponse;
import com.ctut.wms.dto.HangHoaTrongNCC; // DTO chứa MultipartFile từ React
import com.ctut.wms.entity.HangHoaTrongNcc; // Entity lưu DB
import com.ctut.wms.entity.NhaCungCap;
import com.ctut.wms.mapper.NhaCungCapMapper;
import com.ctut.wms.repository.NhaCungCapRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NhaCungCapService {

    private final NhaCungCapRepository repository;
    private final NhaCungCapMapper mapper;

    @Transactional(readOnly = true)
    public List<NhaCungCapResponse> getAll() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NhaCungCapResponse getById(Integer id) {
        return mapper.toResponse(repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhà Cung Cấp với ID: " + id)));
    }

    /**
     * THÊM MỚI NHÀ CUNG CẤP (Đã sửa lỗi MapStruct không map được ảnh)
     */
    @Transactional
    public NhaCungCapResponse create(NhaCungCapRequest request) {
        // 1. Map các thông tin cơ bản (Mã NCC, Tên, Lĩnh vực, Email...)
        NhaCungCap newNcc = mapper.toEntity(request);

        // 2. TỰ TAY XỬ LÝ DANH SÁCH SẢN PHẨM & ẢNH (Bỏ qua MapStruct ở đoạn này)
        if (request.getSanPhams() != null && !request.getSanPhams().isEmpty()) {
            List<HangHoaTrongNcc> danhSachSp = new ArrayList<>();

            for (HangHoaTrongNCC dtoSp : request.getSanPhams()) {
                HangHoaTrongNcc entitySp = new HangHoaTrongNcc();
                entitySp.setMaHang(dtoSp.getMaHang());
                entitySp.setTenHang(dtoSp.getTenHang());
                entitySp.setDonGia(dtoSp.getDonGia());

                // Xử lý lấy tên file ảnh
                if (dtoSp.getHinhAnh() != null && !dtoSp.getHinhAnh().isEmpty()) {
                    String fileName = dtoSp.getHinhAnh().getOriginalFilename();
                    entitySp.setHinhAnh(fileName);
                    // (Tương lai bạn có thể thêm code copy file vào thư mục tĩnh của server ở đây)
                }

                // Gắn quan hệ với Nhà cung cấp
                entitySp.setNhaCungCap(newNcc);
                danhSachSp.add(entitySp);
            }
            // Gán lại danh sách đã chuẩn bị hoàn chỉnh vào NCC
            newNcc.setSanPhams(danhSachSp);
        }

        // 3. Lưu vào CSDL
        NhaCungCap savedNcc = repository.save(newNcc);
        return mapper.toResponse(savedNcc);
    }

    /**
     * CẬP NHẬT THÔNG TIN NHÀ CUNG CẤP
     */
    @Transactional
    public NhaCungCapResponse update(Integer id, NhaCungCapRequest request) {
        NhaCungCap existingNcc = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhà Cung Cấp với ID: " + id));

        // Xóa danh sách cũ
        if (existingNcc.getSanPhams() != null) {
            existingNcc.getSanPhams().clear();
        }

        mapper.updateEntityFromRequest(request, existingNcc);

        // Tạo lại danh sách mới y như hàm Create
        if (request.getSanPhams() != null && !request.getSanPhams().isEmpty()) {
            List<HangHoaTrongNcc> danhSachSpMoi = new ArrayList<>();
            for (HangHoaTrongNCC dtoSp : request.getSanPhams()) {
                HangHoaTrongNcc entitySp = new HangHoaTrongNcc();
                entitySp.setMaHang(dtoSp.getMaHang());
                entitySp.setTenHang(dtoSp.getTenHang());
                entitySp.setDonGia(dtoSp.getDonGia());

                if (dtoSp.getHinhAnh() != null && !dtoSp.getHinhAnh().isEmpty()) {
                    entitySp.setHinhAnh(dtoSp.getHinhAnh().getOriginalFilename());
                }

                entitySp.setNhaCungCap(existingNcc);
                danhSachSpMoi.add(entitySp);
            }
            existingNcc.getSanPhams().addAll(danhSachSpMoi);
        }

        return mapper.toResponse(repository.save(existingNcc));
    }

    @Transactional
    public void delete(Integer id) {
        repository.deleteById(id);
    }
}