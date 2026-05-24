import { useScreenSize } from './useScreenSize';
import { DesktopLayout, MobileLayout } from './components';
import './App.css';

export default function App(): React.ReactElement {
  const screenSize = useScreenSize();

  return (
    <main className="app" style={{ zoom: screenSize.zoom }}>
      {screenSize.type === 'desktop' ? <DesktopLayout /> : <MobileLayout />}
    </main>
  );
};
