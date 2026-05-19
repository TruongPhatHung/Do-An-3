package com.ctut.wms.mapper;

import com.ctut.wms.dto.NhaCungCapRequest;
import com.ctut.wms.dto.NhaCungCapResponse;
import com.ctut.wms.entity.NhaCungCap;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface NhaCungCapMapper {
    NhaCungCapResponse toResponse(NhaCungCap ncc);

    @Mapping(target = "id", ignore = true)
    NhaCungCap toEntity(NhaCungCapRequest request);

    @Mapping(target = "id", ignore = true)
    void updateEntityFromRequest(NhaCungCapRequest request, @MappingTarget NhaCungCap ncc);
}