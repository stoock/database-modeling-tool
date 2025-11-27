import { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import type { MSSQLDataType, CreateColumnRequest } from '@/types';
import { createColumn } from '@/lib/api';
import {
  validateColumnName,
  validateColumnDescription,
  requiresLength,
  requiresPrecisionScale,
  supportsIdentity,
} from '@/lib/validation';

// MSSQL 데이터 타입 목록
const DATA_TYPES: MSSQLDataType[] = [
  'BIGINT', 'INT', 'SMALLINT', 'TINYINT',
  'DECIMAL', 'NUMERIC', 'FLOAT', 'REAL',
  'VARCHAR', 'NVARCHAR', 'CHAR', 'NCHAR', 'TEXT', 'NTEXT',
  'DATE', 'TIME', 'DATETIME', 'DATETIME2', 'TIMESTAMP',
  'BIT', 'BINARY', 'VARBINARY', 'IMAGE',
  'UNIQUEIDENTIFIER', 'XML', 'JSON'
];

interface InlineColumnRowProps {
  tableId: string;
  nextOrderIndex: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InlineColumnRow({
  tableId,
  nextOrderIndex,
  onSuccess,
  onCancel,
}: InlineColumnRowProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dataType, setDataType] = useState<MSSQLDataType>('VARCHAR');
  const [maxLength, setMaxLength] = useState<number>(100);
  const [nullable, setNullable] = useState(true);
  const [primaryKey, setPrimaryKey] = useState(false);
  const [identity, setIdentity] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // 마운트 시 이름 입력에 포커스
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  // 데이터 타입 변경 시 관련 필드 초기화
  useEffect(() => {
    if (requiresLength(dataType)) {
      if (!maxLength) setMaxLength(100);
    }
  }, [dataType, maxLength]);

  // PK 변경 시 nullable 자동 설정
  useEffect(() => {
    if (primaryKey) {
      setNullable(false);
    }
  }, [primaryKey]);

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim()) {
      return;
    }

    // 간단한 검증
    const nameValidation = validateColumnName(name);
    const descValidation = validateColumnDescription(description, name);
    
    if (!nameValidation.isValid || !descValidation.isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data: CreateColumnRequest = {
        tableId,
        name: name.trim().toUpperCase(),
        description: description.trim(),
        dataType,
        maxLength: requiresLength(dataType) ? maxLength : undefined,
        precision: requiresPrecisionScale(dataType) ? 18 : undefined,
        scale: requiresPrecisionScale(dataType) ? 2 : undefined,
        nullable,
        primaryKey,
        identity,
        identitySeed: identity ? 1 : undefined,
        identityIncrement: identity ? 1 : undefined,
        defaultValue: undefined,
        orderIndex: nextOrderIndex,
      };

      await createColumn(data);
      onSuccess();
    } catch (error) {
      console.error('컬럼 생성 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <tr className="border-b bg-blue-50 hover:bg-blue-100">
      {/* 순서 */}
      <td className="px-4 py-2 text-sm text-gray-500">
        {nextOrderIndex}
      </td>

      {/* 컬럼명 */}
      <td className="px-4 py-2">
        <input
          ref={nameInputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder="컬럼명"
          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ textTransform: 'uppercase' }}
          disabled={isSubmitting}
        />
      </td>

      {/* 한글명 */}
      <td className="px-4 py-2">
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="한글명"
          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
      </td>

      {/* 데이터 타입 */}
      <td className="px-4 py-2">
        <div className="flex gap-1">
          <select
            value={dataType}
            onChange={(e) => setDataType(e.target.value as MSSQLDataType)}
            className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            {DATA_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {requiresLength(dataType) && (
            <input
              type="number"
              value={maxLength}
              onChange={(e) => setMaxLength(parseInt(e.target.value) || 100)}
              placeholder="길이"
              className="w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          )}
        </div>
      </td>

      {/* NULL */}
      <td className="px-4 py-2 text-center">
        <input
          type="checkbox"
          checked={nullable}
          onChange={(e) => setNullable(e.target.checked)}
          disabled={primaryKey || isSubmitting}
          className="h-4 w-4 rounded border-gray-300"
        />
      </td>

      {/* PK */}
      <td className="px-4 py-2 text-center">
        <input
          type="checkbox"
          checked={primaryKey}
          onChange={(e) => setPrimaryKey(e.target.checked)}
          disabled={isSubmitting}
          className="h-4 w-4 rounded border-gray-300"
        />
      </td>

      {/* IDENTITY */}
      <td className="px-4 py-2 text-center">
        <input
          type="checkbox"
          checked={identity}
          onChange={(e) => setIdentity(e.target.checked)}
          disabled={!supportsIdentity(dataType) || isSubmitting}
          className="h-4 w-4 rounded border-gray-300"
        />
      </td>

      {/* 액션 */}
      <td className="px-4 py-2 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim() || !description.trim()}
            className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="저장 (Enter)"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
            title="취소 (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
