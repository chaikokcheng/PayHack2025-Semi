'use client';

import React from 'react';
import { useDrag } from 'react-dnd';
import { Colors } from '../constants/colors';
import type { ElementType } from './ElementRenderer';

const ELEMENTS: { type: ElementType; label: string }[] = [
  { type: 'product-card', label: 'Product Card' },
  { type: 'text-block', label: 'Text Block' },
  { type: 'banner-image', label: 'Banner Image' },
  { type: 'button', label: 'Button' },
];

export const LeftPanel: React.FC = () => {
  return (
    <aside className="h-full p-4 bg-white border-r flex flex-col" style={{ borderColor: Colors.border, width: '100%' }}>
      <h2 className="text-lg font-semibold mb-4" style={{ color: Colors.text }}>Elements</h2>
      <div className="flex flex-col gap-3">
        {ELEMENTS.map((el) => (
          <DraggableElement key={el.type} type={el.type} label={el.label} />
        ))}
      </div>
    </aside>
  );
};

const DraggableElement: React.FC<{ type: ElementType; label: string }> = ({ type, label }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`cursor-move px-4 py-2 rounded border shadow-sm bg-gray-50 font-medium transition-opacity ${isDragging ? 'opacity-50' : ''}`}
      style={{ borderColor: Colors.border, color: Colors.text }}
    >
      {label}
    </div>
  );
}; 