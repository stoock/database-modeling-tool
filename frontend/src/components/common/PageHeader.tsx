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
  backText = '뒤로',
  actions
}) => {
  return (
    <div className="bg-white shadow">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {backLink && (
            <div className="mb-4">
              <Link
                to={backLink}
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                {backText}
              </Link>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="mt-1 text-sm text-gray-600">{description}</p>
              )}
            </div>
            
            {actions && (
              <div className="flex items-center space-x-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;