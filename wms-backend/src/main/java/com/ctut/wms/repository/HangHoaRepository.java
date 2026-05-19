package com.ctut.wms.repository;

import com.ctut.wms.entity.HangHoa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface HangHoaRepository extends JpaRepository<HangHoa, Integer> {
    Optional<HangHoa> findByMaHang(String maHang);
    // BỔ SUNG 1: Tìm Top 5 sản phẩm có tồn kho nhỏ hơn mức cảnh báo, sắp xếp từ thấp đến cao
    List<HangHoa> findTop5BySoLuongTonLessThanOrderBySoLuongTonAsc(Integer nguongCanhBao);

    // BỔ SUNG 2: Tìm kiếm hàng hóa theo tên (chứa từ khóa, không phân biệt hoa/thường)
    List<HangHoa> findByTenHangContainingIgnoreCase(String tenHang);
}
