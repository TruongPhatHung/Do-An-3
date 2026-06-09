package com.ctut.wms.config; // Đảm bảo dòng này không bị báo lỗi đỏ

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration // 🟢 CỰC KỲ QUAN TRỌNG: Thiếu dòng này Spring sẽ bỏ qua file cấu hình
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}