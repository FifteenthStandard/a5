import './services/SyncService';

import Desk from './components/Desk';
import { BinderViewProvider } from './contexts/BinderViewContext';
import './App.css'

export default function App(): React.ReactElement {
  return (
    <BinderViewProvider>
      <main className="app">
        <Desk />
      </main>
    </BinderViewProvider>
  );
};
