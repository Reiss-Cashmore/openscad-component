// Portions of this file are Copyright 2021 Google LLC, and licensed under GPL2+. See COPYING.

import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import {MultiLayoutComponentId, State, StatePersister} from '../state/app-state'
import { Model, buildCustomizerValues } from '../state/model';
import EditorPanel from './EditorPanel';
import ViewerPanel from './ViewerPanel';
import Footer from './Footer';
import { ModelContext, FSContext } from './contexts';
import PanelSwitcher from './PanelSwitcher';
import CustomizerPanel from './CustomizerPanel';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { theme } from '../theme';
import { CustomizerValues, CustomizerValuesInput, Parameter } from '../state/customizer-types';

interface AppProps {
  initialState: State;
  statePersister: StatePersister;
  fs: FS;
  customizerValues?: CustomizerValuesInput;
  onCustomizerValuesChange?: (values: CustomizerValues) => void;
  onParametersChange?: (parameters: Parameter[]) => void;
}

export function App({
  initialState,
  statePersister,
  fs,
  customizerValues,
  onCustomizerValuesChange,
  onParametersChange,
}: AppProps) {
  const [state, setState] = useState(initialState);
  const externalValuesSignatureRef = useRef<string>('');
  const lastCustomizerValuesSignatureRef = useRef<string>('');
  const lastParametersRef = useRef<Parameter[] | null>(null);
  
  const model = new Model(fs, state, setState, statePersister);
  useEffect(() => model.init(), [model]);

  useEffect(() => {
    if (!customizerValues || Object.keys(customizerValues).length === 0) {
      externalValuesSignatureRef.current = '';
      return;
    }
    const signature = serializeSimpleMap(customizerValues);
    if (signature === externalValuesSignatureRef.current) {
      return;
    }
    externalValuesSignatureRef.current = signature;
    model.setVars(customizerValues);
  }, [customizerValues, model]);

  useEffect(() => {
    if (!onCustomizerValuesChange || !state.parameterSet) {
      if (!state.parameterSet) {
        lastCustomizerValuesSignatureRef.current = '';
      }
      return;
    }

    const values = buildCustomizerValues(state.parameterSet, state.params.vars);
    const signature = serializeCustomizerValues(values);
    if (signature === lastCustomizerValuesSignatureRef.current) {
      return;
    }
    lastCustomizerValuesSignatureRef.current = signature;
    onCustomizerValuesChange(values);
  }, [state.parameterSet, state.params.vars, onCustomizerValuesChange]);

  useEffect(() => {
    if (!onParametersChange) {
      return;
    }
    const parameters = state.parameterSet?.parameters;
    if (!parameters) {
      lastParametersRef.current = null;
      return;
    }
    if (lastParametersRef.current === parameters) {
      return;
    }
    lastParametersRef.current = parameters;
    onParametersChange(parameters);
  }, [state.parameterSet, onParametersChange]);

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ModelContext.Provider value={model}>
        <FSContext.Provider value={fs}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden'
          }}>
            
            <PanelSwitcher />
      
            <Box sx={{
              display: 'flex',
              flexDirection: 'row',
              flex: 1,
              minHeight: 0,
            }}>

              <EditorPanel 
                className="editor-panel"
                style={{
                  flex: getPanelFlex('editor'),
                  display: getPanelDisplay('editor'),
                  minWidth: 0,
                }}
              />
              
              <ViewerPanel 
                className="viewer-panel"
                style={{
                  flex: getPanelFlex('viewer'),
                  display: getPanelDisplay('viewer'),
                  minWidth: 0,
                }}
              />
              
              <CustomizerPanel 
                className="customizer-panel"
                style={{
                  flex: getPanelFlex('customizer'),
                  display: getPanelDisplay('customizer'),
                  minWidth: 0,
                  maxHeight: '100%'
                }}
              />
            </Box>

            <Footer />
          </Box>
        </FSContext.Provider>
      </ModelContext.Provider>
    </ThemeProvider>
  );
}

function serializeSimpleMap(values: CustomizerValuesInput): string {
  const entries = Object.keys(values)
    .sort()
    .map(key => [key, values[key]]);
  return JSON.stringify(entries);
}

function serializeCustomizerValues(values: CustomizerValues): string {
  const entries = Object.keys(values)
    .sort()
    .map(key => [key, values[key]]);
  return JSON.stringify(entries);
}
