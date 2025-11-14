// Portions of this file are Copyright 2021 Google LLC, and licensed under GPL2+. See COPYING.

import { CSSProperties, useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';

export default function HelpMenu({className, style}: {className?: string, style?: CSSProperties}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openLink = (url: string) => {
    window.open(url, '_blank');
    handleClose();
  };

  return (
    <>
      <IconButton 
        size="small"
        onClick={handleClick}
        aria-label="Help & Licenses"
        title="Help & Licenses"
        style={style}
        className={className}
      >
        <HelpIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={() => openLink('https://github.com/openscad/openscad-playground/')}>
          openscad-playground
        </MenuItem>
        <MenuItem onClick={() => openLink('https://github.com/openscad/openscad-playground/blob/main/LICENSE.md')}>
          LICENSES
        </MenuItem>
        <MenuItem onClick={() => openLink('https://openscad.org/documentation.html')}>
          OpenSCAD Docs
        </MenuItem>
        <MenuItem onClick={() => openLink('https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/Customizer')}>
          Customizer Syntax
        </MenuItem>
        <MenuItem onClick={() => openLink('https://openscad.org/cheatsheet/')}>
          OpenSCAD Cheatsheet
        </MenuItem>
        <MenuItem onClick={() => openLink('https://github.com/BelfrySCAD/BOSL2/wiki/CheatSheet')}>
          BOSL2 Cheatsheet
        </MenuItem>
      </Menu>
    </>
  );
}