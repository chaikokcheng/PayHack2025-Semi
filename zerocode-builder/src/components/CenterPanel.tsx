'use client';

import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { useDrop, useDrag, DropTargetMonitor } from 'react-dnd';
import { Colors } from '../constants/colors';
import { ElementRenderer, ElementType } from './ElementRenderer';

interface DroppedElement {
  id: string;
  type: ElementType;
  initialValue?: string;
  initialImage?: string;
}

interface DraggableItem {
  id: string;
  index: number;
  type: 'ELEMENT';
}

export interface CenterPanelHandle {
  handleDeploy: () => void;
  addElement: (type: string) => void;
}

export const CenterPanel = forwardRef<CenterPanelHandle>((props, ref) => {
  const [elements, setElements] = useState<DroppedElement[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'ELEMENT',
    drop: (item: any) => {
      // Only add if it's a new element (from the left panel)
      if (!('id' in item)) {
        setElements((prev) => [
          ...prev,
          { id: `${item.type}-${Date.now()}-${Math.random()}`, type: item.type },
        ]);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const handleReset = () => setElements([]);
  const handleRemove = (id: string) => setElements((prev) => prev.filter((el) => el.id !== id));

  // Deploy handler: set predefined template
  const handleDeploy = () => {
    setLoading(true);
    setLoadingText('Creating wonder in 3...');
    setElements([]);
    let count = 3;
    countdownRef.current && clearTimeout(countdownRef.current);
    const tick = () => {
      if (count > 1) {
        count--;
        setLoadingText(`Creating wonder in ${count}...`);
        countdownRef.current = setTimeout(tick, 1000);
      } else {
        setLoading(false);
        setLoadingText('');
        setElements([
          { id: `text-header-${Date.now()}-1`, type: 'text-header', initialValue: "Nek Minah’s Heritage Kitchen" },
          { id: `text-description-${Date.now()}-2`, type: 'text-description', initialValue: "Nek Minah is a home-based cook selling traditional Malay dishes like kuih, sambal, and rendang. With love passed down through generations, she brings heritage flavors to your table — now easier to order online." },
          { id: `image-banner-${Date.now()}-3`, type: 'image-banner', initialImage: '/assets/nekminahkitchen.png' },
          { id: `divider-${Date.now()}-4`, type: 'divider' },
          { id: `tabs-${Date.now()}-5`, type: 'tabs' },
          { id: `grouped-menu-${Date.now()}-6`, type: 'grouped-menu' },
          { id: `button-${Date.now()}-7`, type: 'button' },
        ]);
      }
    };
    countdownRef.current = setTimeout(tick, 1000);
  };

  // Add element handler
  const addElement = (type: string) => {
    setElements((prev) => [
      ...prev,
      { id: `${type}-${Date.now()}-${Math.random()}`, type: type as ElementType },
    ]);
  };

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, []);

  useImperativeHandle(ref, () => ({ handleDeploy, addElement }), [handleDeploy]);

  // Move element in array
  const moveElement = (from: number, to: number) => {
    setElements((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(from, 1);
      updated.splice(to, 0, removed);
      return updated;
    });
  };

  return (
    <main className="flex flex-col items-center justify-center h-full py-8" style={{ width: '100%' }}>
      <div className="mb-4 w-full flex justify-end pr-8 gap-2">
        <button
          className="px-3 py-1 rounded text-sm font-medium transition bg-gray-200 text-gray-800 hover:bg-gray-300"
          onClick={handleReset}
          disabled={loading}
        >
          Reset
        </button>
        <button
          className="px-3 py-1 rounded text-sm font-medium transition text-white"
          style={{ background: Colors.primary }}
          onClick={handleDeploy}
          disabled={loading}
        >
          Deploy
        </button>
      </div>
      <div
        ref={drop as unknown as React.Ref<HTMLDivElement>}
        className={`relative mx-auto rounded-2xl shadow-lg border flex flex-col items-center p-4 transition-all duration-200 ${
          isOver && canDrop ? 'ring-4 ring-pink-300' : ''
        }`}
        style={{
          width: 320,
          height: 600,
          background: Colors.background,
          borderColor: Colors.border,
        }}
      >
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-gray-300 rounded-full" />
        <div className="w-full h-full overflow-y-auto pt-8 pb-2 px-1">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-pink-500 text-lg font-semibold select-none">
              <svg className="animate-spin h-8 w-8 mb-4 text-pink-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
              {loadingText}
            </div>
          ) : elements.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-base select-none">
              Drag elements here
            </div>
          ) : (
            elements.map((el, idx) => (
              <SortableElement
                key={el.id}
                id={el.id}
                index={idx}
                moveElement={moveElement}
                handleRemove={handleRemove}
              >
                <ElementRenderer
                  type={el.type}
                  id={el.id}
                  initialValue={(el as any).initialValue}
                  initialImage={(el as any).initialImage}
                />
              </SortableElement>
            ))
          )}
        </div>
      </div>
    </main>
  );
});

interface SortableElementProps {
  id: string;
  index: number;
  moveElement: (from: number, to: number) => void;
  handleRemove: (id: string) => void;
  children: React.ReactNode;
}

const SortableElement: React.FC<SortableElementProps> = ({ id, index, moveElement, handleRemove, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId, isDragging }, drag, preview] = useDrag({
    type: 'ELEMENT',
    item: { id, index, type: 'ELEMENT' },
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'ELEMENT',
    hover(item: unknown, monitor: DropTargetMonitor) {
      const dragItem = item as DraggableItem;
      if (!ref.current) return;
      const dragIndex = dragItem.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the item's height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      moveElement(dragIndex, hoverIndex);
      dragItem.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      data-handler-id={handlerId}
      className={`relative group transition-opacity ${isDragging ? 'opacity-40' : ''}`}
      style={{ cursor: 'move' }}
    >
      <button
        className="absolute top-1 right-1 z-10 bg-black bg-opacity-30 hover:bg-opacity-30 text-white rounded-full w-4 h-4 flex items-center justify-center transition-opacity opacity-20 group-hover:opacity-50"
        style={{ fontSize: 12 }}
        onClick={() => handleRemove(id)}
        tabIndex={0}
        aria-label="Remove element"
      >
        &times;
      </button>
      {children}
    </div>
  );
}; 