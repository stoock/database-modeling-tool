import React from 'react';
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import type { Index, Table } from '../../types';
import { analyzeIndexPerformance, getIndexTypeDescription } from '../../utils/indexUtils';

interface IndexPerformancePanelProps {
  index: Index;
  table: Table;
}

const IndexPerformancePanel: React.FC<IndexPerformancePanelProps> = ({
  index,
  table
}) => {
  const { score, recommendations } = analyzeIndexPerformance(index, table);
  const typeDescription = getIndexTypeDescription(index.type);
  
  // 점수에 따른 색상 결정
  const getScoreColor = () => {
    if (score >= 8) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // 점수에 따른 아이콘 결정
  const getScoreIcon = () => {
    if (score >= 8) return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    if (score >= 5) return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
    return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
  };
  
  return (
    <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h4 className="text-sm font-medium text-gray-900 flex items-center mb-3">
        <ChartBarIcon className="h-5 w-5 mr-1 text-blue-600" />
        인덱스 성능 분석
      </h4>
      
      <div className="flex items-center mb-3">
        <div className="text-2xl font-bold mr-2 flex items-center">
          <span className={getScoreColor()}>{score}</span>
          <span className="text-gray-500 text-sm">/10</span>
        </div>
        <div className="flex-1">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                score >= 8 ? 'bg-green-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${score * 10}%` }}
            />
          </div>
        </div>
        <div className="ml-2">
          {getScoreIcon()}
        </div>
      </div>
      
      {typeDescription && (
        <div className="mb-3 text-sm flex items-start">
          <InformationCircleIcon className="h-4 w-4 text-blue-500 mr-1 mt-0.5 flex-shrink-0" />
          <p className="text-gray-600">{typeDescription}</p>
        </div>
      )}
      
      {recommendations.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-medium text-gray-700">권장사항:</h5>
          <ul className="text-sm space-y-1">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-1">•</span>
                <span className="text-gray-600">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default IndexPerformancePanel;