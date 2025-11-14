// Portions of this file are Copyright 2021 Google LLC, and licensed under GPL2+. See COPYING.

import { CSSProperties, useContext, useState } from 'react';
import { IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { ModelContext } from './contexts.ts';
import { isInStandaloneMode } from '../utils.ts';

export default function SettingsMenu({className, style}: {className?: string, style?: CSSProperties}) {
  const model = useContext(ModelContext);
  if (!model) throw new Error('No model');
  const state = model.state;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClearStorage = () => {
    setConfirmOpen(true);
    handleClose();
  };

  const confirmClearStorage = () => {
    localStorage.clear();
    location.reload();
  };

  return (
    <>
      <IconButton 
        size="small"
        onClick={handleClick}
        aria-label="Settings menu"
        title="Settings menu"
        style={style}
        className={className}
      >
        <SettingsIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={() => {
          model.changeLayout(state.view.layout.mode === 'multi' ? 'single' : 'multi');
          handleClose();
        }}>
          {state.view.layout.mode === 'multi' ? 'Switch to single panel mode' : 'Switch to side-by-side mode'}
        </MenuItem>
        <MenuItem onClick={() => {
          model.mutate(s => s.view.showAxes = !s.view.showAxes);
          handleClose();
        }}>
          {state.view.showAxes ? 'Hide axes' : 'Show axes'}
        </MenuItem>
        <MenuItem onClick={async () => {
          model.mutate(s => s.view.showBuildPlate = !s.view.showBuildPlate);
          handleClose();
          // Re-render the model to apply build plate changes
          await model.render({isPreview: false, now: true});
        }}>
          {state.view.showBuildPlate ? 'Hide build plate' : 'Show build plate'}
        </MenuItem>
        <MenuItem onClick={() => {
          model.mutate(s => s.view.lineNumbers = !s.view.lineNumbers);
          handleClose();
        }}>
          {state.view.lineNumbers ? 'Hide line numbers' : 'Show line numbers'}
        </MenuItem>
        {isInStandaloneMode() && (
          <MenuItem onClick={handleClearStorage}>
            Clear local storage
          </MenuItem>
        )}
      </Menu>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      >
        <DialogTitle>Clear local storage</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will clear all the edits you've made and files you've created in this playground 
            and will reset it to factory defaults. Are you sure you wish to proceed? (you might lose your models!)
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmClearStorage} color="error" variant="contained">
            Clear all files!
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}