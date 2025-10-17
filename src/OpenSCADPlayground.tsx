// Portions of this file are Copyright 2021 Google LLC, and licensed under GPL2+. See COPYING.

import React from 'react';
import { State, StatePersister } from './state/app-state';
import { App } from './components/App';
import { useOpenSCAD } from './hooks/useOpenSCAD';
import { createInitialState } from './state/initial-state';

export interface LibraryConfig {
  name: string;
  url: string;
}

export interface OpenSCADPlaygroundProps {
  // WASM & Worker URLs (optional for now, will be used for custom loading)
  wasmUrl?: string;
  workerUrl?: string;

  // Libraries
  libraries?: LibraryConfig[];

  // Initial state
  initialState?: Partial<State>;
  initialFiles?: Record<string, string>;

  // State management
  onStateChange?: (state: State) => void;
  statePersister?: StatePersister;

  // Layout
  layout?: 'single' | 'multi';
  defaultFocus?: 'editor' | 'viewer' | 'customizer';

  // Theme
  theme?: 'light' | 'dark' | 'auto';

  // Feature flags
  features?: {
    filePicker?: boolean;
    export?: boolean;
    syntaxCheck?: boolean;
    customizer?: boolean;
  };

  // Callbacks
  onRender?: (output: any) => void;
  onExport?: (file: Blob, format: string) => void;
  onError?: (error: Error) => void;

  // Style
  className?: string;
  style?: React.CSSProperties;
}

export function OpenSCADPlayground(props: OpenSCADPlaygroundProps) {
  // Merge initial state with defaults
  const initialState: State = {
    ...createInitialState(null),
    ...props.initialState
  };

  // Handle initial files
  if (props.initialFiles) {
    const sources = Object.entries(props.initialFiles).map(([path, content]) => ({
      path,
      content
    }));

    if (sources.length > 0) {
      initialState.params.sources = sources;
      initialState.params.activePath = sources[0].path;
    }
  }

  // Apply layout preference
  if (props.layout) {
    initialState.view.layout.mode = props.layout;
  }

  if (props.defaultFocus && initialState.view.layout.mode === 'single') {
    initialState.view.layout.focus = props.defaultFocus;
  }

  // Create state persister wrapper
  const statePersister: StatePersister | undefined = props.statePersister || (props.onStateChange ? {
    set: async (state: State) => {
      if (props.onStateChange) {
        props.onStateChange(state);
      }
    }
  } : undefined);

  // Initialize OpenSCAD
  const { model, fs, isReady, error } = useOpenSCAD({
    initialState,
    statePersister
  });

  // Handle errors
  React.useEffect(() => {
    if (error && props.onError) {
      props.onError(error);
    }
  }, [error, props.onError]);

  // Loading state
  if (!isReady || !model || !fs) {
    return (
      <div
        className={props.className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          ...props.style
        }}
      >
        {error ? (
          <div style={{ color: 'red', textAlign: 'center' }}>
            <h3>Failed to initialize OpenSCAD</h3>
            <p>{error.message}</p>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div>Loading OpenSCAD Playground...</div>
          </div>
        )}
      </div>
    );
  }

  // Render the app
  return (
    <div
      className={props.className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...props.style
      }}
    >
      <App
        initialState={initialState}
        statePersister={statePersister!}
        fs={fs}
      />
    </div>
  );
}
