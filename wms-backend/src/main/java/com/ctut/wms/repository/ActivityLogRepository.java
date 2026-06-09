package com.ctut.wms.repository;

import com.ctut.wms.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Integer> {
    // Hàm này giúp sửa lỗi đỏ chỗ findByUserIdOrderByThoiGianDesc
    List<ActivityLog> findByUserIdOrderByThoiGianDesc(Integer userId);
}