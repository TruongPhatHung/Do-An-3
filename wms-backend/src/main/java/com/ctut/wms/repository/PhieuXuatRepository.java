package com.ctut.wms.repository;

import com.ctut.wms.entity.PhieuXuat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PhieuXuatRepository extends JpaRepository<PhieuXuat, Integer> {
}
