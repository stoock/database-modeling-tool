import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { GripVertical, Edit, Trash2, Check, X } from 'lucide-react';
import type { Column } from '@/types';

interface SortableRowProps {
  column: Column;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export function SortableRow({ column, index, onEdit, onDelete }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 한글명 추출 (Description에서 "||" 앞부분)
  const koreanName = column.description.split('||')[0].trim();

  // 데이터 타입 표시 (길이, 정밀도 포함)
  const getDataTypeDisplay = () => {
    let display = column.dataType;

    if (column.maxLength) {
      display += `(${column.maxLength})`;
    } else if (column.precision !== undefined && column.scale !== undefined) {
      display += `(${column.precision}, ${column.scale})`;
    } else if (column.precision !== undefined) {
      display += `(${column.precision})`;
    }

    return display;
  };

  // IDENTITY 표시
  const getIdentityDisplay = () => {
    if (!column.identity) {
      return '-';
    }
    if (column.identitySeed !== undefined && column.identityIncrement !== undefined) {
      return `(${column.identitySeed}, ${column.identityIncrement})`;
    }
    return 'Yes';
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b hover:bg-gray-50 ${isDragging ? 'bg-blue-50' : ''}`}
    >
      {/* 순서 + 드래그 핸들 */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-600">{index + 1}</span>
        </div>
      </td>

      {/* 컬럼명 */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">{column.name}</span>
          {column.primaryKey && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
              PK
            </span>
          )}
        </div>
      </td>

      {/* 한글명 */}
      <td className="px-4 py-3">
        <span className="text-sm text-gray-700">{koreanName}</span>
      </td>

      {/* 데이터 타입 */}
      <td className="px-4 py-3">
        <span className="font-mono text-sm text-gray-900">{getDataTypeDisplay()}</span>
      </td>

      {/* NULL 허용 */}
      <td className="px-4 py-3 text-center">
        {column.nullable ? (
          <Check className="h-4 w-4 text-green-600 mx-auto" />
        ) : (
          <X className="h-4 w-4 text-red-600 mx-auto" />
        )}
      </td>

      {/* PK */}
      <td className="px-4 py-3 text-center">
        {column.primaryKey ? (
          <Check className="h-4 w-4 text-blue-600 mx-auto" />
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>

      {/* IDENTITY */}
      <td className="px-4 py-3 text-center">
        <span className="text-sm text-gray-700">{getIdentityDisplay()}</span>
      </td>

      {/* 액션 버튼 */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 w-8 p-0"
            title="컬럼 편집"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            title="컬럼 삭제"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
