import { useState } from 'react';

import './Binder.css';

export default function Binder(): React.ReactElement {
  const [ open, setOpen ] = useState<boolean>(false);
  const [ pages, setPages ] = useState<string[]>(['1','2','3']);
  const [ animating, setAnimating ] = useState<boolean>(false);

  function handleClick(): void {
    if (animating) return;
    setAnimating(true);
    setOpen(!open);
  };

  function handleTransitionEnd(): void {
    setAnimating(false);
  };

  return (
    <div
      className="binder"
      onClick={handleClick}
      onTransitionEnd={handleTransitionEnd}
    >
      <Shadow open={open} animating={animating} />
      <FoldContainer open={open}>
        <FoldContainer open={open}>
          <FrontCover />
        </FoldContainer>
        <Spine />
        <PageStack>
          {pages.map((content, i) => (
            <PageWrapper
              key={`page-${i}`}
              position={pages.length - i}
            >
              <BinderPage
                key={`page-${i+1}`}
                id={`page-${i+1}`}
                content={content}
                savePage={(content: string) => {
                  const newPages = [...pages];
                  newPages[i] = content;
                  setPages(newPages);
                }}
              />
            </PageWrapper>
          ))}
        </PageStack>
      </FoldContainer>
      <BackPage />
    </div>
  );
};

function Shadow({ open, animating }: { open: boolean, animating: boolean }): React.ReactElement {
  return (
    <div className={`shadow ${open ? 'open' : 'closed'} ${animating && 'animating'}`} />
  );
};

function FoldContainer({ children, open }: { children: React.ReactNode, open: boolean }): React.ReactElement {
  return (
    <div className={`fold-container ${open ? 'open' : 'closed'}`}>
      {children}
    </div>
  );
};

function FrontCover(): React.ReactElement {
  return (
    <div className="cover front-cover" />
  );
};

function Spine(): React.ReactElement {
  return (
    <div className="cover spine" />
  );
};

function PageStack({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="page-stack">
      {children}
    </div>
  );
};

function PageWrapper({ children, position }: { children: React.ReactNode, position: number }): React.ReactElement {
  return (
    <div className="page-wrapper" style={{ transform: `translateZ(${position*2}mm)` }}>
      {children}
    </div>
  );
};

function BinderPage({ id, content, savePage }: { id: string, content: string, savePage: (content: string) => void }): React.ReactElement {
  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>): void {
    savePage(event.target.value);
  };

  return (
    <div className="binder-page">
      <article className="page-side front">
        <textarea
          id={id}
          className="pen"
          value={content}
          onChange={handleChange}
          autoCorrect="off"
          spellCheck="false"
        />
      </article>
      <div className="page-side back">
        <textarea disabled />
      </div>
    </div>
  );
}

function BackPage(): React.ReactElement {
  return (
    <div className="cover back-cover" />
  );
};
