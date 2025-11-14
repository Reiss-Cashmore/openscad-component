import React, { useContext, useState } from 'react';
import { ModelContext } from './contexts.ts';

import { Button, ButtonGroup, Menu, MenuItem, Divider } from '@mui/material';
import { Download as DownloadIcon, ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';

export default function ExportButton({className, style}: {className?: string, style?: React.CSSProperties}) {
    const model = useContext(ModelContext);
    if (!model) throw new Error('No model');
    const state = model.state;

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const dropdownModel = state.is2D ? [
        { data: 'svg', buttonLabel: 'SVG', label: 'SVG (Simple Vector Graphics)', command: () => model!.setFormats('svg', undefined) },
        { data: 'dxf', buttonLabel: 'DXF', label: 'DXF (Drawing Exchange Format)', command: () => model!.setFormats('dxf', undefined) },
      ] : [
        { data: 'glb', buttonLabel: 'Download GLB', label: 'GLB (binary glTF)', command: () => model!.setFormats(undefined, 'glb') },
        { data: 'stl', buttonLabel: 'Download STL', label: 'STL (binary)', command: () => model!.setFormats(undefined, 'stl') },
        { data: 'off', buttonLabel: 'Download OFF', label: 'OFF (Object File Format)', command: () => model!.setFormats(undefined, 'off') },
        { data: '3mf', buttonLabel: 'Download 3MF', label: '3MF (Multimaterial)', command: () => model!.setFormats(undefined, '3mf') },
      ];

    const exportFormat = state.is2D ? state.params.exportFormat2D : state.params.exportFormat3D;
    const selectedItem = dropdownModel.find(item => item.data === exportFormat) || dropdownModel[0]!;
    const disabled = !state.output || state.output.isPreview || state.rendering || state.exporting;

  return (
    <div className={className} style={style}>
      <ButtonGroup variant="contained" size="small" disabled={disabled}>
        <Button 
          startIcon={<DownloadIcon />}
          onClick={() => model!.export()}
        >
          {selectedItem.buttonLabel}
        </Button>
        <Button
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
      >
        {dropdownModel.map((item) => (
          <MenuItem 
            key={item.data}
            onClick={() => {
              item.command();
              setAnchorEl(null);
            }}
          >
            {item.label}
          </MenuItem>
        ))}
        {!state.is2D && [
          <Divider key="divider" />,
          <MenuItem 
            key="materials"
            onClick={() => {
              model!.mutate(s => s.view.extruderPickerVisibility = 'editing');
              setAnchorEl(null);
            }}
          >
            Edit materials{(state.params.extruderColors ?? []).length > 0 ? ` (${(state.params.extruderColors ?? []).length})` : ''}
          </MenuItem>
        ]}
      </Menu>
    </div>
  );
}
