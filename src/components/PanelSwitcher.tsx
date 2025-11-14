// Portions of this file are Copyright 2021 Google LLC, and licensed under GPL2+. See COPYING.

import React, { useContext } from 'react';
import { SingleLayoutComponentId } from '../state/app-state.ts'
import { Tabs, Tab, ToggleButton, ToggleButtonGroup, Box } from '@mui/material';
import { Edit as EditIcon, ViewInAr as ViewIcon, Tune as TuneIcon } from '@mui/icons-material';
import { ModelContext } from './contexts.ts';

export default function PanelSwitcher() {
  const model = useContext(ModelContext);
  if (!model) throw new Error('No model');

  const state = model.state;

  const iconMap = {
    'editor': <EditIcon fontSize="small" />,
    'viewer': <ViewIcon fontSize="small" />,
    'customizer': <TuneIcon fontSize="small" />,
  };

  const singleTargets: {id: SingleLayoutComponentId, icon: JSX.Element, label: string}[] = [
    { id: 'editor', icon: iconMap.editor, label: 'Editor' },
    { id: 'viewer', icon: iconMap.viewer, label: 'Viewer' },
  ];
  if ((state.parameterSet?.parameters?.length ?? 0) > 0) {
    singleTargets.push({ id: 'customizer', icon: iconMap.customizer, label: 'Customizer' });
  }
  const multiTargets = singleTargets;

  return (
    <Box sx={{ 
      borderBottom: 1, 
      borderColor: 'divider',
      backgroundColor: 'background.paper',
      px: 2,
      backdropFilter: 'blur(8px)',
    }}>
      {state.view.layout.mode === 'multi' ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          py: 1.5,
        }}>
          <ToggleButtonGroup
            size="small"
            aria-label="panel visibility"
            sx={{
              gap: 0.5,
              '& .MuiToggleButton-root': {
                px: 2,
                py: 1,
              }
            }}
          >
            {multiTargets.map(({icon, label, id}) => 
              <ToggleButton
                key={id}
                value={id}
                selected={(state.view.layout as any)[id]}
                onChange={() => model.changeMultiVisibility(id, !(state.view.layout as any)[id])}
                aria-label={label}
              >
                {icon}
                <Box component="span" sx={{ ml: 1, fontSize: '0.875rem' }}>{label}</Box>
              </ToggleButton>
            )}
          </ToggleButtonGroup>
        </Box>
      ) : (
        <Tabs
          value={singleTargets.map(t => t.id).indexOf(state.view.layout.focus)}
          onChange={(_, newValue) => model.changeSingleVisibility(singleTargets[newValue].id)}
          aria-label="panel tabs"
          sx={{
            '& .MuiTab-root': {
              px: 3,
            }
          }}
        >
          {singleTargets.map(({icon, label}) => 
            <Tab 
              key={label}
              icon={icon} 
              label={label} 
              iconPosition="start"
              sx={{ gap: 1 }}
            />
          )}
        </Tabs>
      )}
    </Box>
  );
}
