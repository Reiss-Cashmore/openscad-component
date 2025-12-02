// Portions of this file are Copyright 2021 Google LLC, and licensed under GPL2+. See COPYING.

import React, { CSSProperties, useContext } from 'react';
import { ModelContext } from './contexts.ts';
import * as monaco from 'monaco-editor';
import { Button, LinearProgress, Badge, Box, Snackbar } from '@mui/material';
import { FlashOn as FlashOnIcon, FormatAlignLeft as FormatAlignLeftIcon } from '@mui/icons-material';
import HelpMenu from './HelpMenu.tsx';
import ExportButton from './ExportButton.tsx';
import SettingsMenu from './SettingsMenu.tsx';
import MultimaterialColorsDialog from './MultimaterialColorsDialog.tsx';


export default function Footer({style}: {style?: CSSProperties}) {
  const model = useContext(ModelContext);
  if (!model) throw new Error('No model');
  const state = model.state;

  const severityByMarkerSeverity = new Map<monaco.MarkerSeverity, 'error' | 'warning' | 'info'>([
    [monaco.MarkerSeverity.Error, 'error'],
    [monaco.MarkerSeverity.Warning, 'warning'],
    [monaco.MarkerSeverity.Info, 'info'],
  ]);
  const markers = state.lastCheckerRun?.markers ?? [];
  const getBadgeContent = (s: monaco.MarkerSeverity) => {
    const count = markers.filter(m => m.severity == s).length;
    return count > 0 ? count : 0;
  };

  const errorCount = getBadgeContent(monaco.MarkerSeverity.Error);
  const warningCount = getBadgeContent(monaco.MarkerSeverity.Warning);
  const infoCount = getBadgeContent(monaco.MarkerSeverity.Info);
  const maxMarkerSeverity = markers.length == 0 ? undefined : markers.map(m => m.severity).reduce((a, b) => Math.max(a, b));
  
  return (
    <Box>
      <LinearProgress
        sx={{
          visibility: state.rendering || state.previewing || state.checkingSyntax || state.exporting
            ? 'visible' : 'hidden',
          height: 3
        }}
      />
      
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 1.5,
        alignItems: 'center',
        px: 2,
        py: 1.5,
        backgroundColor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        ...(style ?? {})
      }}>
        {state.output && !state.output.isPreview ? (
          <ExportButton />
        ) : state.previewing ? (
          <Button
            startIcon={<FlashOnIcon />}
            disabled
            size="small"
            variant="contained"
          >
            Previewing...
          </Button>
        ) : state.output && state.output.isPreview ? (
          <Button
            startIcon={<FlashOnIcon />}
            onClick={() => model.render({isPreview: false, now: true})}
            size="small"
            disabled={state.rendering}
            variant="contained"
          >
            {state.rendering ? 'Rendering...' : 'Render'}
          </Button>
        ) : undefined}
        
        <MultimaterialColorsDialog />
        
        {(state.lastCheckerRun || state.output) && (
          <Badge 
            badgeContent={errorCount + warningCount + infoCount} 
            color={maxMarkerSeverity === monaco.MarkerSeverity.Error ? 'error' : maxMarkerSeverity === monaco.MarkerSeverity.Warning ? 'warning' : 'info'}
          >
            <Button
              startIcon={<FormatAlignLeftIcon />}
              onClick={() => model.logsVisible = !state.view.logs}
              size="small"
              variant={state.view.logs ? 'contained' : 'outlined'}
            >
              {state.view.logs ? "Hide Logs" : "Show Logs"}
            </Button>
          </Badge>
        )}

        <Box sx={{ flex: 1 }} />

        <SettingsMenu />
        <HelpMenu />
      </Box>
    </Box>
  );
}
