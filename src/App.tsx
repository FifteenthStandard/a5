import Binder from './components/Binder';
import { BinderViewProvider } from './contexts/BinderViewContext';
import './App.css'

export default function App(): React.ReactElement {
  return (
    <BinderViewProvider>
      <main className="app">
        <Binder />
      </main>
    </BinderViewProvider>
  );
};
