'use client';

import React from 'react';
import Image from 'next/image';
import { useDrag } from 'react-dnd';
import { Colors } from '../constants/colors';
import type { ElementType } from './ElementRenderer';

const ELEMENTS: { type: ElementType; label: string; img: string }[] = [
  { type: 'text-input', label: 'Text Input', img: '/assets/text-input.png' },
  { type: 'grouped-menu', label: 'Grouped Menu', img: '/assets/group-menu.png' },
  { type: 'tabs', label: 'Tabs', img: '/assets/tabs.png' },
  { type: 'button', label: 'Button', img: '/assets/button.png' },
  { type: 'image-banner', label: 'Image Banner', img: '/assets/image-banner.png' },
  { type: 'dropdown', label: 'Dropdown', img: '/assets/dropdown.jpg' },
  { type: 'dashboard', label: 'Dashboard', img: '/assets/dashboard.png' },
  { type: 'text-header', label: 'Text Header', img: '/assets/text-header.png' },
  { type: 'file-upload', label: 'File Upload', img: '/assets/file-upload.png' },
  { type: 'divider', label: 'Divider', img: '/assets/divider.png' },
  { type: 'text-description', label: 'Text Description', img: '/assets/text-description.png' },
];

export const LeftPanel: React.FC = () => {
  return (
    <aside className="h-full overflow-y-auto p-4 bg-white border-r flex flex-col" style={{ borderColor: Colors.border, width: '100%' }}>
      {/* Header with logo and title */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <Image src="/assets/satupay_logo.png" alt="SatuPay Logo" width={36} height={36} className="rounded" />
        <span className="text-xl font-bold tracking-tight" style={{ color: Colors.primary }}>
          SatuPay Codeless Builder
        </span>
      </div>
      <h2 className="text-lg font-semibold mb-4" style={{ color: Colors.text }}>Elements</h2>
      <div className="grid grid-cols-2 gap-4">
        {ELEMENTS.map((el) => (
          <DraggableElement key={el.type} type={el.type} label={el.label} img={el.img} />
        ))}
      </div>
    </aside>
  );
};

const DraggableElement: React.FC<{ type: string; label: string; img: string }> = ({ type, label, img }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`flex flex-col items-center justify-center cursor-move p-3 rounded-lg border shadow-sm bg-gray-50 font-medium transition-opacity h-32 ${isDragging ? 'opacity-50' : ''}`}
      style={{ borderColor: Colors.border, color: Colors.text }}
    >
      <div className="w-12 h-12 bg-gray-200 rounded mb-2 flex items-center justify-center overflow-hidden">
        <Image src={img} alt={label} width={48} height={48} className="object-contain w-12 h-12" />
      </div>
      <span className="text-center text-sm font-semibold">{label}</span>
    </div>
  );
}; 