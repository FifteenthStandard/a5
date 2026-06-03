import { useMemo, useState } from 'react';
import InteractionZone from './InteractionZone';
import PageContainer, { type PageState } from './PageContainer';
import type { Page } from '../types';
import './Binder.css';
import LinedPage from './LinedPage';
import Divider from './Divider';

export default function Binder(): React.ReactElement {
  const [ coverOpen, setCoverOpen ] = useState<boolean>(false);
  const [ hoverCover, setHoverCover ] = useState<boolean>(false);
  const [ animating, setAnimating ] = useState<boolean>(false);
  const [ hoverLeft, setHoverLeft ] = useState<boolean>(false);
  const [ hoverRight, setHoverRight ] = useState<boolean>(false);

  const [ pages, setPages ] = useState([
    { id: 'page-01', type: 'lined', content: 'Page 1' },
    { id: 'page-02', type: 'lined', content: 'Page 2' },
    { id: 'page-03', type: 'lined', content: 'Page 3' },
    { id: 'page-04', type: 'lined', content: 'Page 4' },
    { id: 'divider-01', type: 'divider', content: '1:' },
    { id: 'page-05', type: 'lined', content: 'Page 5' },
    { id: 'page-06', type: 'lined', content: 'Page 6' },
    { id: 'page-07', type: 'lined', content: 'Page 7' },
    { id: 'page-08', type: 'lined', content: 'Page 8' },
    { id: 'page-09', type: 'lined', content: 'Page 9' },
    { id: 'divider-02', type: 'divider', content: '2:' },
    { id: 'page-10', type: 'lined', content: 'Page 10' },
    { id: 'page-11', type: 'lined', content: 'Page 11' },
    { id: 'page-12', type: 'lined', content: 'Page 12' },
    { id: 'page-13', type: 'lined', content: 'Page 13' },
    { id: 'page-14', type: 'lined', content: 'Page 14' },
    { id: 'page-15', type: 'lined', content: 'Page 15' },
    { id: 'page-16', type: 'lined', content: 'Page 16' },
    { id: 'divider-03', type: 'divider', content: '3:' },
    { id: 'page-17', type: 'lined', content: 'Page 17' },
    { id: 'page-18', type: 'lined', content: 'Page 18' },
    { id: 'page-19', type: 'lined', content: 'Page 19' },
    { id: 'page-20', type: 'lined', content: 'Page 20' },
    { id: 'page-21', type: 'lined', content: 'Page 21' },
    { id: 'page-22', type: 'lined', content: 'Page 22' },
    { id: 'divider-04', type: 'divider', content: '4:' },
    { id: 'page-23', type: 'lined', content: 'Page 23' },
    { id: 'page-24', type: 'lined', content: 'Page 24' },
    { id: 'page-25', type: 'lined', content: 'Page 25' },
    { id: 'page-26', type: 'lined', content: 'Page 26' },
    { id: 'page-27', type: 'lined', content: 'Page 27' },
    { id: 'page-28', type: 'lined', content: 'Page 28' },
    { id: 'divider-05', type: 'divider', content: '5:' },
    { id: 'page-29', type: 'lined', content: 'Page 29' },
    { id: 'page-30', type: 'lined', content: 'Page 30' },
  ] as Page[]);
  const [ index, setIndex ] = useState<number>(0);

  function jumpToPage(pageIndex: number): void {
    if (animating) return;
    setAnimating(true);

    let targetIndex = pageIndex < index
      ? pageIndex
      : pageIndex + 1;

    function flip(current: number): void {
      if (current === targetIndex) {
        return;
      }
      const next = current < targetIndex ? current + 1 : current - 1;
      setIndex(next);
      requestAnimationFrame(() => flip(next));
    };

    requestAnimationFrame(() => flip(index));
  };

  const pageStates = useMemo<PageState[]>(() => pages.map((page, i) => ({
    page,
    positionLeft: i + 1,
    positionRight: pages.length - i,
    state: (hoverLeft && i === index - 1) ? 'peek-left' : (hoverRight && i === index) ? 'peek-right' : i < index ? 'left' : 'right',
  })), [ pages, index, hoverLeft, hoverRight ]);

  function handleClickBinder(): void {
    if (animating) return;
    setAnimating(true);
    setIndex(0);
    setCoverOpen(!coverOpen);
    setHoverCover(false);
  };

  function handleClickLeft(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
    if (!coverOpen) return;
    event.stopPropagation();

    if (index === 0) {
      setCoverOpen(false);
      return;
    }

    setIndex(index - 1);
  };

  function handleClickRight(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void {
    if (!coverOpen) return;
    event.stopPropagation();

    if (index === pages.length) {
      return;
    }

    setIndex(index + 1);
  };

  function handleTransitionEnd(): void {
    setAnimating(false);
  };

  return (
    <div
      className="binder"
      onTransitionEnd={handleTransitionEnd}
    >
      {!coverOpen && <InteractionZone onClick={handleClickBinder} setHover={setHoverCover} height={2} />}
      <div
        style={{
          height: '100%',
          position: 'absolute',
          right: 0,
          width: coverOpen && !animating ? '341mm' : '100%',
        }}
      >
        <Shadow />
      </div>
      <BackCover />
      <FoldContainer open={coverOpen}>
        <Spine />
        <FoldContainer open={coverOpen} hover={hoverCover}>
          {coverOpen && index === 0 && <InteractionZone onClick={handleClickBinder} setHover={setHoverCover} />}
          <FrontCover>
            <PageStack right>
              <Shadow strength={index / 30} />
              {coverOpen && index > 0 && <InteractionZone onClick={handleClickLeft} setHover={setHoverLeft} />}
            </PageStack>
          </FrontCover>
        </FoldContainer>
        <PageStack left>
          <Shadow strength={(pages.length - index) / 30} />
          {pageStates.map((state, i) => (
            <Page
              key={`page-${state.page.id}`}
              state={state}
              savePage={(content: string) => {
                const newPages = [ ...pages ];
                newPages[i] = { ...state.page, content };
                setPages(newPages);
              }}
              jumpToPage={() => jumpToPage(i)}
            />
          ))}
          {coverOpen && <InteractionZone right="25%" onClick={handleClickRight} setHover={setHoverRight} />}
        </PageStack>
      </FoldContainer>
    </div>
  );
};

function Shadow({ strength }: { strength?: number }): React.ReactElement {
  return (
    <div
      style={{
        boxShadow: `0mm 2.5mm 5mm rgba(0, 0, 0, ${strength ?? 0.75})`,
        height: '100%',
        position: 'absolute',
        width: '100%',
      }}
    />
  );
};

function FoldContainer({ children, open, hover }: { children: React.ReactNode, open: boolean, hover?: boolean }): React.ReactElement {
  const rotateY = open && !hover ? '0deg' : open && hover ? '5deg' : !open && hover ? '80deg' : '92deg';
  return (
    <div
      className={`fold-container ${open ? 'open' : 'closed'} ${hover ? 'hover' : ''}`}
      style={{
        display: 'flex',
        height: '100%',
        position: 'absolute',
        right: '100%',
        top: 0,
        transform: `rotateY(${rotateY})`,
        transformOrigin: 'right',
        transformStyle: 'preserve-3d',
        transition: 'transform 1s ease-in-out',
        width: 'fit-content',
      }}
    >
      {children}
    </div>
  );
};

function FrontCover({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="cover front-cover">
      {children}
    </div>
  );
};

function Spine(): React.ReactElement {
  return (
    <div className="cover spine" />
  );
};

function PageStack({ children, left, right }: { children?: React.ReactNode, left?: boolean, right?: boolean }): React.ReactElement {
  return (
    <div className={`page-stack ${left ? 'left' : ''} ${right ? 'right' : ''}`}>
      {children}
    </div>
  );
};

function Page({ state, jumpToPage, savePage }: { state: PageState, jumpToPage: () => void, savePage: (content: string) => void }): React.ReactElement {
  let page;
  switch (state.page.type) {
    case 'lined':
      page = (
        <LinedPage
          key={`page-${state.page.id}`}
          page={state.page}
          savePage={savePage}
        />
      );
      break;

    case 'divider':
      const [ position, label ] = state.page.content.split(':');
      page = (
        <Divider
          position={parseInt(position, 10)}
          label={label}
          jumpToPage={jumpToPage}
          savePage={savePage}
        />
      );
      break;
    
    default:
      page = null;
  }

  return (
    <PageContainer
      key={`page-${state.page.id}`}
      state={state}
    >
      {page}
    </PageContainer>
  );
};

function BackCover(): React.ReactElement {
  return (
    <div className="cover back-cover" />
  );
};
