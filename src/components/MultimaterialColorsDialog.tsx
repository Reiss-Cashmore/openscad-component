import chroma from 'chroma-js';
import React, { useContext, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, IconButton } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { ModelContext } from './contexts.ts';

export default function MultimaterialColorsDialog() {
    const model = useContext(ModelContext);
    if (!model) throw new Error('No model');
    const state = model.state;

    const [tempExtruderColors, setTempExtruderColors] = useState<string[]>(state.params.extruderColors ?? []);

    function setColor(index: number, color: string) {
        setTempExtruderColors(tempExtruderColors.map((c, i) => i === index ? color : c));
    }
    function removeColor(index: number) {
        setTempExtruderColors(tempExtruderColors.filter((c, i) => i !== index));
    }
    function addColor() {
        setTempExtruderColors([...tempExtruderColors, '']);
    }

    const cancelExtruderPicker = () => {
        setTempExtruderColors(state.params.extruderColors ?? []);
        model!.mutate(s => s.view.extruderPickerVisibility = undefined);
    };
    const canAddColor = !tempExtruderColors.some(c => c.trim() === '');
    const isValid = tempExtruderColors.every(c => chroma.valid(c) || c.trim() === '');
    
    return (
        <Dialog 
            open={!!state.view.extruderPickerVisibility} 
            onClose={cancelExtruderPicker}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Multimaterial Color Picker</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <Box sx={{ color: 'text.secondary' }}>
                        To print on a multimaterial printer using PrusaSlicer, BambuSlicer or OrcaSlicer, 
                        we map the model's colors to the closest match in the list of extruder colors.
                        Please define the colors of your extruders below.
                    </Box>
                    
                    {tempExtruderColors.map((color, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <input
                                type="color"
                                value={chroma.valid(color) ? chroma(color).hex() : '#000000'}
                                onChange={(e) => setColor(index, chroma(e.target.value).name())}
                                style={{ width: 50, height: 40, border: 'none', cursor: 'pointer' }}
                            />
                            <TextField
                                fullWidth
                                size="small"
                                value={color}
                                autoFocus={color === ''}
                                error={color.trim() === '' || !chroma.valid(color)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && canAddColor) {
                                        e.preventDefault();
                                        addColor();
                                    }
                                }}
                                onChange={(e) => {
                                    let newColor = e.target.value.trim();
                                    try {
                                        newColor = chroma(newColor).name();
                                    } catch (err) {
                                        console.error(err);
                                    }
                                    setColor(index, newColor);
                                }}
                            />
                            <IconButton
                                color="error"
                                onClick={() => removeColor(index)}
                                size="small"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Box>
                    ))}
                    <Button
                        startIcon={<AddIcon />}
                        disabled={!canAddColor}
                        onClick={addColor}
                        variant="outlined"
                    >
                        Add Color
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={cancelExtruderPicker}>Cancel</Button>
                <Button 
                    disabled={!isValid}
                    variant="contained"
                    onClick={() => {
                        const wasExporting = state.view.extruderPickerVisibility === 'exporting';
                        model!.mutate(s => {
                            s.params.extruderColors = tempExtruderColors.filter(c => c.trim() !== '');
                            s.view.extruderPickerVisibility = undefined;
                        });
                        if (wasExporting) {
                            model!.export();
                        }
                    }}
                >
                    {state.view.extruderPickerVisibility === 'exporting' ? "Export" : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}