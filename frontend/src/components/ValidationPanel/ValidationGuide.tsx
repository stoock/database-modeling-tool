import React, { useState } from 'react';
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface GuideSection {
  id: string;
  title: string;
  description: string;
  items: GuideItem[];
}

interface GuideItem {
  id: string;
  title: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  solution: string;
  example?: {
    wrong?: string;
    correct: string;
  };
}

const ValidationGuide: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['naming']));
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getSeverityIcon = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
    }
  };

  const guideSections: GuideSection[] = [
    {
      id: 'naming',
      title: '네이밍 규칙 위반',
      description: '테이블, 컬럼, 인덱스 등의 네이밍 규칙 관련 문제와 해결 방법',
      items: [
        {
          id: 'table-naming',
          title: '테이블명 네이밍 규칙 위반',
          description: '테이블명이 설정된 네이밍 규칙을 준수하지 않습니다.',
          severity: 'error',
          solution: '프로젝트 설정에서 정의한 테이블 네이밍 규칙에 맞게 테이블명을 수정하세요.',
          example: {
            wrong: 'user_table, UserTable, user-table',
            correct: 'User (PascalCase 규칙 적용 시)'
          }
        },
        {
          id: 'column-naming',
          title: '컬럼명 네이밍 규칙 위반',
          description: '컬럼명이 설정된 네이밍 규칙을 준수하지 않습니다.',
          severity: 'error',
          solution: '프로젝트 설정에서 정의한 컬럼 네이밍 규칙에 맞게 컬럼명을 수정하세요.',
          example: {
            wrong: 'UserName, userName, user-name',
            correct: 'user_name (snake_case 규칙 적용 시)'
          }
        },
        {
          id: 'index-naming',
          title: '인덱스명 네이밍 규칙 위반',
          description: '인덱스명이 설정된 네이밍 규칙을 준수하지 않습니다.',
          severity: 'error',
          solution: '인덱스명을 "IX_테이블명_컬럼명" 형식으로 수정하거나 프로젝트 설정의 인덱스 네이밍 규칙에 맞게 수정하세요.',
          example: {
            wrong: 'user_index, idx_user_name',
            correct: 'IX_User_Name (기본 규칙 적용 시)'
          }
        },
        {
          id: 'reserved-words',
          title: '예약어 사용',
          description: '테이블명이나 컬럼명에 SQL 예약어를 사용했습니다.',
          severity: 'error',
          solution: '예약어가 아닌 다른 이름을 사용하거나, 대괄호 []로 감싸서 사용하세요.',
          example: {
            wrong: 'SELECT, ORDER, GROUP, USER',
            correct: 'UserInfo, OrderItem, GroupMember'
          }
        }
      ]
    },
    {
      id: 'structure',
      title: '구조적 문제',
      description: '테이블 구조, 관계, 제약조건 등의 구조적 문제와 해결 방법',
      items: [
        {
          id: 'no-primary-key',
          title: '기본키 누락',
          description: '테이블에 기본키가 정의되지 않았습니다.',
          severity: 'error',
          solution: '테이블에 기본키 컬럼을 추가하세요. 일반적으로 ID 컬럼을 BIGINT IDENTITY로 설정합니다.',
          example: {
            correct: 'id BIGINT IDENTITY(1,1) PRIMARY KEY'
          }
        },
        {
          id: 'multiple-primary-keys',
          title: '복수 기본키',
          description: '테이블에 여러 개의 기본키가 정의되었습니다.',
          severity: 'error',
          solution: '테이블당 하나의 기본키만 설정하세요. 복합 기본키가 필요한 경우 여러 컬럼을 하나의 기본키로 구성하세요.'
        },
        {
          id: 'no-columns',
          title: '컬럼 없음',
          description: '테이블에 컬럼이 정의되지 않았습니다.',
          severity: 'error',
          solution: '테이블에 최소 하나 이상의 컬럼을 추가하세요.'
        },
        {
          id: 'duplicate-column-names',
          title: '중복 컬럼명',
          description: '테이블 내에 동일한 이름의 컬럼이 여러 개 있습니다.',
          severity: 'error',
          solution: '각 컬럼은 고유한 이름을 가져야 합니다. 중복된 컬럼명을 수정하세요.'
        }
      ]
    },
    {
      id: 'data-types',
      title: '데이터 타입 문제',
      description: 'MSSQL 데이터 타입 사용과 관련된 문제와 해결 방법',
      items: [
        {
          id: 'invalid-data-type',
          title: '잘못된 데이터 타입',
          description: 'MSSQL에서 지원하지 않는 데이터 타입을 사용했습니다.',
          severity: 'error',
          solution: 'MSSQL에서 지원하는 데이터 타입으로 변경하세요.',
          example: {
            wrong: 'STRING, BOOLEAN, AUTO_INCREMENT',
            correct: 'NVARCHAR, BIT, IDENTITY'
          }
        },
        {
          id: 'missing-length',
          title: '길이 정보 누락',
          description: 'VARCHAR, NVARCHAR 등의 타입에 길이 정보가 누락되었습니다.',
          severity: 'error',
          solution: '문자열 타입에는 반드시 길이를 지정하세요.',
          example: {
            wrong: 'VARCHAR, NVARCHAR',
            correct: 'VARCHAR(255), NVARCHAR(100)'
          }
        },
        {
          id: 'invalid-precision',
          title: '잘못된 정밀도',
          description: 'DECIMAL, NUMERIC 타입의 정밀도나 소수점 자릿수가 잘못되었습니다.',
          severity: 'error',
          solution: '정밀도는 1-38, 소수점 자릿수는 0-정밀도 범위 내에서 설정하세요.',
          example: {
            wrong: 'DECIMAL(40,2), DECIMAL(18,20)',
            correct: 'DECIMAL(18,2), DECIMAL(10,4)'
          }
        },
        {
          id: 'identity-wrong-type',
          title: 'IDENTITY 타입 오류',
          description: 'IDENTITY 속성을 정수 타입이 아닌 컬럼에 적용했습니다.',
          severity: 'error',
          solution: 'IDENTITY는 BIGINT, INT, SMALLINT, TINYINT 타입에만 사용할 수 있습니다.',
          example: {
            wrong: 'VARCHAR(10) IDENTITY',
            correct: 'BIGINT IDENTITY(1,1)'
          }
        }
      ]
    },
    {
      id: 'indexes',
      title: '인덱스 문제',
      description: '인덱스 설정과 관련된 문제와 해결 방법',
      items: [
        {
          id: 'duplicate-indexes',
          title: '중복 인덱스',
          description: '동일한 컬럼 조합에 대해 중복된 인덱스가 있습니다.',
          severity: 'warning',
          solution: '중복된 인덱스 중 하나를 제거하세요. 성능에 부정적인 영향을 줄 수 있습니다.'
        },
        {
          id: 'too-many-indexes',
          title: '과도한 인덱스',
          description: '테이블에 너무 많은 인덱스가 정의되었습니다.',
          severity: 'warning',
          solution: '실제로 필요한 인덱스만 유지하세요. 과도한 인덱스는 INSERT/UPDATE 성능을 저하시킵니다.'
        },
        {
          id: 'no-clustered-index',
          title: '클러스터드 인덱스 누락',
          description: '테이블에 클러스터드 인덱스가 없습니다.',
          severity: 'info',
          solution: '기본키에 클러스터드 인덱스를 설정하는 것을 권장합니다.'
        },
        {
          id: 'wide-index',
          title: '너무 넓은 인덱스',
          description: '인덱스에 포함된 컬럼이 너무 많거나 크기가 큽니다.',
          severity: 'warning',
          solution: '인덱스 키 크기를 900바이트 이하로 유지하고, 필요한 컬럼만 포함하세요.'
        }
      ]
    },
    {
      id: 'performance',
      title: '성능 관련 권장사항',
      description: '데이터베이스 성능 최적화를 위한 권장사항',
      items: [
        {
          id: 'missing-indexes',
          title: '인덱스 부족',
          description: '자주 조회되는 컬럼에 인덱스가 없습니다.',
          severity: 'info',
          solution: '외래키, 자주 검색되는 컬럼, WHERE 절에 자주 사용되는 컬럼에 인덱스를 추가하세요.'
        },
        {
          id: 'text-data-type',
          title: 'TEXT 타입 사용',
          description: 'TEXT, NTEXT 타입은 성능상 권장되지 않습니다.',
          severity: 'warning',
          solution: 'VARCHAR(MAX), NVARCHAR(MAX) 사용을 권장합니다.',
          example: {
            wrong: 'TEXT, NTEXT',
            correct: 'VARCHAR(MAX), NVARCHAR(MAX)'
          }
        },
        {
          id: 'nullable-columns',
          title: '과도한 NULL 허용',
          description: '대부분의 컬럼이 NULL을 허용합니다.',
          severity: 'info',
          solution: '필수 데이터는 NOT NULL로 설정하여 데이터 무결성을 향상시키세요.'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">검증 오류 해결 가이드</h3>
        <p className="text-sm text-gray-600 mt-1">
          스키마 검증에서 발생할 수 있는 문제들과 해결 방법을 안내합니다.
        </p>
      </div>

      <div className="space-y-4">
        {guideSections.map((section) => (
          <div key={section.id} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
            >
              <div>
                <h4 className="text-md font-medium text-gray-900">{section.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{section.description}</p>
              </div>
              {expandedSections.has(section.id) ? (
                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.has(section.id) && (
              <div className="border-t border-gray-200">
                <div className="p-4 space-y-3">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className={`border rounded-lg ${getSeverityColor(item.severity)}`}
                    >
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full px-4 py-3 text-left flex items-start space-x-3 hover:bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                      >
                        {getSeverityIcon(item.severity)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium text-gray-900">{item.title}</h5>
                            {expandedItems.has(item.id) ? (
                              <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                      </button>

                      {expandedItems.has(item.id) && (
                        <div className="px-4 pb-4 border-t border-gray-200 border-opacity-50">
                          <div className="pt-3 space-y-3">
                            <div>
                              <h6 className="text-sm font-medium text-gray-900 flex items-center">
                                <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                                해결 방법
                              </h6>
                              <p className="text-sm text-gray-700 mt-1 ml-6">{item.solution}</p>
                            </div>

                            {item.example && (
                              <div>
                                <h6 className="text-sm font-medium text-gray-900">예시</h6>
                                <div className="mt-2 space-y-2">
                                  {item.example.wrong && (
                                    <div className="bg-red-50 border border-red-200 rounded p-3">
                                      <p className="text-sm text-red-800">
                                        <span className="font-medium">잘못된 예:</span> {item.example.wrong}
                                      </p>
                                    </div>
                                  )}
                                  <div className="bg-green-50 border border-green-200 rounded p-3">
                                    <p className="text-sm text-green-800">
                                      <span className="font-medium">올바른 예:</span> {item.example.correct}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">추가 도움말</h4>
            <div className="text-sm text-blue-800 mt-1 space-y-1">
              <p>• 검증 결과는 실시간으로 업데이트됩니다.</p>
              <p>• 네이밍 규칙은 프로젝트별로 설정할 수 있습니다.</p>
              <p>• 심각도에 따라 오류(빨간색), 경고(노란색), 정보(파란색)로 구분됩니다.</p>
              <p>• 자동 수정 기능을 사용하여 일부 문제를 자동으로 해결할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationGuide;