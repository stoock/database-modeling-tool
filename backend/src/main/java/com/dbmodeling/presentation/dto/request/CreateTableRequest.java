package com.dbmodeling.presentation.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 테이블 생성 요청 DTO
 */
@Schema(description = "테이블 생성 요청")
public class CreateTableRequest {
    
    @Schema(description = "테이블 이름", example = "User", required = true)
    @NotBlank(message = "테이블 이름은 필수입니다.")
    @Size(min = 1, max = 255, message = "테이블 이름은 1자 이상 255자 이하여야 합니다.")
    private String name;
    
    @Schema(description = "테이블 설명", example = "사용자 정보를 저장하는 테이블")
    @Size(max = 1000, message = "테이블 설명은 1000자 이하여야 합니다.")
    private String description;
    
    @Schema(description = "캔버스 X 좌표", example = "100")
    private Integer positionX = 0;
    
    @Schema(description = "캔버스 Y 좌표", example = "200")
    private Integer positionY = 0;
    
    public CreateTableRequest() {}
    
    public CreateTableRequest(String name, String description, Integer positionX, Integer positionY) {
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