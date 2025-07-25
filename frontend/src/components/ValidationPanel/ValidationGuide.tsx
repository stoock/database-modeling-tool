import React, { useState } from 'react';
import {
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useProjectStore } from '../../stores/projectStore';

interface ValidationGuideProps {
  className?: string;
}

interface GuideSection {
  id: string;
  title: string;
  description: string;
  examples: {
    good: string[];
    bad: string[];
  };
  tips: string[];
}

const ValidationGuide: React.FC<ValidationGuideProps> = ({ className = '' }) => {
  const { currentProject } = useProjectStore();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // 현재 프로젝트의 네이밍 규칙을 기반으로 가이드 생성
  const generateGuide = (): GuideSection[] => {
    const rules = currentProject?.namingRules;
    if (!rules) return [];

    const sections: GuideSection[] = [];

    // 테이블 네이밍 가이드
    if (rules.tablePattern || rules.tablePrefix || rules.tableSuffix || rules.enforceCase) {
      sections.push({
        id: 'table-naming',
        title: '테이블 네이밍 규칙',
        description: '테이블 이름이 따라야 하는 규칙입니다.',
        examples: {
          good: generateTableExamples(rules, true),
          bad: generateTableExamples(rules, false),
        },
        tips: generateTableTips(rules),
      });
    }

    // 컬럼 네이밍 가이드
    if (rules.columnPattern || rules.enforceCase) {
      sections.push({
        id: 'column-naming',
        title: '컬럼 네이밍 규칙',
        description: '컬럼 이름이 따라야 하는 규칙입니다.',
        examples: {
          good: generateColumnExamples(rules, true),
          bad: generateColumnExamples(rules, false),
        },
        tips: generateColumnTips(rules),
      });
    }

    // 인덱스 네이밍 가이드
    if (rules.indexPattern || rules.enforceCase) {
      sections.push({
        id: 'index-naming',
        title: '인덱스 네이밍 규칙',
        description: '인덱스 이름이 따라야 하는 규칙입니다.',
        examples: {
          good: generateIndexExamples(rules, true),
          bad: generateIndexExamples(rules, false),
        },
        tips: generateIndexTips(rules),
      });
    }

    return sections;
  };

  const guideSections = generateGuide();

  if (guideSections.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">네이밍 규칙이 설정되지 않았습니다</h3>
          <p className="mt-1 text-sm text-gray-500">
            네이밍 규칙을 설정하면 여기에 가이드가 표시됩니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <QuestionMarkCircleIcon className="h-5 w-5 mr-2 text-blue-500" />
          검증 오류 해결 가이드
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          현재 프로젝트의 네이밍 규칙에 따른 올바른 명명 방법을 확인하세요.
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {guideSections.map((section) => (
          <div key={section.id} className="p-4">
            <button
              onClick={() => toggleSection(section.id)}
              className="flex items-center justify-between w-full text-left"
            >
              <div>
                <h4 className="text-sm font-medium text-gray-900">{section.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{section.description}</p>
              </div>
              {expandedSections[section.id] ? (
                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {expandedSections[section.id] && (
              <div className="mt-4 space-y-4">
                {/* 올바른 예시 */}
                <div>
                  <h5 className="text-sm font-medium text-green-800 flex items-center mb-2">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    올바른 예시
                  </h5>
                  <div className="bg-green-50 rounded-md p-3">
                    <ul className="space-y-1">
                      {section.examples.good.map((example, index) => (
                        <li key={index} className="text-sm text-green-700 font-mono">
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 잘못된 예시 */}
                <div>
                  <h5 className="text-sm font-medium text-red-800 flex items-center mb-2">
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    잘못된 예시
                  </h5>
                  <div className="bg-red-50 rounded-md p-3">
                    <ul className="space-y-1">
                      {section.examples.bad.map((example, index) => (
                        <li key={index} className="text-sm text-red-700 font-mono line-through">
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 팁 */}
                <div>
                  <h5 className="text-sm font-medium text-blue-800 flex items-center mb-2">
                    <LightBulbIcon className="h-4 w-4 mr-1" />
                    유용한 팁
                  </h5>
                  <div className="bg-blue-50 rounded-md p-3">
                    <ul className="space-y-1">
                      {section.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-blue-700">
                          • {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 유틸리티 함수들
function generateTableExamples(rules: any, isGood: boolean): string[] {
  const examples: string[] = [];
  
  if (isGood) {
    if (rules.tablePrefix && rules.tableSuffix) {
      examples.push(`${rules.tablePrefix}User${rules.tableSuffix}`);
      examples.push(`${rules.tablePrefix}Order${rules.tableSuffix}`);
    } else if (rules.tablePrefix) {
      examples.push(`${rules.tablePrefix}User`);
      examples.push(`${rules.tablePrefix}Order`);
    } else if (rules.tableSuffix) {
      examples.push(`User${rules.tableSuffix}`);
      examples.push(`Order${rules.tableSuffix}`);
    } else {
      switch (rules.enforceCase) {
        case 'PASCAL':
          examples.push('User', 'OrderItem', 'ProductCategory');
          break;
        case 'SNAKE':
          examples.push('user', 'order_item', 'product_category');
          break;
        case 'UPPER':
          examples.push('USER', 'ORDER_ITEM', 'PRODUCT_CATEGORY');
          break;
        case 'LOWER':
          examples.push('user', 'orderitem', 'productcategory');
          break;
        default:
          examples.push('User', 'Order', 'Product');
      }
    }
  } else {
    // 잘못된 예시
    if (rules.tablePrefix) {
      examples.push('User', 'Order'); // 접두사 없음
    }
    if (rules.tableSuffix) {
      examples.push('User', 'Order'); // 접미사 없음
    }
    switch (rules.enforceCase) {
      case 'PASCAL':
        examples.push('user', 'orderItem', 'PRODUCT');
        break;
      case 'SNAKE':
        examples.push('User', 'OrderItem', 'PRODUCT');
        break;
      case 'UPPER':
        examples.push('user', 'Order', 'product');
        break;
      case 'LOWER':
        examples.push('USER', 'Order', 'PRODUCT');
        break;
    }
  }
  
  return examples;
}

function generateColumnExamples(rules: any, isGood: boolean): string[] {
  const examples: string[] = [];
  
  if (isGood) {
    switch (rules.enforceCase) {
      case 'PASCAL':
        examples.push('UserId', 'FirstName', 'CreatedAt');
        break;
      case 'SNAKE':
        examples.push('user_id', 'first_name', 'created_at');
        break;
      case 'UPPER':
        examples.push('USER_ID', 'FIRST_NAME', 'CREATED_AT');
        break;
      case 'LOWER':
        examples.push('userid', 'firstname', 'createdat');
        break;
      default:
        examples.push('user_id', 'first_name', 'created_at');
    }
  } else {
    switch (rules.enforceCase) {
      case 'PASCAL':
        examples.push('user_id', 'firstName', 'CREATED_AT');
        break;
      case 'SNAKE':
        examples.push('UserId', 'firstName', 'CREATED_AT');
        break;
      case 'UPPER':
        examples.push('user_id', 'firstName', 'created_at');
        break;
      case 'LOWER':
        examples.push('USER_ID', 'FirstName', 'CREATED_AT');
        break;
    }
  }
  
  return examples;
}

function generateIndexExamples(rules: any, isGood: boolean): string[] {
  const examples: string[] = [];
  
  if (isGood) {
    if (rules.indexPattern?.includes('IX_')) {
      examples.push('IX_User_Email', 'IX_Order_UserId', 'IX_Product_CategoryId');
    } else {
      switch (rules.enforceCase) {
        case 'PASCAL':
          examples.push('UserEmailIndex', 'OrderUserIdIndex');
          break;
        case 'SNAKE':
          examples.push('user_email_index', 'order_user_id_index');
          break;
        case 'UPPER':
          examples.push('USER_EMAIL_INDEX', 'ORDER_USER_ID_INDEX');
          break;
        default:
          examples.push('idx_user_email', 'idx_order_user_id');
      }
    }
  } else {
    if (rules.indexPattern?.includes('IX_')) {
      examples.push('user_email_index', 'idx_order_user_id');
    } else {
      examples.push('IX_User_Email', 'UserEmailIndex');
    }
  }
  
  return examples;
}

function generateTableTips(rules: any): string[] {
  const tips: string[] = [];
  
  if (rules.tablePrefix) {
    tips.push(`모든 테이블 이름은 "${rules.tablePrefix}" 접두사로 시작해야 합니다.`);
  }
  
  if (rules.tableSuffix) {
    tips.push(`모든 테이블 이름은 "${rules.tableSuffix}" 접미사로 끝나야 합니다.`);
  }
  
  if (rules.enforceCase) {
    const caseDescription = getCaseDescription(rules.enforceCase);
    tips.push(`테이블 이름은 ${caseDescription} 형식을 따라야 합니다.`);
  }
  
  tips.push('테이블 이름은 단수형을 사용하는 것이 좋습니다. (예: User, Order)');
  tips.push('의미가 명확하고 간결한 이름을 사용하세요.');
  
  return tips;
}

function generateColumnTips(rules: any): string[] {
  const tips: string[] = [];
  
  if (rules.enforceCase) {
    const caseDescription = getCaseDescription(rules.enforceCase);
    tips.push(`컬럼 이름은 ${caseDescription} 형식을 따라야 합니다.`);
  }
  
  tips.push('기본키는 보통 "id" 또는 "테이블명_id" 형식을 사용합니다.');
  tips.push('외래키는 "참조테이블명_id" 형식을 사용하는 것이 좋습니다.');
  tips.push('불린 타입 컬럼은 "is_", "has_", "can_" 등의 접두사를 사용하세요.');
  tips.push('날짜/시간 컬럼은 "created_at", "updated_at" 등의 명확한 이름을 사용하세요.');
  
  return tips;
}

function generateIndexTips(rules: any): string[] {
  const tips: string[] = [];
  
  if (rules.indexPattern?.includes('IX_')) {
    tips.push('인덱스 이름은 "IX_테이블명_컬럼명" 형식을 따라야 합니다.');
  }
  
  tips.push('인덱스 이름에는 대상 테이블과 컬럼을 명시하세요.');
  tips.push('복합 인덱스의 경우 주요 컬럼부터 순서대로 나열하세요.');
  tips.push('유니크 인덱스는 "UQ_" 접두사를 사용하는 것을 고려하세요.');
  
  return tips;
}

function getCaseDescription(caseType: string): string {
  switch (caseType) {
    case 'UPPER':
      return '대문자';
    case 'LOWER':
      return '소문자';
    case 'PASCAL':
      return 'PascalCase';
    case 'SNAKE':
      return 'snake_case';
    default:
      return '';
  }
}

export default ValidationGuide;