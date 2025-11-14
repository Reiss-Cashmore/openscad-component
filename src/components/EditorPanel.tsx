// Portions of this file are Copyright 2021 Google LLC, and licensed under GPL2+. See COPYING.

import React, { CSSProperties, useContext, useRef, useState } from 'react';
import Editor, { loader, Monaco } from '@monaco-editor/react';
import openscadEditorOptions from '../language/openscad-editor-options.ts';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { TextField, IconButton, Box, Menu, MenuItem } from '@mui/material';
import { 
  MoreHoriz as MoreIcon, 
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { buildUrlForStateParams } from '../state/fragment-state.ts';
import { getBlankProjectState, defaultSourcePath } from '../state/initial-state.ts';
import { ModelContext, FSContext } from './contexts.ts';
import FilePicker, {  } from './FilePicker.tsx';

// const isMonacoSupported = false;
const isMonacoSupported = (() => {
  const ua = window.navigator.userAgent;
  const iosWk = ua.match(/iPad|iPhone/i) && ua.match(/WebKit/i);
  return !iosWk;
})();

let monacoInstance: Monaco | null = null;
if (isMonacoSupported) {
  loader.init().then(mi => monacoInstance = mi);
}

export default function EditorPanel({className, style}: {className?: string, style?: CSSProperties}) {

  const model = useContext(ModelContext);
  if (!model) throw new Error('No model');

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);

  const state = model.state;

  const [editor, setEditor] = useState(null as monaco.editor.IStandaloneCodeEditor | null)

  if (editor) {
    const checkerRun = state.lastCheckerRun;
    const editorModel = editor.getModel();
    if (editorModel) {
      if (checkerRun && monacoInstance) {
        monacoInstance.editor.setModelMarkers(editorModel, 'openscad', checkerRun.markers);
      }
    }
  }

  const onMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editor.addAction({
      id: "openscad-render",
      label: "Render OpenSCAD",
      run: () => model.render({isPreview: false, now: true})
    });
    editor.addAction({
      id: "openscad-preview",
      label: "Preview OpenSCAD",
      run: () => model.render({isPreview: true, now: true})
    });
    editor.addAction({
      id: "openscad-save-do-nothing",
      label: "Save (disabled)",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {}
    });
    editor.addAction({
      id: "openscad-save-project",
      label: "Save OpenSCAD project",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyS],
      run: () => model.saveProject()
    });
    setEditor(editor)
  }

  return (
    <Box className={`editor-panel ${className ?? ''}`} sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      backgroundColor: 'background.default',
      ...(style ?? {})
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 1,
        px: 2,
        py: 1.5,
        backgroundColor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        alignItems: 'center',
        flexShrink: 0
      }}>
          
        <IconButton 
          size="small"
          onClick={(e) => setMenuAnchorEl(e.currentTarget)}
          aria-label="Editor menu"
          title="Editor menu"
        >
          <MoreIcon />
        </IconButton>

        <Menu
          anchorEl={menuAnchorEl}
          open={menuOpen}
          onClose={() => setMenuAnchorEl(null)}
        >
          <MenuItem onClick={() => {
            window.open(buildUrlForStateParams(getBlankProjectState()), '_blank');
            setMenuAnchorEl(null);
          }}>
            New project
          </MenuItem>
          <MenuItem disabled>Share project</MenuItem>
          <MenuItem disabled>New file</MenuItem>
          <MenuItem disabled>Copy to new file</MenuItem>
          <MenuItem disabled>Upload file(s)</MenuItem>
          <MenuItem disabled>Download sources</MenuItem>
          <MenuItem onClick={() => {
            editor?.trigger(state.params.activePath, 'editor.action.selectAll', null);
            setMenuAnchorEl(null);
          }}>
            Select All
          </MenuItem>
          <MenuItem onClick={() => {
            editor?.trigger(state.params.activePath, 'actions.find', null);
            setMenuAnchorEl(null);
          }}>
            Find
          </MenuItem>
        </Menu>
        
        <Box sx={{ flex: 1 }}>
          <FilePicker />
        </Box>

        {state.params.activePath !== defaultSourcePath && 
          <IconButton 
            size="small"
            onClick={() => model.openFile(defaultSourcePath)} 
            title={`Go back to ${defaultSourcePath}`}
            aria-label={`Go back to ${defaultSourcePath}`}
          >
            <ChevronLeftIcon />
          </IconButton>
        }

      </Box>

      
      <Box sx={{
        position: 'relative',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden'
      }}>
        {isMonacoSupported && (
          <Editor
            className="openscad-editor absolute-fill"
            defaultLanguage="openscad"
            path={state.params.activePath}
            value={model.source}
            onChange={s => model.source = s ?? ''}
            onMount={onMount}
            options={{
              ...openscadEditorOptions,
              fontSize: 16,
              lineNumbers: state.view.lineNumbers ? 'on' : 'off',
            }}
          />
        )}
        {!isMonacoSupported && (
          <TextField 
            className="openscad-editor absolute-fill"
            value={model.source}
            onChange={(e) => model.source = e.target.value ?? ''}
            multiline
            fullWidth
          />
        )}
      </Box>

      <Box sx={{
        display: state.view.logs ? 'block' : 'none',
        overflowY: 'auto',
        maxHeight: '200px',
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        flexShrink: 0,
        p: 1,
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        {(state.currentRunLogs ?? []).map(([type, text], i) => (
          <pre key={i} style={{ margin: 0 }}>{text}</pre>
        ))}
      </Box>
    
    </Box>
  )
}
