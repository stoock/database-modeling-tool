import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface PageHeaderProps {
  title: string;
  description?: string;
  backLink?: string;
  backText?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  backLink,
  backText = '돌아가기',
  actions
}) => {
  return (
    <div className="border-b border-gray-200 pb-5">
      {backLink && (
        <Link
          to={backLink}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          {backText}
        </Link>
      )}
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-2 text-sm text-gray-500">{description}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex space-x-3">{actions}</div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;