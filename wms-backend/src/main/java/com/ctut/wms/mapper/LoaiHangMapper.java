package com.ctut.wms.mapper;

import com.ctut.wms.dto.LoaiHangRequest;
import com.ctut.wms.dto.LoaiHangResponse;
import com.ctut.wms.entity.LoaiHang; // Chú ý: Từ đây sẽ dùng entity viết thường
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface LoaiHangMapper {

    LoaiHangResponse toResponse(LoaiHang loaiHang);

    @Mapping(target = "id", ignore = true)
    LoaiHang toEntity(LoaiHangRequest request);

    @Mapping(target = "id", ignore = true)
    void updateEntityFromRequest(LoaiHangRequest request, @MappingTarget LoaiHang loaiHang);
}