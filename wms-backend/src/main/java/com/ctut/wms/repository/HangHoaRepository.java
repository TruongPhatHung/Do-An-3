package com.ctut.wms.repository;

import com.ctut.wms.entity.HangHoa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface HangHoaRepository extends JpaRepository<HangHoa, Integer> {
    Optional<HangHoa> findByMaHang(String maHang);
}
