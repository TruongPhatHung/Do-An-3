package com.ctut.wms.repository;

import com.ctut.wms.entity.ChiTietPhieuNhap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChiTietPhieuNhapRepository extends JpaRepository<ChiTietPhieuNhap, Integer> {
    // Hiện tại chưa cần viết thêm câu query phức tạp nào, JpaRepository đã lo hết lệnh Thêm/Sửa/Xóa cơ bản
}