import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import SchemaExportPage from './pages/SchemaExportPage';

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
]);

export default router;