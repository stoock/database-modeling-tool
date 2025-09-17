package com.dbmodeling.presentation.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

/**
 * 테이블 수정 요청 DTO
 */
@Schema(description = "테이블 수정 요청")
public class UpdateTableRequest {
    
    @Schema(description = "테이블 이름", example = "UpdatedUser")
    @Size(min = 1, max = 255, message = "테이블 이름은 1자 이상 255자 이하여야 합니다.")
    private String name;
    
    @Schema(description = "테이블 설명", example = "업데이트된 사용자 정보 테이블")
    @Size(max = 1000, message = "테이블 설명은 1000자 이하여야 합니다.")
    private String description;
    
    @Schema(description = "캔버스 X 좌표", example = "150")
    private Integer positionX;
    
    @Schema(description = "캔버스 Y 좌표", example = "250")
    private Integer positionY;
    
    public UpdateTableRequest() {}
    
    public UpdateTableRequest(String name, String description, Integer positionX, Integer positionY) {
        this.name = name;
        this.description = description;
        this.positionX = positionX;
        this.positionY = positionY;
    }
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Integer getPositionX() {
        return positionX;
    }
    
    public void setPositionX(Integer positionX) {
        this.positionX = positionX;
    }
    
    public Integer getPositionY() {
        return positionY;
    }
    
    public void setPositionY(Integer positionY) {
        this.positionY = positionY;
    }
}