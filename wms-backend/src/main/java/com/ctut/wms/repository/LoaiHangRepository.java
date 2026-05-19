package com.ctut.wms.repository;

import com.ctut.wms.entity.LoaiHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoaiHangRepository extends JpaRepository<LoaiHang, Integer> {
}
