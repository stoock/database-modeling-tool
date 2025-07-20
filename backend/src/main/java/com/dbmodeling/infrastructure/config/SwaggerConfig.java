package com.dbmodeling.infrastructure.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger/OpenAPI 설정
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Database Modeling Tool API")
                        .description("MSSQL 데이터베이스 모델링 도구 REST API")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Database Modeling Tool")
                                .email("support@dbmodeling.com")));
    }
}