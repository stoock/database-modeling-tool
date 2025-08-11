import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { 
  Cog6ToothIcon, 
  DocumentTextIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useProjectStore } from '../../stores/projectStore';
import NamingRulesPanel from '../ValidationPanel/NamingRules';
import Button from '../common/Button';

interface ProjectSettingsProps {
  projectId: string;
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({
  projectId
}) => {
  const { currentProject, updateProject } = useProjectStore();
  
  const [name, setName] = useState(currentProject?.name || '');
  const [description, setDescription] = useState(currentProject?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // 기본 정보 저장 처리
  const handleSaveBasicInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('프로젝트 이름은 필수입니다.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await updateProject(projectId, {
        name,
        description: description || undefined
      });
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('프로젝트 설정 저장 오류:', err);
      setError('프로젝트 정보 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 탭 클래스 설정
  const getTabClasses = (selected: boolean) => {
    return `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
      selected
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
    }`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow">
      <Tab.Group>
        <div className="border-b border-gray-200">
          <Tab.List className="flex p-4 space-x-4">
            <Tab className={({ selected }) => getTabClasses(selected)}>
              <Cog6ToothIcon className="h-5 w-5 mr-2" />
              기본 설정
            </Tab>
            <Tab className={({ selected }) => getTabClasses(selected)}>
              <TagIcon className="h-5 w-5 mr-2" />
              네이밍 규칙
            </Tab>
            <Tab className={({ selected }) => getTabClasses(selected)}>
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              문서화 설정
            </Tab>
          </Tab.List>
        </div>
        
        <Tab.Panels className="p-6">
          {/* 기본 설정 탭 */}
          <Tab.Panel>
            <h2 className="text-lg font-medium text-gray-900 mb-4">프로젝트 기본 정보</h2>
            
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            
            {saveSuccess && (
              <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
                프로젝트 정보가 성공적으로 저장되었습니다.
              </div>
            )}
            
            <form onSubmit={handleSaveBasicInfo} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  프로젝트 이름 <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  프로젝트 설명
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="primary"
                  loading={isSubmitting}
                >
                  변경사항 저장
                </Button>
              </div>
            </form>
          </Tab.Panel>
          
          {/* 네이밍 규칙 탭 */}
          <Tab.Panel>
            <NamingRulesPanel projectId={projectId} />
          </Tab.Panel>
          
          {/* 문서화 설정 탭 */}
          <Tab.Panel>
            <h2 className="text-lg font-medium text-gray-900 mb-4">문서화 설정</h2>
            <p className="text-gray-500">
              이 기능은 아직 개발 중입니다. 추후 업데이트를 통해 제공될 예정입니다.
            </p>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default ProjectSettings;