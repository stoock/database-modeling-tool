package com.dbmodeling.presentation.controller;

/**
 * API 관련 상수 정의
 */
public final class ApiConstants {
    
    private ApiConstants() {
        // 유틸리티 클래스
    }
    
    // API 기본 경로
    public static final String API_BASE_PATH = "/api";
    public static final String API_V1_PATH = API_BASE_PATH + "/v1";
    
    // 리소스 경로
    public static final String PROJECTS_PATH = "/projects";
    public static final String TABLES_PATH = "/tables";
    public static final String COLUMNS_PATH = "/columns";
    public static final String INDEXES_PATH = "/indexes";
    public static final String VALIDATION_PATH = "/validation";
    public static final String EXPORT_PATH = "/export";
    
    // 페이지네이션 기본값
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;
    public static final String DEFAULT_SORT_PROPERTY = "createdAt";
    public static final String DEFAULT_SORT_DIRECTION = "desc";
    
    // HTTP 헤더
    public static final String CONTENT_TYPE_JSON = "application/json";
    public static final String CONTENT_TYPE_SQL = "application/sql";
    public static final String CONTENT_TYPE_CSV = "text/csv";
    
    // 응답 메시지
    public static final String SUCCESS_CREATE = "리소스가 성공적으로 생성되었습니다.";
    public static final String SUCCESS_UPDATE = "리소스가 성공적으로 수정되었습니다.";
    public static final String SUCCESS_DELETE = "리소스가 성공적으로 삭제되었습니다.";
    public static final String SUCCESS_RETRIEVE = "리소스를 성공적으로 조회했습니다.";
}