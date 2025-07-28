package com.dbmodeling.application.service;

import com.dbmodeling.application.port.in.ManageIndexUseCase;
import com.dbmodeling.domain.model.Index;
import com.dbmodeling.domain.repository.ColumnRepository;
import com.dbmodeling.domain.repository.IndexRepository;
import com.dbmodeling.domain.repository.TableRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * 인덱스 애플리케이션 서비스
 * 인덱스 관련 유스케이스들을 구현
 */
@Service
@Transactional
public class IndexService implements ManageIndexUseCase {
    
    private final IndexRepository indexRepository;
    private final TableRepository tableRepository;
    private final ColumnRepository columnRepository;
    
    public IndexService(IndexRepository indexRepository,
                       TableRepository tableRepository,
                       ColumnRepository columnRepository) {
        this.indexRepository = indexRepository;
        this.tableRepository = tableRepository;
        this.columnRepository = columnRepository;
    }
    
    @Override
    public Index createIndex(CreateIndexCommand command) {
        // 테이블 존재 확인
        if (!tableRepository.existsById(command.tableId())) {
            throw new IllegalArgumentException("테이블을 찾을 수 없습니다: " + command.tableId());
        }
        
        // 테이블 내 인덱스 이름 중복 검사
        if (indexRepository.existsByTableIdAndName(command.tableId(), command.name())) {
            throw new IllegalArgumentException("이미 존재하는 인덱스 이름입니다: " + command.name());
        }
        
        // 클러스터드 인덱스 중복 검사
        if (command.type() == Index.IndexType.CLUSTERED && 
            indexRepository.existsByTableIdAndType(command.tableId(), Index.IndexType.CLUSTERED)) {
            throw new IllegalArgumentException("테이블에는 하나의 클러스터드 인덱스만 생성할 수 있습니다");
        }
        
        // 컬럼 존재 확인
        for (IndexColumnSpec columnSpec : command.columns()) {
            if (!columnRepository.existsById(columnSpec.columnId())) {
                throw new IllegalArgumentException("컬럼을 찾을 수 없습니다: " + columnSpec.columnId());
            }
        }
        
        // 새 인덱스 생성
        Index index = new Index(command.name(), command.type(), command.isUnique());
        index.setTableId(command.tableId());
        
        // 인덱스 컬럼 추가
        for (IndexColumnSpec columnSpec : command.columns()) {
            index.addColumn(columnSpec.columnId(), columnSpec.order());
        }
        
        // 저장 및 반환
        return indexRepository.save(index);
    }
    
    @Override
    public Index updateIndex(UpdateIndexCommand command) {
        // 기존 인덱스 조회
        Index index = indexRepository.findById(command.id())
            .orElseThrow(() -> new IllegalArgumentException("인덱스를 찾을 수 없습니다: " + command.id()));
        
        // 이름 변경 시 중복 검사 (자기 자신 제외)
        if (!index.getName().equals(command.name()) && 
            indexRepository.existsByTableIdAndName(index.getTableId(), command.name())) {
            throw new IllegalArgumentException("이미 존재하는 인덱스 이름입니다: " + command.name());
        }
        
        // 클러스터드 인덱스 타입 변경 시 중복 검사
        if (command.type() == Index.IndexType.CLUSTERED && 
            index.getType() != Index.IndexType.CLUSTERED &&
            indexRepository.existsByTableIdAndType(index.getTableId(), Index.IndexType.CLUSTERED)) {
            throw new IllegalArgumentException("테이블에는 하나의 클러스터드 인덱스만 생성할 수 있습니다");
        }
        
        // 컬럼 존재 확인
        for (IndexColumnSpec columnSpec : command.columns()) {
            if (!columnRepository.existsById(columnSpec.columnId())) {
                throw new IllegalArgumentException("컬럼을 찾을 수 없습니다: " + columnSpec.columnId());
            }
        }
        
        // 인덱스 정보 업데이트
        index.updateIndex(command.name(), command.type(), command.isUnique());
        
        // 인덱스 컬럼 재구성
        List<Index.IndexColumn> newColumns = command.columns().stream()
            .map(spec -> new Index.IndexColumn(spec.columnId(), spec.order()))
            .toList();
        index.reorderColumns(newColumns);
        
        // 저장 및 반환
        return indexRepository.save(index);
    }
    
    @Override
    public void deleteIndex(UUID id) {
        // 인덱스 존재 확인
        if (!indexRepository.existsById(id)) {
            throw new IllegalArgumentException("인덱스를 찾을 수 없습니다: " + id);
        }
        
        // 인덱스 삭제
        indexRepository.deleteById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Index> getIndexesByTableId(UUID tableId) {
        return indexRepository.findByTableId(tableId);
    }
    
    /**
     * 인덱스 ID로 인덱스 조회
     */
    @Transactional(readOnly = true)
    public Index getIndexById(UUID indexId) {
        return indexRepository.findById(indexId)
            .orElseThrow(() -> new IllegalArgumentException("인덱스를 찾을 수 없습니다: " + indexId));
    }
}