package com.dbmodeling.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

/**
 * 웹 설정
 * CORS 및 웹 관련 설정을 관리
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;
    
    @Value("${app.cors.allowed-methods}")
    private String allowedMethods;
    
    @Value("${app.cors.allowed-headers}")
    private String allowedHeaders;
    
    @Value("${app.cors.allow-credentials}")
    private boolean allowCredentials;
    
    @Value("${app.cors.max-age:3600}")
    private long maxAge;
    
    /**
     * CORS 필터 설정
     */
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        
        // 허용할 오리진 설정
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        origins.forEach(origin -> config.addAllowedOrigin(origin.trim()));
        
        // 허용할 HTTP 메서드 설정
        List<String> methods = Arrays.asList(allowedMethods.split(","));
        methods.forEach(method -> config.addAllowedMethod(method.trim()));
        
        // 허용할 헤더 설정
        if ("*".equals(allowedHeaders)) {
            config.addAllowedHeader("*");
        } else {
            List<String> headers = Arrays.asList(allowedHeaders.split(","));
            headers.forEach(header -> config.addAllowedHeader(header.trim()));
        }
        
        // 자격 증명 허용 설정
        config.setAllowCredentials(allowCredentials);
        
        // 캐시 시간 설정
        config.setMaxAge(maxAge);
        
        // 모든 경로에 적용
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}