'use client';

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { LeftPanel } from '../components/LeftPanel';
import { CenterPanel } from '../components/CenterPanel';
import { RightPanel } from '../components/RightPanel';
import { Colors } from '../constants/colors';

export default function Home() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className="h-screen w-full flex flex-col md:flex-row"
        style={{ background: Colors.background, fontFamily: 'Roboto, Arial, sans-serif' }}
      >
        {/* Left Panel */}
        <div className="w-full md:w-1/4 max-w-xs flex-shrink-0 border-r h-full" style={{ borderColor: Colors.border }}>
          <LeftPanel />
        </div>
        {/* Center Panel */}
        <div className="flex-1 flex justify-center items-center bg-gray-50 min-w-0 h-full">
          <CenterPanel />
        </div>
        {/* Right Panel */}
        <div className="w-full md:w-1/4 max-w-xs flex-shrink-0 border-l h-full" style={{ borderColor: Colors.border }}>
          <RightPanel />
        </div>
      </div>
    </DndProvider>
  );
}
