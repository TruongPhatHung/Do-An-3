//// src/main/java/com/ctut/wms/config/CorsConfig.java
//package com.ctut.wms.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
//import org.springframework.web.filter.CorsFilter;
//
//import java.util.Arrays;
//import java.util.List;
//
//@Configuration
//public class CorsConfig {
//
//    @Bean
//    public CorsFilter corsFilter() {
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        CorsConfiguration config = new CorsConfiguration();
//
//        // Cho phép gửi cookie, token
//        config.setAllowCredentials(true);
//
//        // Cấu hình port của React (Thường là 3000, 5173 hoặc 5174).
//        // Bạn hãy đổi lại cho đúng với port React của bạn nhé!
//        config.setAllowedOrigins(List.of("http://localhost:5175","http://localhost:5173", "http://localhost:3000"));
//
//        // Cho phép tất cả các header và method (GET, POST, PUT, DELETE, OPTIONS)
//        config.setAllowedHeaders(Arrays.asList("Origin", "Content-Type", "Accept", "Authorization"));
//        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "OPTIONS", "DELETE", "PATCH"));
//
//        source.registerCorsConfiguration("/**", config);
//        return new CorsFilter(source);
//    }
//}