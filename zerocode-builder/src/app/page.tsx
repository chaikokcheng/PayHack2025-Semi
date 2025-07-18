'use client';

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { LeftPanel } from '../components/LeftPanel';
import { CenterPanel, CenterPanelHandle } from '../components/CenterPanel';
import { RightPanel } from '../components/RightPanel';
import { Colors } from '../constants/colors';

export default function Home() {
  const centerPanelRef = React.useRef<CenterPanelHandle>(null);

  const handleDeploy = (initials?: { TextHeader?: string; TextDescription?: string; ImageBanner?: string }) => {
    centerPanelRef.current?.handleDeploy(initials);
  };

  const handleAddElement = (type: string, initialValue?: string) => {
    // Add a new element to the CenterPanel
    if (centerPanelRef.current && typeof centerPanelRef.current.addElement === 'function') {
      centerPanelRef.current.addElement(type, initialValue);
    }
  };

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
          <CenterPanel ref={centerPanelRef} />
        </div>
        {/* Right Panel */}
        <div className="w-full md:w-1/4 max-w-xs flex-shrink-0 border-l h-full" style={{ borderColor: Colors.border }}>
          <RightPanel onDeploy={handleDeploy} onAddElement={handleAddElement} />
        </div>
      </div>
    </DndProvider>
  );
}
