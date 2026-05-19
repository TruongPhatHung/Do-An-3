package com.ctut.wms.repository;

import com.ctut.wms.entity.TheKho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TheKhoRepository extends JpaRepository<TheKho, Integer> {
}
