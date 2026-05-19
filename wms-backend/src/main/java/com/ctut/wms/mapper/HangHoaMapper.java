package com.ctut.wms.mapper;

import com.ctut.wms.dto.HangHoaResponse;
import com.ctut.wms.dto.HangHoaRequest;
import com.ctut.wms.entity.HangHoa;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface HangHoaMapper {

    // CHÚ Ý SỬA LẠI CHỮ HOA/THƯỜNG CHO KHỚP VỚI ENTITY
    @Mapping(source = "loaiHang.id", target = "loaiHangId")
    @Mapping(source = "loaiHang.tenLoai", target = "tenLoaiHang")
    HangHoaResponse toResponse(HangHoa hangHoa);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "loaiHang", ignore = true)
    HangHoa toEntity(HangHoaRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "loaiHang", ignore = true)
    void updateEntityFromRequest(HangHoaRequest request, @MappingTarget HangHoa hangHoa);
}