package com.ctut.wms.exception;

import lombok.AllArgsConstructor;
import lombok.Data;


import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ErrorResponse {
    private LocalDateTime timestamp; // Thời gian xảy ra lỗi
    private int status;              // Mã lỗi (VD: 400, 404, 500)
    private String error;            // Tên lỗi
    private String message;          // Chi tiết lỗi bằng tiếng Việt
}