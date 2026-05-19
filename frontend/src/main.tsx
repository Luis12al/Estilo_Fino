import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRouter } from './router';
import { useAuthInit } from '@hooks/useAuthInit';
import './index.css';

// Componente wrapper para inicializar auth
const App = () => {
  useAuthInit(); // ← Inicializa auth al arrancar
  return <AppRouter />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);