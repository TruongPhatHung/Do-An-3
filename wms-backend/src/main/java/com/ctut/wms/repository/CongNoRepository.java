package com.ctut.wms.repository;

import com.ctut.wms.entity.CongNo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CongNoRepository extends JpaRepository<CongNo, Integer> {
}