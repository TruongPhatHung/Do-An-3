package com.ctut.wms.repository;

import com.ctut.wms.entity.ChiTietPhieuXuat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChiTietPhieuXuatRepository extends JpaRepository<ChiTietPhieuXuat, Integer> {
}