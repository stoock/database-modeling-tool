package com.dbmodeling.presentation.controller;

import com.dbmodeling.presentation.dto.response.ApiResponse;
import com.dbmodeling.presentation.dto.response.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * 기본 컨트롤러 클래스
 * 모든 컨트롤러에서 공통으로 사용하는 응답 생성 메서드를 제공합니다.
 */
public abstract class BaseController {

    /**
     * 성공 응답 생성 (데이터 포함)
     */
    protected <T> ResponseEntity<ApiResponse<T>> success(T data) {
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * 성공 응답 생성 (데이터와 메시지 포함)
     */
    protected <T> ResponseEntity<ApiResponse<T>> success(T data, String message) {
        return ResponseEntity.ok(ApiResponse.success(data, message));
    }

    /**
     * 생성 성공 응답 (201 Created)
     */
    protected <T> ResponseEntity<ApiResponse<T>> created(T data) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(data, "리소스가 성공적으로 생성되었습니다."));
    }

    /**
     * 생성 성공 응답 (201 Created, 메시지 포함)
     */
    protected <T> ResponseEntity<ApiResponse<T>> created(T data, String message) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(data, message));
    }

    /**
     * 삭제 성공 응답 (204 No Content)
     */
    protected ResponseEntity<Void> deleted() {
        return ResponseEntity.noContent().build();
    }

    /**
     * 페이지네이션 응답 생성
     */
    protected <T> ResponseEntity<ApiResponse<PageResponse<T>>> page(Page<T> page) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(page)));
    }

    /**
     * 페이지네이션 응답 생성 (메시지 포함)
     */
    protected <T> ResponseEntity<ApiResponse<PageResponse<T>>> page(Page<T> page, String message) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(page), message));
    }
}