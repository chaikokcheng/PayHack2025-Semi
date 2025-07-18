'use client';

import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { Colors } from '../constants/colors';
import { ElementRenderer, ElementType } from './ElementRenderer';

interface DroppedElement {
  id: string;
  type: ElementType;
}

export const CenterPanel: React.FC = () => {
  const [elements, setElements] = useState<DroppedElement[]>([]);
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'ELEMENT',
    drop: (item: { type: ElementType }) => {
      setElements((prev) => [
        ...prev,
        { id: `${item.type}-${Date.now()}-${Math.random()}`, type: item.type },
      ]);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  const handleReset = () => setElements([]);

  return (
    <main className="flex flex-col items-center justify-center h-full py-8" style={{ width: '100%' }}>
      <div className="mb-4 w-full flex justify-end">
        <button
          className="px-3 py-1 rounded bg-gray-200 text-sm font-medium hover:bg-gray-300 transition"
          onClick={handleReset}
        >
          Reset
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
          {elements.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400 text-base select-none">
              Drag elements here
            </div>
          ) : (
            elements.map((el) => <ElementRenderer key={el.id} type={el.type} id={el.id} />)
          )}
        </div>
      </div>
    </main>
  );
}; 