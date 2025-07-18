import React from 'react';
import { Colors } from '../constants/colors';

export type ElementType = 'product-card' | 'text-block' | 'banner-image' | 'button';

interface ElementRendererProps {
  type: ElementType;
  id?: string;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({ type }) => {
  switch (type) {
    case 'product-card':
      return (
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center mb-4 border" style={{ borderColor: Colors.border }}>
          <div className="w-20 h-20 bg-gray-200 rounded mb-2" />
          <div className="font-semibold text-base mb-1" style={{ color: Colors.text }}>Product Name</div>
          <div className="text-sm mb-2" style={{ color: Colors.textSecondary }}>$19.99</div>
          <button className="bg-pink-500 text-white px-3 py-1 rounded" style={{ background: Colors.primary }}>Buy</button>
        </div>
      );
    case 'text-block':
      return (
        <div className="bg-white rounded p-3 mb-4 border" style={{ borderColor: Colors.border }}>
          <p className="text-base" style={{ color: Colors.text }}>This is a text block. You can edit this text.</p>
        </div>
      );
    case 'banner-image':
      return (
        <div className="w-full h-24 bg-gradient-to-r from-pink-400 to-pink-200 rounded mb-4 flex items-center justify-center" style={{ background: `linear-gradient(90deg, ${Colors.gradientPink[0]}, ${Colors.gradientPink[1]})` }}>
          <span className="text-white font-bold text-lg">Banner Image</span>
        </div>
      );
    case 'button':
      return (
        <button className="w-full bg-pink-500 text-white py-2 rounded mb-4 font-medium shadow" style={{ background: Colors.primary }}>Button</button>
      );
    default:
      return null;
  }
}; 