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
        key={`note-${i+1}`}
        id={`note-${i+1}`}
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

  function handleClick(): void {
    document.getElementById(`note-${index}`)?.focus();
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
      onClick={handleClick}
      {...useSwipe(handleSwipe)}
    >
    {
      pages.map((page, i) => (
        <PageWrapper
          key={`page-${i}`}
          position={(index - 1 - i + 12) % 12}
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
  const [ translateZ, setTranslateZ ] = useState<{}>({ transform: `translateZ(${position*2}mm)` });
  const [ rotateX, setRotateX ] = useState<{}>({ transform: `rotateX(0deg)` });

  useEffect(() => {
    if (position === previousPosition) return;
    let newRotateX;
    if (position === 0 && previousPosition !== 1) {
      newRotateX = {
        transform: `rotateX(360deg)`,
        transformOrigin: '0 -2.5mm',
        transition: 'transform 0.5s ease-in-out 0s',
      };
    } else if (previousPosition === 0 && position !== 1) {
      newRotateX = {
        transform: `rotateX(-360deg)`,
        transformOrigin: '0 -2.5mm',
        transition: 'transform 0.5s ease-in-out 0s',
      };
    } else {
      newRotateX = { transform: `rotateX(0deg)` };
    }
    setTimeout(() => {
      setTranslateZ({
        transform: `translateZ(${position*2}mm)`,
        transformOrigin: '0 -2.5mm',
        transition: 'transform 0.25s ease-in-out 0.125s',
      });
      setRotateX(newRotateX);
    }, 0);
    setPreviousPosition(position);
  }, [ position ]);

  function handleTransitionEnd(): void {
    setTranslateZ({ transform: `translateZ(${position*2}mm)` });
    setRotateX({ transform: `rotateX(0deg)` });
  };

  return (
    <div
      className="page-wrapper"
      style={translateZ}
    >
      <div
        className="page-wrapper"
        style={rotateX}
        onTransitionEnd={handleTransitionEnd}
      >
        {children}
      </div>
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

function NotePage({ id, note, saveNote }: { id: string, note: string, saveNote: (note: string) => void }): React.ReactElement {
  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>): void {
    saveNote(event.target.value);
  };

  return (
    <div className="page note-page">
      <article className="page-side front">
        <textarea
          id={id}
          className="pen"
          value={note}
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
};

function BackCover(): React.ReactElement {
  return (
    <div className="page back-cover">
      <div className="page-side front" />
      <div className="page-side back" />
    </div>
  );
};
