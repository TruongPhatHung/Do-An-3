package com.ctut.wms.mapper;

import com.ctut.wms.dto.NhaCungCapRequest;
import com.ctut.wms.dto.NhaCungCapResponse;
import com.ctut.wms.entity.NhaCungCap;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.web.multipart.MultipartFile; // 🟢 1. THÊM DÒNG IMPORT NÀY

@Mapper(componentModel = "spring")
public interface NhaCungCapMapper {

    NhaCungCapResponse toResponse(NhaCungCap ncc);

    // 🟢 Bỏ qua id và sanPhams để Service tự xử lý thủ công, tránh lỗi MapStruct
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sanPhams", ignore = true)
    NhaCungCap toEntity(NhaCungCapRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sanPhams", ignore = true)
    void updateEntityFromRequest(NhaCungCapRequest request, @MappingTarget NhaCungCap nhaCungCap);
}