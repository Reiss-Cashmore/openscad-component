// Portions of this file are Copyright 2021 Google LLC, and licensed under GPL2+. See COPYING.

import React, { CSSProperties, useEffect, useState } from 'react';
import {MultiLayoutComponentId, State, StatePersister} from '../state/app-state'
import { Model } from '../state/model';
import EditorPanel from './EditorPanel';
import ViewerPanel from './ViewerPanel';
import Footer from './Footer';
import { ModelContext, FSContext } from './contexts';
import PanelSwitcher from './PanelSwitcher';
import { ConfirmDialog } from 'primereact/confirmdialog';
import CustomizerPanel from './CustomizerPanel';


export function App({initialState, statePersister, fs}: {initialState: State, statePersister: StatePersister, fs: FS}) {
  const [state, setState] = useState(initialState);
  
  const model = new Model(fs, state, setState, statePersister);
  useEffect(() => model.init());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F5') {
        event.preventDefault();
        model.render({isPreview: true, now: true})
      } else if (event.key === 'F6') {
        event.preventDefault();
        model.render({isPreview: false, now: true})
      } else if (event.key === 'F7') {
        event.preventDefault();
        model.export();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const layout = state.view.layout;
  const isMultiLayout = layout.mode === 'multi';
  const isCustomizerOpen = isMultiLayout ? layout.customizer : false;
  
  // Calculate panel widths based on layout
  const getPanelFlex = (panelId: MultiLayoutComponentId): number => {
    if (!isMultiLayout) return 1;
    
    const visiblePanels = [
      layout.editor ? 'editor' : null,
      layout.viewer ? 'viewer' : null, 
      layout.customizer ? 'customizer' : null
    ].filter(Boolean).length;
    
    return visiblePanels > 0 ? 1 : 0;
  };
  
  const getPanelDisplay = (panelId: MultiLayoutComponentId): string => {
    if (!isMultiLayout) return 'flex';
    return (state.view.layout as any)[panelId] ? 'flex' : 'none';
  };

  return (
    <ModelContext.Provider value={model}>
      <FSContext.Provider value={fs}>
        <div className="app-container" style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '100vw',
          overflow: 'hidden'
        }}>
          
          <PanelSwitcher />
    
          <div className="main-content" style={{
            display: 'flex',
            flexDirection: 'row',
            flex: 1,
            minHeight: 0, // Important for proper flex shrinking
          }}>

            <EditorPanel 
              className="editor-panel"
              style={{
                flex: getPanelFlex('editor'),
                display: getPanelDisplay('editor'),
                minWidth: 0, // Important for proper flex shrinking
                borderRight: isMultiLayout ? '1px solid var(--surface-border)' : 'none'
              }} 
            />
            
            <ViewerPanel 
              className="viewer-panel"
              style={{
                flex: getPanelFlex('viewer'),
                display: getPanelDisplay('viewer'),
                minWidth: 0, // Important for proper flex shrinking
                borderRight: isMultiLayout && isCustomizerOpen ? '1px solid var(--surface-border)' : 'none'
              }} 
            />
            
            <CustomizerPanel 
              className="customizer-panel"
              style={{
                flex: getPanelFlex('customizer'),
                display: getPanelDisplay('customizer'),
                minWidth: 0, // Important for proper flex shrinking
                maxHeight: '100%'
              }} 
            />
          </div>

          <Footer />
          <ConfirmDialog />
        </div>
      </FSContext.Provider>
    </ModelContext.Provider>
  );
}
