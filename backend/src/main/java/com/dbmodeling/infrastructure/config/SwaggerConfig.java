package com.dbmodeling.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Swagger/OpenAPI 설정
 * API 문서화를 위한 OpenAPI 3.0 설정을 제공합니다.
 */
@Configuration
public class SwaggerConfig {

    @Value("${server.port:8080}")
    private String serverPort;

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(apiInfo())
                .servers(List.of(
                    new Server()
                        .url("http://localhost:" + serverPort)
                        .description("로컬 개발 서버"),
                    new Server()
                        .url("https://api.dbmodeling.com")
                        .description("운영 서버")
                ))
                .tags(List.of(
                    new Tag()
                        .name("프로젝트 관리")
                        .description("데이터베이스 모델링 프로젝트 관리 API"),
                    new Tag()
                        .name("테이블 관리")
                        .description("데이터베이스 테이블 관리 API"),
                    new Tag()
                        .name("컬럼 관리")
                        .description("테이블 컬럼 관리 API"),
                    new Tag()
                        .name("인덱스 관리")
                        .description("데이터베이스 인덱스 관리 API"),
                    new Tag()
                        .name("검증")
                        .description("네이밍 규칙 검증 API"),
                    new Tag()
                        .name("스키마 내보내기")
                        .description("MSSQL 스키마 생성 및 내보내기 API")
                ));
    }

    private Info apiInfo() {
        return new Info()
                .title("Database Modeling Tool API")
                .description("""
                    MSSQL 데이터베이스 모델링 도구 REST API
                    
                    이 API는 다음 기능을 제공합니다:
                    - 데이터베이스 프로젝트 관리
                    - 테이블 및 컬럼 설계
                    - 인덱스 관리
                    - 네이밍 규칙 검증
                    - MSSQL 스키마 스크립트 생성
                    """)
                .version("1.0.0")
                .contact(new Contact()
                        .name("Database Modeling Tool Team")
                        .email("support@dbmodeling.com")
                        .url("https://dbmodeling.com"))
                .license(new License()
                        .name("MIT License")
                        .url("https://opensource.org/licenses/MIT"));
    }
}