// Portions of this file are Copyright 2021 Google LLC, and licensed under GPL2+. See COPYING.

import React, { CSSProperties, useContext } from 'react';
import { ModelContext } from './contexts.ts';

import { 
  Select, 
  Slider, 
  Checkbox, 
  TextField, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  MenuItem, 
  Box,
  FormControlLabel,
  IconButton,
  Typography
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { Parameter } from '../state/customizer-types.ts';

export default function CustomizerPanel({className, style}: {className?: string, style?: CSSProperties}) {

  const model = useContext(ModelContext);
  if (!model) throw new Error('No model');

  const state = model.state;

  const handleChange = (name: string, value: any) => {
    model.setVar(name, value);
  };

  const groupedParameters = (state.parameterSet?.parameters ?? []).reduce((acc, param) => {
    if (!acc[param.group]) {
      acc[param.group] = [];
    }
    acc[param.group].push(param);
    return acc;
  }, {} as { [key: string]: any[] });
  const groups = Object.entries(groupedParameters);
  const collapsedTabSet = new Set(state.view.collapsedCustomizerTabs ?? []);
  const setTabOpen = (name: string, open: boolean) => {
    if (open) {
      collapsedTabSet.delete(name);
    } else {
      collapsedTabSet.add(name)
    }
    model.mutate(s => s.view.collapsedCustomizerTabs = Array.from(collapsedTabSet));
  }

  return (
    <Box
        className={`customizer-panel ${className ?? ''}`}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          backgroundColor: 'background.default',
          overflow: 'auto',
          p: 1,
          ...style,
        }}>
      {groups.map(([group, params]) => (
        <Accordion 
            key={group}
            expanded={!collapsedTabSet.has(group)}
            onChange={(_, expanded) => setTabOpen(group, expanded)}
            sx={{ 
              mb: 1,
              '&:first-of-type': {
                borderRadius: '12px',
              },
              '&:last-of-type': {
                borderRadius: '12px',
              },
            }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{group}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {params.map((param) => (
                <ParameterInput
                  key={param.name}
                  value={(state.params.vars ?? {})[param.name]}
                  param={param}
                  handleChange={handleChange} />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

function ParameterInput({param, value, className, style, handleChange}: {param: Parameter, value: any, className?: string, style?: CSSProperties, handleChange: (key: string, value: any) => void}) {
  const isDefault = value === undefined || JSON.stringify(value) === JSON.stringify(param.initial);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', ...style }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold">{param.name}</Typography>
          {param.caption && <Typography variant="caption" color="text.secondary">{param.caption}</Typography>}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {param.type === 'number' && 'options' in param && param.options && (
            <Select
              size="small"
              value={value ?? param.initial}
              onChange={(e) => handleChange(param.name, e.target.value)}
              sx={{ minWidth: 120 }}
            >
              {param.options.map((opt: any) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.name}</MenuItem>
              ))}
            </Select>
          )}
          {param.type === 'string' && param.options && (
            <Select
              size="small"
              value={value ?? param.initial}
              onChange={(e) => handleChange(param.name, e.target.value)}
              sx={{ minWidth: 120 }}
            >
              {param.options.map((opt: any) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.name}</MenuItem>
              ))}
            </Select>
          )}
          {param.type === 'boolean' && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={value ?? param.initial}
                  onChange={(e) => handleChange(param.name, e.target.checked)}
                />
              }
              label=""
            />
          )}
          {!Array.isArray(param.initial) && param.type === 'number' && !('options' in param) && (
            <TextField
              type="number"
              size="small"
              value={value ?? param.initial}
              onChange={(e) => handleChange(param.name, parseFloat(e.target.value))}
              inputProps={{ 
                step: param.step || 1,
                min: param.min,
                max: param.max 
              }}
              sx={{ width: 100 }}
            />
          )}
          {param.type === 'string' && !param.options && (
            <TextField
              size="small"
              value={value ?? param.initial}
              onChange={(e) => handleChange(param.name, e.target.value)}
              sx={{ minWidth: 120 }}
            />
          )}
          {Array.isArray(param.initial) && 'min' in param && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {param.initial.map((_, index) => (
                <TextField
                  key={index}
                  type="number"
                  size="small"
                  value={value?.[index] ?? (param.initial as any)[index]}
                  onChange={(e) => {
                    const newArray = [...(value ?? param.initial)];
                    newArray[index] = parseFloat(e.target.value);
                    handleChange(param.name, newArray);
                  }}
                  inputProps={{ 
                    step: param.step || 1,
                    min: param.min,
                    max: param.max 
                  }}
                  sx={{ width: 80 }}
                />
              ))}
            </Box>
          )}
          <IconButton
            size="small"
            onClick={() => handleChange(param.name, param.initial)}
            sx={{ visibility: isDefault ? 'hidden' : 'visible' }}
            title={`Reset ${param.name} to default`}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      {!Array.isArray(param.initial) && param.type === 'number' && param.min !== undefined && !('options' in param) && (
        <Slider
          value={value ?? param.initial}
          min={param.min}
          max={param.max}
          step={param.step || 1}
          onChange={(_, newValue) => handleChange(param.name, newValue)}
          valueLabelDisplay="auto"
          sx={{ mr: 3 }}
        />
      )}
    </Box>
  );
}