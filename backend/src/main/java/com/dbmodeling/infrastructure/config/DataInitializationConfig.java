package com.dbmodeling.infrastructure.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.DataSourceInitializer;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

import javax.sql.DataSource;

/**
 * 데이터베이스 초기화 설정
 * 환경별 초기 데이터 로드 설정
 */
@Configuration
public class DataInitializationConfig {

    /**
     * 개발 환경 데이터 초기화
     * 개발 환경에서 샘플 데이터 로드
     */
    @Bean
    @Profile("dev")
    public DataSourceInitializer devDataSourceInitializer(
            DataSource dataSource,
            @Value("${app.db.init.enabled:false}") boolean initEnabled) {
        
        DataSourceInitializer initializer = new DataSourceInitializer();
        initializer.setDataSource(dataSource);
        
        if (initEnabled) {
            ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
            populator.addScript(new ClassPathResource("db/init/data-dev.sql"));
            populator.setSeparator(";");
            populator.setIgnoreFailedDrops(true);
            initializer.setDatabasePopulator(populator);
        }
        
        return initializer;
    }

    /**
     * 테스트 환경 데이터 초기화
     * 테스트 실행 시 테스트 데이터 로드
     */
    @Bean
    @Profile("test")
    public DataSourceInitializer testDataSourceInitializer(DataSource dataSource) {
        DataSourceInitializer initializer = new DataSourceInitializer();
        initializer.setDataSource(dataSource);
        
        ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
        populator.addScript(new ClassPathResource("db/init/schema-test.sql"));
        populator.addScript(new ClassPathResource("db/init/data-test.sql"));
        populator.setSeparator(";");
        populator.setIgnoreFailedDrops(true);
        initializer.setDatabasePopulator(populator);
        
        return initializer;
    }
}