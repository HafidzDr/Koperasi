import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { ToastContainer } from '../components/ui/ToastContainer';

export const App: React.FC = () => {
  return (
    <React.StrictMode>
      <RouterProvider router={router} />
      <ToastContainer />
    </React.StrictMode>
  );
};
