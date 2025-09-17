package com.dbmodeling.presentation.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

/**
 * 스키마 내보내기 응답 DTO
 */
@Schema(description = "스키마 내보내기 결과")
public class ExportResponse {
    
    @Schema(description = "출력 형식", example = "SQL")
    private String format;
    
    @Schema(description = "생성된 스키마 내용")
    private String content;
    
    @Schema(description = "파일명", example = "database_schema.sql")
    private String fileName;
    
    @Schema(description = "콘텐츠 타입", example = "application/sql")
    private String contentType;
    
    @Schema(description = "파일 크기 (바이트)", example = "2048")
    private long fileSize;
    
    @Schema(description = "생성 일시", example = "2024-01-01T10:00:00")
    private LocalDateTime generatedAt;
    
    @Schema(description = "포함된 테이블 수", example = "5")
    private int tableCount;
    
    @Schema(description = "포함된 인덱스 수", example = "12")
    private int indexCount;
    
    public ExportResponse() {
        this.generatedAt = LocalDateTime.now();
    }
    
    public ExportResponse(String format, String content, String fileName, String contentType) {
        this();
        this.format = format;
        this.content = content;
        this.fileName = fileName;
        this.contentType = contentType;
        this.fileSize = content != null ? content.getBytes().length : 0;
    }
    
    // Getters and Setters
    public String getFormat() {
        return format;
    }
    
    public void setFormat(String format) {
        this.format = format;
    }
    
    public String getContent() {
        return content;
    }
    
    public void setContent(String content) {
        this.content = content;
        this.fileSize = content != null ? content.getBytes().length : 0;
    }
    
    public String getFileName() {
        return fileName;
    }
    
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
    
    public String getContentType() {
        return contentType;
    }
    
    public void setContentType(String contentType) {
        this.contentType = contentType;
    }
    
    public long getFileSize() {
        return fileSize;
    }
    
    public void setFileSize(long fileSize) {
        this.fileSize = fileSize;
    }
    
    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }
    
    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }
    
    public int getTableCount() {
        return tableCount;
    }
    
    public void setTableCount(int tableCount) {
        this.tableCount = tableCount;
    }
    
    public int getIndexCount() {
        return indexCount;
    }
    
    public void setIndexCount(int indexCount) {
        this.indexCount = indexCount;
    }
}