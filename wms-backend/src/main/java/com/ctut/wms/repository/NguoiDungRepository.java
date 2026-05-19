package com.ctut.wms.repository;

import com.ctut.wms.entity.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface NguoiDungRepository extends JpaRepository<NguoiDung, Integer> {
    Optional<NguoiDung> findByUsername(String username);
    // Hàm này tự động sinh ra câu lệnh: SELECT * FROM nguoi_dung WHERE username = ?
}
