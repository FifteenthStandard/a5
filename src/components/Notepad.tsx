import React, { useState, useEffect } from 'react';
import { useSwipe, type SwipeDirection } from './useSwipe';
import './Notepad.css';

export default function Notepad(): React.ReactElement {
  const [ notes, setNotes ] = useState<string[]>([]);
  const [ index, setIndex ] = useState<number>(0);
  const [ animating, setAnimating ] = useState<boolean>(false);

  useEffect(() => {
    const storedNotes = localStorage.getItem('a5:notes');
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    } else {
      setNotes([ '', '', '', '', '', '', '', '', '', '' ]);
    }
  }, []);

  useEffect(() => {
    if (notes.length === 0) return;
    localStorage.setItem('a5:notes', JSON.stringify(notes));
  }, [ notes ]);

  useEffect(() => {
    if (animating) setTimeout(() => setAnimating(false), 500);
  }, [ animating ]);

  const pages = [
    <FrontCover key="front-cover" />,
    ...notes.map((note, i) => (
      <NotePage
        key={`note-${i}`}
        note={note}
        saveNote={(note: string) => {
          const newNotes = [...notes];
          newNotes[i] = note;
          setNotes(newNotes);
        }}
      />
    )),
    <BackCover key="back-cover" />
  ];

  function flipToPage(pageIndex: number): void {
    if (animating) return;
    window.getSelection()?.removeAllRanges();
    window.navigator.vibrate(10);
    setAnimating(true);
    setIndex(pageIndex);
  }

  function nextPage(): void {
    flipToPage((index + 1) % pages.length);
  };

  function previousPage(): void {
    flipToPage((index - 1 + pages.length) % pages.length);
  };

  function handleSwipe(direction: SwipeDirection): void {
    switch (direction) {
      case 'up':
        nextPage();
        break;
      case 'down':
        previousPage();
        break;
      default:
        break;
    }
  };

  return (
    <div
      className="notepad"
      {...useSwipe(handleSwipe)}
    >
    {
      pages.map((page, i) => (
        <PageWrapper
          key={`page-${i}`}
          position={(index - i + 12 - 1) % 12}
        >
          {page}
        </PageWrapper>
      ))
    }
    </div>
  );
};

function PageWrapper({ children, position }: { children: React.ReactNode, position: number }): React.ReactElement {
  const [ previousPosition, setPreviousPosition ] = useState<number>(position);
  const [ style, setStyle ] = useState<{}>({ transform: `translateZ(${position}mm) rotateX(0deg)` });

  useEffect(() => {
    if (position === previousPosition) return;
    if (position === 0 && previousPosition !== 1) {
      setTimeout(() => {
        setStyle({
          transform: `translateZ(${position}mm) rotateX(360deg)`,
          transformOrigin: '0 -2.5mm',
          transition: 'transform 0.5s ease-in-out 0s',
        });
      }, 0);
    } else if (previousPosition === 0 && position !== 1) {
      setTimeout(() => {
        setStyle({
          transform: `translateZ(${position}mm) rotateX(-360deg)`,
          transformOrigin: '0 -2.5mm',
          transition: 'transform 0.5s ease-in-out 0s',
        });
      }, 0);
    } else {
      setTimeout(() => {
        setStyle({ transform: `translateZ(${position}mm) rotateX(0deg)` });
      }, 450);
    }
    setPreviousPosition(position);
  }, [ position ]);

  function handleTransitionEnd(): void {
    setStyle({ transform: `translateZ(${position}mm) rotateX(0deg)` });
  };

  return (
    <div
      className="page-wrapper"
      style={style}
      onTransitionEnd={handleTransitionEnd}
    >
      {children}
    </div>
  );
};

function FrontCover(): React.ReactElement {
  return (
    <div className="page front-cover">
      <div className="page-side front" />
      <div className="page-side back" />
    </div>
  );
};

function NotePage({ note, saveNote }: { note: string, saveNote: (note: string) => void }): React.ReactElement {
  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>): void {
    saveNote(event.target.value);
  };

  return (
    <div className="page note-page">
      <article className="page-side front">
        <section>
          <textarea
            className="pen"
            value={note}
            onChange={handleChange}
          />
        </section>
      </article>
      <div className="page-side back">
        <section />
      </div>
    </div>
  );
};

function BackCover(): React.ReactElement {
  return (
    <div className="page back-cover">
      <div className="page-side front" />
      <div className="page-side back" />
    </div>
  );
};
