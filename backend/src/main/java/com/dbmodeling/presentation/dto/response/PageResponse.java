package com.dbmodeling.presentation.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * 페이지네이션 응답 DTO
 */
@Schema(description = "페이지네이션 응답")
public class PageResponse<T> {
    
    @Schema(description = "데이터 목록")
    private List<T> content;
    
    @Schema(description = "현재 페이지 번호 (0부터 시작)", example = "0")
    private int page;
    
    @Schema(description = "페이지 크기", example = "20")
    private int size;
    
    @Schema(description = "전체 요소 수", example = "100")
    private long totalElements;
    
    @Schema(description = "전체 페이지 수", example = "5")
    private int totalPages;
    
    @Schema(description = "첫 번째 페이지 여부", example = "true")
    private boolean first;
    
    @Schema(description = "마지막 페이지 여부", example = "false")
    private boolean last;
    
    public PageResponse() {}
    
    public PageResponse(Page<T> page) {
        this.content = page.getContent();
        this.page = page.getNumber();
        this.size = page.getSize();
        this.totalElements = page.getTotalElements();
        this.totalPages = page.getTotalPages();
        this.first = page.isFirst();
        this.last = page.isLast();
    }
    
    /**
     * Spring Data Page 객체로부터 PageResponse 생성
     */
    public static <T> PageResponse<T> of(Page<T> page) {
        return new PageResponse<>(page);
    }
    
    // Getters and Setters
    public List<T> getContent() {
        return content;
    }
    
    public void setContent(List<T> content) {
        this.content = content;
    }
    
    public int getPage() {
        return page;
    }
    
    public void setPage(int page) {
        this.page = page;
    }
    
    public int getSize() {
        return size;
    }
    
    public void setSize(int size) {
        this.size = size;
    }
    
    public long getTotalElements() {
        return totalElements;
    }
    
    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }
    
    public int getTotalPages() {
        return totalPages;
    }
    
    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }
    
    public boolean isFirst() {
        return first;
    }
    
    public void setFirst(boolean first) {
        this.first = first;
    }
    
    public boolean isLast() {
        return last;
    }
    
    public void setLast(boolean last) {
        this.last = last;
    }
}