import React, { useState } from 'react';
import { 
  CodeBracketIcon, 
  ClipboardDocumentIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import type { Index, Table } from '../../types';
import { generateIndexSQL } from '../../utils/indexUtils';

interface IndexSqlPreviewProps {
  index: Index;
  table: Table;
}

const IndexSqlPreview: React.FC<IndexSqlPreviewProps> = ({
  index,
  table
}) => {
  const [copied, setCopied] = useState(false);
  
  const sql = generateIndexSQL(index, table);
  
  // SQL 복사 처리
  const handleCopy = () => {
    navigator.clipboard.writeText(sql).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  if (!sql) return null;
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 flex items-center">
          <CodeBracketIcon className="h-5 w-5 mr-1 text-blue-600" />
          SQL 미리보기
        </h4>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
        >
          {copied ? (
            <>
              <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1" />
              복사됨
            </>
          ) : (
            <>
              <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
              복사
            </>
          )}
        </button>
      </div>
      
      <div className="bg-gray-800 rounded-md overflow-hidden">
        <pre className="p-3 text-sm text-gray-100 overflow-x-auto">
          <code>{sql}</code>
        </pre>
      </div>
    </div>
  );
};

export default IndexSqlPreview;