import './Mat.css';

export default function Mat({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="mat">
      {children}
    </div>
  );
};
