import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import SchemaExportPage from './pages/SchemaExportPage';
import SimpleDashboard from './pages/SimpleDashboard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/projects/:projectId',
    element: <App />,
  },
  {
    path: '/projects/:projectId/export',
    element: <SchemaExportPage />,
  },
  {
    path: '/simple',
    element: <SimpleDashboard />,
  },
]);

export default router;