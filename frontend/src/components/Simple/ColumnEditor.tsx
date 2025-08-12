import React, { useState, useEffect } from 'react';
import { useTableStore } from '../../stores/tableStore';
import Button from '../common/Button';
import type { Column, MSSQLDataType } from '../../types';

interface ColumnEditorProps {
  disabled?: boolean;
}

/**
 * ERD 스타일 컬럼 편집기
 * - 테이블 형태의 인라인 편집 UI
 * - 키보드 네비게이션 지원 (Tab, Enter, 화살표)
 * - 드래그 앤 드롭으로 순서 변경
 * - 실시간 데이터 검증
 */
const ColumnEditor: React.FC<ColumnEditorProps> = ({ disabled = false }) => {
  const { selectedTable, isLoading } = useTableStore();
  
  // 로컬 상태 (실제 구현에서는 store와 연동)
  const [columns, setColumns] = useState<Column[]>([]);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; field: string } | null>(null);

  // MSSQL 데이터 타입 목록
  const dataTypes: MSSQLDataType[] = [
    'BIGINT', 'INT', 'SMALLINT', 'TINYINT',
    'DECIMAL', 'NUMERIC', 'FLOAT', 'REAL',
    'VARCHAR', 'NVARCHAR', 'CHAR', 'NCHAR', 'TEXT', 'NTEXT',
    'DATE', 'TIME', 'DATETIME', 'DATETIME2', 'TIMESTAMP',
    'BIT', 'BINARY', 'VARBINARY', 'IMAGE',
    'UNIQUEIDENTIFIER', 'XML', 'JSON'
  ];

  // 길이가 필요한 데이터 타입
  const lengthRequiredTypes = ['VARCHAR', 'NVARCHAR', 'CHAR', 'NCHAR', 'BINARY', 'VARBINARY'];
  
  // IDENTITY 사용 가능한 데이터 타입 (정수형)
  const identityCompatibleTypes = ['BIGINT', 'INT', 'SMALLINT', 'TINYINT'];
  
  // 정밀도/스케일이 필요한 데이터 타입
  const precisionScaleTypes = ['DECIMAL', 'NUMERIC'];
  
  // 타입별 기본값 옵션
  const getDefaultValueOptions = (dataType: MSSQLDataType): string[] => {
    switch (dataType) {
      case 'BIT':
        return ['NULL', '0', '1'];
      case 'BIGINT':
      case 'INT':
      case 'SMALLINT':
      case 'TINYINT':
        return ['NULL', '0', '1', '-1'];
      case 'DECIMAL':
      case 'NUMERIC':
      case 'FLOAT':
      case 'REAL':
        return ['NULL', '0', '0.0', '1.0', '-1.0'];
      case 'VARCHAR':
      case 'NVARCHAR':
      case 'CHAR':
      case 'NCHAR':
      case 'TEXT':
      case 'NTEXT':
        return ['NULL', "''", "'N/A'", "'TBD'"];
      case 'DATE':
      case 'DATETIME':
      case 'DATETIME2':
        return ['NULL', 'GETDATE()', 'GETUTCDATE()'];
      case 'TIME':
        return ['NULL', 'GETDATE()'];
      case 'TIMESTAMP':
        return ['NULL'];
      case 'UNIQUEIDENTIFIER':
        return ['NULL', 'NEWID()'];
      default:
        return ['NULL'];
    }
  };

  // 데이터 타입별 속성 확인 함수들
  const requiresLength = (dataType: MSSQLDataType): boolean => {
    return lengthRequiredTypes.includes(dataType);
  };
  
  const supportsIdentity = (dataType: MSSQLDataType): boolean => {
    return identityCompatibleTypes.includes(dataType);
  };
  
  const requiresPrecisionScale = (dataType: MSSQLDataType): boolean => {
    return precisionScaleTypes.includes(dataType);
  };

  // 한글명 추출 (description에서 "한글명" 또는 "한글명 - 추가설명" 형식)
  const getKoreanName = (column: Column): string => {
    if (!column.description) return '';
    const dashIndex = column.description.indexOf(' - ');
    return dashIndex > 0 ? column.description.substring(0, dashIndex) : column.description;
  };

  // 추가 설명 추출
  const getAdditionalDescription = (column: Column): string => {
    if (!column.description) return '';
    const dashIndex = column.description.indexOf(' - ');
    return dashIndex > 0 ? column.description.substring(dashIndex + 3) : '';
  };


  // 선택된 테이블의 컬럼 로드
  useEffect(() => {
    if (selectedTable?.columns) {
      setColumns(selectedTable.columns);
    } else {
      setColumns([]);
    }
  }, [selectedTable]);

  // 새 컬럼 추가
  const handleAddColumn = () => {
    const newColumn: Column = {
      id: `temp_${Date.now()}`, // 임시 ID
      tableId: selectedTable?.id || '',
      name: '',
      dataType: 'VARCHAR',
      maxLength: 255,
      precision: undefined,
      scale: undefined,
      primaryKey: false,
      nullable: true,
      identity: false,
      identitySeed: 1,
      identityIncrement: 1,
      defaultValue: undefined,
      description: '',
      orderIndex: columns.length,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setColumns([...columns, newColumn]);
    
    // 새 행의 첫 번째 셀로 포커스 이동
    setTimeout(() => {
      setEditingCell({ rowIndex: columns.length, field: 'name' });
    }, 100);
  };

  // 컬럼 삭제
  const handleDeleteColumn = (index: number) => {
    if (window.confirm('이 컬럼을 삭제하시겠습니까?')) {
      const newColumns = columns.filter((_, i) => i !== index);
      setColumns(newColumns);
    }
  };

  // 셀 편집 시작
  const handleCellEdit = (rowIndex: number, field: string) => {
    setEditingCell({ rowIndex, field });
  };

  // 셀 편집 완료
  const handleCellSave = (rowIndex: number, field: string, value: any) => {
    const newColumns = [...columns];
    const column = newColumns[rowIndex];
    
    // 필드 값 업데이트
    (column as any)[field] = value;
    
    // 자동 규칙 적용
    if (field === 'primaryKey' && value === true) {
      // PK 설정 시 NOT NULL로 자동 변경
      column.nullable = false;
    } else if (field === 'identity' && value === true) {
      // IDENTITY 설정 시 기본값 제거
      column.defaultValue = undefined;
      // IDENTITY는 보통 PK와 함께 사용되므로 제안
      if (!column.primaryKey) {
        // PK로 설정하지는 않고 사용자가 직접 설정하도록 함
      }
    } else if (field === 'dataType') {
      // 데이터 타입 변경 시 관련 필드 초기화
      if (!requiresLength(value)) {
        column.maxLength = undefined;
      }
      if (!requiresPrecisionScale(value)) {
        column.precision = undefined;
        column.scale = undefined;
      }
      if (!supportsIdentity(value)) {
        column.identity = false;
        column.identitySeed = undefined;
        column.identityIncrement = undefined;
      }
      // 타입 변경 시 기본값도 초기화
      column.defaultValue = undefined;
    } else if (field === 'koreanName' || field === 'additionalDescription') {
      // 한글명 또는 추가설명 변경 시 description 재구성
      const koreanName = field === 'koreanName' ? value : getKoreanName(column);
      const additionalDesc = field === 'additionalDescription' ? value : getAdditionalDescription(column);
      
      if (koreanName.trim()) {
        column.description = additionalDesc.trim() 
          ? `${koreanName.trim()} - ${additionalDesc.trim()}`
          : koreanName.trim();
      } else {
        column.description = additionalDesc.trim() || undefined;
      }
      
      // description 필드는 이미 업데이트되었으므로 원래 필드 업데이트는 건너뛰기
      setColumns(newColumns);
      setEditingCell(null);
      return;
    }
    
    setColumns(newColumns);
    setEditingCell(null);
  };

  // 편집 가능한 셀 컴포넌트
  const EditableCell: React.FC<{
    value: any;
    rowIndex: number;
    field: string;
    type: 'text' | 'select' | 'number' | 'checkbox';
    options?: string[];
    column?: Column;
  }> = ({ value, rowIndex, field, type, options }) => {
    const [localValue, setLocalValue] = useState(value);
    const isEditing = editingCell?.rowIndex === rowIndex && editingCell?.field === field;

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    const handleSave = () => {
      handleCellSave(rowIndex, field, localValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        setLocalValue(value);
        setEditingCell(null);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        handleSave();
        // TODO: 다음 셀로 포커스 이동 로직
      }
    };

    if (!isEditing) {
      return (
        <div
          className="w-full h-8 px-2 py-1 cursor-pointer hover:bg-gray-50 rounded text-sm"
          onClick={() => handleCellEdit(rowIndex, field)}
        >
          {type === 'checkbox' ? (
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleCellSave(rowIndex, field, e.target.checked)}
              className="rounded"
            />
          ) : (
            value || <span className="text-gray-400">클릭하여 편집</span>
          )}
        </div>
      );
    }

    if (type === 'select' && options) {
      return (
        <select
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full h-8 px-1 border border-blue-500 rounded text-sm focus:outline-none bg-white"
          autoFocus
        >
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    if (type === 'number') {
      return (
        <input
          type="number"
          value={localValue || ''}
          onChange={(e) => setLocalValue(Number(e.target.value) || null)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full h-8 px-2 border border-blue-500 rounded text-sm focus:outline-none"
          autoFocus
        />
      );
    }

    return (
      <input
        type="text"
        value={localValue || ''}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full h-8 px-2 border border-blue-500 rounded text-sm focus:outline-none"
        autoFocus
      />
    );
  };

  if (disabled || !selectedTable) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">테이블을 먼저 선택해주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* 컬럼 테이블 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* 테이블 헤더 */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-20 gap-1 p-2 text-xs font-medium text-gray-700">
            <div className="col-span-3">컬럼명 (영문)</div>
            <div className="col-span-3">한글명</div>
            <div className="col-span-2">데이터 타입</div>
            <div className="col-span-2">길이/정밀도</div>
            <div className="col-span-1">PK</div>
            <div className="col-span-1">NULL</div>
            <div className="col-span-1">IDENTITY</div>
            <div className="col-span-2">기본값</div>
            <div className="col-span-4">설명</div>
            <div className="col-span-1">⚙️</div>
          </div>
        </div>

        {/* 테이블 바디 */}
        <div className="bg-white">
          {columns.length > 0 ? (
            columns.map((column, index) => (
              <div key={column.id} className="grid grid-cols-20 gap-1 p-2 border-b border-gray-100 hover:bg-gray-50 text-sm">
                  {/* 컬럼명 (영문) */}
                  <div className="col-span-3">
                    <EditableCell
                      value={column.name}
                      rowIndex={index}
                      field="name"
                      type="text"
                      column={column}
                    />
                  </div>

                  {/* 한글명 */}
                  <div className="col-span-3">
                    <EditableCell
                      value={getKoreanName(column)}
                      rowIndex={index}
                      field="koreanName"
                      type="text"
                      column={column}
                    />
                  </div>

                  {/* 데이터 타입 */}
                  <div className="col-span-2">
                    <EditableCell
                      value={column.dataType}
                      rowIndex={index}
                      field="dataType"
                      type="select"
                      options={dataTypes}
                      column={column}
                    />
                  </div>

                  {/* 길이/정밀도 (데스크톱에서 더 넓게) */}
                  <div className="col-span-2">
                    {requiresLength(column.dataType) ? (
                      <EditableCell
                        value={column.maxLength}
                        rowIndex={index}
                        field="maxLength"
                        type="number"
                        column={column}
                      />
                    ) : requiresPrecisionScale(column.dataType) ? (
                      <div className="flex space-x-1">
                        <EditableCell
                          value={column.precision}
                          rowIndex={index}
                          field="precision"
                          type="number"
                          column={column}
                        />
                        <span className="text-xs text-gray-400 flex items-center">,</span>
                        <EditableCell
                          value={column.scale}
                          rowIndex={index}
                          field="scale"
                          type="number"
                          column={column}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-8 px-2 py-1 text-xs text-gray-400 flex items-center justify-center">
                        -
                      </div>
                    )}
                  </div>

                  {/* 기본키 */}
                  <div className="col-span-1 flex justify-center items-center">
                    <EditableCell
                      value={column.primaryKey}
                      rowIndex={index}
                      field="primaryKey"
                      type="checkbox"
                      column={column}
                    />
                  </div>

                  {/* NULL 허용 */}
                  <div className="col-span-1 flex justify-center items-center">
                    <EditableCell
                      value={column.nullable}
                      rowIndex={index}
                      field="nullable"
                      type="checkbox"
                      column={column}
                    />
                  </div>

                  {/* IDENTITY (자동 증가) */}
                  <div className="col-span-1 flex justify-center items-center">
                    {supportsIdentity(column.dataType) ? (
                      <EditableCell
                        value={column.identity}
                        rowIndex={index}
                        field="identity"
                        type="checkbox"
                        column={column}
                      />
                    ) : (
                      <div className="w-full h-8 px-2 py-1 text-xs text-gray-400 flex items-center justify-center">
                        -
                      </div>
                    )}
                  </div>

                  {/* 기본값 */}
                  <div className="col-span-2">
                    {!column.identity ? (
                      <EditableCell
                        value={column.defaultValue}
                        rowIndex={index}
                        field="defaultValue"
                        type="select"
                        options={getDefaultValueOptions(column.dataType)}
                        column={column}
                      />
                    ) : (
                      <div className="w-full h-8 px-2 py-1 text-xs text-gray-400 flex items-center justify-center">
                        IDENTITY
                      </div>
                    )}
                  </div>

                  {/* 설명 */}
                  <div className="col-span-4">
                    <EditableCell
                      value={getAdditionalDescription(column)}
                      rowIndex={index}
                      field="additionalDescription"
                      type="text"
                      column={column}
                    />
                  </div>

                  {/* 작업 버튼 */}
                  <div className="col-span-1 flex justify-center items-center">
                    <button
                      onClick={() => handleDeleteColumn(index)}
                      className="text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all p-1 rounded-md"
                      title="컬럼 삭제"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">아직 생성된 컬럼이 없습니다.</p>
              <p className="text-sm">아래 버튼을 클릭하여 컬럼을 추가하세요.</p>
            </div>
          )}
        </div>
      </div>

      {/* 컨트롤 버튼 */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          총 {columns.length}개 컬럼
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={handleAddColumn}
            variant="outline"
            size="sm"
            className="font-medium shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
              borderColor: '#9333ea',
              color: 'white',
              border: 'none'
            }}
          >
            + 컬럼 추가
          </Button>
          
          <Button
            onClick={() => {
              // TODO: 변경사항 저장 로직
              console.log('컬럼 저장:', columns);
            }}
            variant="outline"
            size="sm"
            disabled={columns.length === 0}
          >
            저장
          </Button>
        </div>
      </div>

      {/* 사용법 안내 */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <h4 className="font-medium text-blue-900 mb-2 text-sm">🎯 ERD 스타일 편집 방법</h4>
        <ul className="text-xs text-blue-700 space-y-0.5">
          <li>• **기본 편집**: 셀을 클릭하여 인라인 편집 시작</li>
          <li>• **키보드**: Tab으로 다음 셀, Shift+Tab으로 이전 셀, Enter로 완료, Esc로 취소</li>
          <li>• **컬럼명**: 영문명과 한글명을 별도로 관리, 한글명은 필수 입력 권장</li>
          <li>• **길이/정밀도**: VARCHAR는 길이, DECIMAL은 정밀도,소수점으로 표시</li>
          <li>• **IDENTITY**: 정수형에서만 사용 가능, 설정 시 기본값 자동 비활성화</li>
        </ul>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-purple-600"></div>
            <span className="text-sm">컬럼 정보를 불러오는 중...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnEditor;