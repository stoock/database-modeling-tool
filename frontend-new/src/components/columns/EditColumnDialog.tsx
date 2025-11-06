import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { updateColumn } from '@/lib/api';
import {
  validateColumnName,
  validatePrimaryKeyColumnName,
  validateColumnDescription,
  validateDataTypeProperties,
  requiresLength,
  requiresPrecisionScale,
  supportsIdentity,
  type ValidationResult,
} from '@/lib/validation';
import type { Column, MSSQLDataType, UpdateColumnRequest } from '@/types';

// MSSQL 데이터 타입 목록 (카테고리별)
const DATA_TYPE_CATEGORIES = {
  정수형: ['BIGINT', 'INT', 'SMALLINT', 'TINYINT'] as MSSQLDataType[],
  실수형: ['DECIMAL', 'NUMERIC', 'FLOAT', 'REAL'] as MSSQLDataType[],
  문자열: ['VARCHAR', 'NVARCHAR', 'CHAR', 'NCHAR', 'TEXT', 'NTEXT'] as MSSQLDataType[],
  '날짜/시간': ['DATE', 'TIME', 'DATETIME', 'DATETIME2', 'TIMESTAMP'] as MSSQLDataType[],
  이진: ['BIT', 'BINARY', 'VARBINARY', 'IMAGE'] as MSSQLDataType[],
  기타: ['UNIQUEIDENTIFIER', 'XML', 'JSON'] as MSSQLDataType[],
};

interface EditColumnDialogProps {
  column: Column;
  tableName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditColumnDialog({
  column,
  tableName,
  open,
  onOpenChange,
  onSuccess,
}: EditColumnDialogProps) {
  // 폼 상태
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dataType, setDataType] = useState<MSSQLDataType>('VARCHAR');
  const [maxLength, setMaxLength] = useState<number | undefined>(undefined);
  const [precision, setPrecision] = useState<number | undefined>(undefined);
  const [scale, setScale] = useState<number | undefined>(undefined);
  const [nullable, setNullable] = useState(true);
  const [primaryKey, setPrimaryKey] = useState(false);
  const [identity, setIdentity] = useState(false);
  const [identitySeed, setIdentitySeed] = useState<number>(1);
  const [identityIncrement, setIdentityIncrement] = useState<number>(1);
  const [defaultValue, setDefaultValue] = useState('');

  // UI 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameValidation, setNameValidation] = useState<ValidationResult | null>(null);
  const [descriptionValidation, setDescriptionValidation] = useState<ValidationResult | null>(null);
  const [dataTypeValidation, setDataTypeValidation] = useState<ValidationResult | null>(null);

  // 디바운스 타이머
  const [nameDebounceTimer, setNameDebounceTimer] = useState<number | null>(null);
  const [descriptionDebounceTimer, setDescriptionDebounceTimer] = useState<number | null>(null);

  // 다이얼로그가 열릴 때 기존 컬럼 값으로 초기화
  useEffect(() => {
    if (open && column) {
      setName(column.name);
      setDescription(column.description);
      setDataType(column.dataType);
      setMaxLength(column.maxLength);
      setPrecision(column.precision);
      setScale(column.scale);
      setNullable(column.nullable);
      setPrimaryKey(column.primaryKey);
      setIdentity(column.identity);
      setIdentitySeed(column.identitySeed || 1);
      setIdentityIncrement(column.identityIncrement || 1);
      setDefaultValue(column.defaultValue || '');
      setNameValidation(null);
      setDescriptionValidation(null);
      setDataTypeValidation(null);
    }
  }, [open, column]);

