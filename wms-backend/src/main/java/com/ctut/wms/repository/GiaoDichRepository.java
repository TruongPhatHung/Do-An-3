package com.ctut.wms.repository;

import com.ctut.wms.entity.GiaoDich;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GiaoDichRepository extends JpaRepository<GiaoDich, Integer> {
}