  // 컬럼명 실시간 검증 (500ms 디바운스)
  useEffect(() => {
    if (nameDebounceTimer) {
      clearTimeout(nameDebounceTimer);
    }

    if (name.trim() === '') {
      setNameValidation(null);
      return;
    }

    const timer = setTimeout(() => {
      if (primaryKey) {
        const result = validatePrimaryKeyColumnName(name, tableName);
        setNameValidation(result);
      } else {
        const result = validateColumnName(name);
        setNameValidation(result);
      }
    }, 500);

    setNameDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [name, primaryKey, tableName]);

  // Description 실시간 검증 (500ms 디바운스)
  useEffect(() => {
    if (descriptionDebounceTimer) {
      clearTimeout(descriptionDebounceTimer);
    }

    if (description.trim() === '') {
      setDescriptionValidation(null);
      return;
    }

    const timer = setTimeout(() => {
      const result = validateColumnDescription(description, name);
      setDescriptionValidation(result);
    }, 500);

    setDescriptionDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [description, name]);

  // 데이터 타입 속성 검증
  useEffect(() => {
    const result = validateDataTypeProperties(dataType, maxLength, precision, scale);
    setDataTypeValidation(result);
  }, [dataType, maxLength, precision, scale]);

  // 데이터 타입 변경 시 관련 필드 초기화
  useEffect(() => {
    if (requiresLength(dataType)) {
      if (!maxLength) {
        setMaxLength(dataType.startsWith('N') ? 100 : 100);
      }
    } else {
      setMaxLength(undefined);
    }

    if (requiresPrecisionScale(dataType)) {
      if (!precision) setPrecision(18);
      if (scale === undefined) setScale(2);
    } else {
      setPrecision(undefined);
      setScale(undefined);
    }

    if (!supportsIdentity(dataType)) {
      setIdentity(false);
    }
  }, [dataType]);

  // PK 변경 시 nullable 자동 설정
  useEffect(() => {
    if (primaryKey) {
      setNullable(false);
    }
  }, [primaryKey]);

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 최종 검증
    if (!name.trim() || !description.trim()) {
      return;
    }

    if (nameValidation && !nameValidation.isValid) {
      return;
    }

    if (descriptionValidation && !descriptionValidation.isValid) {
      return;
    }

    if (dataTypeValidation && !dataTypeValidation.isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      const data: UpdateColumnRequest = {
        name: name.trim(),
        description: description.trim(),
        dataType,
        maxLength: requiresLength(dataType) ? maxLength : undefined,
        precision: requiresPrecisionScale(dataType) ? precision : undefined,
        scale: requiresPrecisionScale(dataType) ? scale : undefined,
        nullable,
        primaryKey,
        identity,
        identitySeed: identity ? identitySeed : undefined,
        identityIncrement: identity ? identityIncrement : undefined,
        defaultValue: defaultValue.trim() || undefined,
      };

      await updateColumn(column.id, data);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('컬럼 수정 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 검증 배지 컴포넌트
  const ValidationBadge = ({ validation }: { validation: ValidationResult | null }) => {
    if (!validation) return null;

    return (
      <div className={`flex items-start gap-2 mt-1 text-xs ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
        {validation.isValid ? (
          <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
        ) : (
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        )}
        <div className="flex-1">
          <p>{validation.message}</p>
          {validation.suggestion && (
            <p className="text-gray-500 mt-0.5">{validation.suggestion}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>컬럼 편집</DialogTitle>
          <DialogDescription>
            테이블 "{tableName}"의 컬럼 "{column.name}"을 수정합니다
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 컬럼명 */}
          <div className="space-y-2">
            <Label htmlFor="name">
              컬럼명 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: USER_ID, REG_DT"
              required
            />
            <ValidationBadge validation={nameValidation} />
            <p className="text-xs text-gray-500">
              대문자 형식을 사용하세요 (예: USER_ID, ORDER_ITEM_NO)
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description (한글명) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="예: 사용자ID, 처리결과코드 || 0:성공, -100:실패"
              required
            />
            <ValidationBadge validation={descriptionValidation} />
            <p className="text-xs text-gray-500">
              한글명 또는 "한글명 || 상세설명" 형식을 권장합니다
            </p>
          </div>

          {/* 데이터 타입 */}
          <div className="space-y-2">
            <Label htmlFor="dataType">
              데이터 타입 <span className="text-red-500">*</span>
            </Label>
            <Select value={dataType} onValueChange={(value) => setDataType(value as MSSQLDataType)}>
              <SelectTrigger id="dataType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DATA_TYPE_CATEGORIES).map(([category, types]) => (
                  <div key={category}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">
                      {category}
                    </div>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 조건부 필드: 길이 (VARCHAR, NVARCHAR, CHAR, NCHAR) */}
          {requiresLength(dataType) && (
            <div className="space-y-2">
              <Label htmlFor="maxLength">
                길이 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="maxLength"
                type="number"
                value={maxLength || ''}
                onChange={(e) => setMaxLength(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder={dataType.startsWith('N') ? '최대 4000' : '최대 8000'}
                min={1}
                max={dataType.startsWith('N') ? 4000 : 8000}
                required
              />
              <p className="text-xs text-gray-500">
                {dataType.startsWith('N') ? 'NVARCHAR/NCHAR는 최대 4000' : 'VARCHAR/CHAR는 최대 8000'}
              </p>
            </div>
          )}

          {/* 조건부 필드: Precision & Scale (DECIMAL, NUMERIC) */}
          {requiresPrecisionScale(dataType) && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precision">
                  Precision <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="precision"
                  type="number"
                  value={precision || ''}
                  onChange={(e) => setPrecision(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="1-38"
                  min={1}
                  max={38}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scale">
                  Scale <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="scale"
                  type="number"
                  value={scale !== undefined ? scale : ''}
                  onChange={(e) => setScale(e.target.value ? parseInt(e.target.value) : 0)}
                  placeholder="0-precision"
                  min={0}
                  max={precision || 38}
                  required
                />
              </div>
            </div>
          )}

          {/* 데이터 타입 검증 */}
          {dataTypeValidation && !dataTypeValidation.isValid && (
            <ValidationBadge validation={dataTypeValidation} />
          )}

          {/* 제약조건 */}
          <div className="space-y-3 border-t pt-4">
            <h4 className="text-sm font-semibold">제약조건</h4>
            
            {/* NULL 허용 */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="nullable"
                checked={nullable || false}
                onChange={(e) => setNullable(e.target.checked)}
                disabled={primaryKey}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="nullable" className="cursor-pointer">
                NULL 허용
              </Label>
            </div>

            {/* 기본키 */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="primaryKey"
                checked={primaryKey || false}
                onChange={(e) => setPrimaryKey(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="primaryKey" className="cursor-pointer">
                기본키 (Primary Key)
              </Label>
            </div>

            {/* IDENTITY (정수형만) */}
            {supportsIdentity(dataType) && (
              <>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="identity"
                    checked={identity || false}
                    onChange={(e) => setIdentity(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="identity" className="cursor-pointer">
                    IDENTITY (자동 증가)
                  </Label>
                </div>

                {identity && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div className="space-y-2">
                      <Label htmlFor="identitySeed">Seed (시작값)</Label>
                      <Input
                        id="identitySeed"
                        type="number"
                        value={identitySeed}
                        onChange={(e) => setIdentitySeed(parseInt(e.target.value) || 1)}
                        min={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="identityIncrement">Increment (증가값)</Label>
                      <Input
                        id="identityIncrement"
                        type="number"
                        value={identityIncrement}
                        onChange={(e) => setIdentityIncrement(parseInt(e.target.value) || 1)}
                        min={1}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 기본값 */}
          <div className="space-y-2">
            <Label htmlFor="defaultValue">기본값 (선택)</Label>
            <Input
              id="defaultValue"
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              placeholder="예: GETDATE(), 0, 'N'"
            />
            <p className="text-xs text-gray-500">
              SQL 표현식을 입력하세요 (예: GETDATE(), NEWID())
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !name.trim() ||
                !description.trim() ||
                (nameValidation !== null && !nameValidation.isValid) ||
                (descriptionValidation !== null && !descriptionValidation.isValid) ||
                (dataTypeValidation !== null && !dataTypeValidation.isValid)
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  수정 중...
                </>
              ) : (
                '수정'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
