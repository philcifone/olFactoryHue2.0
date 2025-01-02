import React, { useState, useEffect } from 'react';
import { Save, Lock, Unlock, RefreshCw, Trash2, Download } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const ColorPaletteGenerator = () => {
  const [colors, setColors] = useState(Array(5).fill('#FFFFFF'));
  const [lockedColors, setLockedColors] = useState(Array(5).fill(false));
  const [savedPalettes, setSavedPalettes] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [harmonyMode, setHarmonyMode] = useState('analogous');

  const generateRandomColor = () => {
    return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
  };

  // Convert hex to HSL
  const hexToHSL = (hex) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };

  // Convert HSL to hex
  const HSLToHex = (h, s, l) => {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const rgb = [255 * f(0), 255 * f(8), 255 * f(4)];
    return '#' + rgb.map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // Generate harmonious colors
  const generateHarmoniousColors = (baseColor) => {
    const [h, s, l] = hexToHSL(baseColor);
    let newColors = [baseColor];

    switch (harmonyMode) {
      case 'analogous':
        newColors.push(HSLToHex((h + 30) % 360, s, l));
        newColors.push(HSLToHex((h + 60) % 360, s, l));
        newColors.push(HSLToHex((h - 30 + 360) % 360, s, l));
        newColors.push(HSLToHex((h - 60 + 360) % 360, s, l));
        break;
      case 'complementary':
        newColors.push(HSLToHex((h + 180) % 360, s, l));
        newColors.push(HSLToHex((h + 180) % 360, s, l - 20));
        newColors.push(HSLToHex(h, s, l - 20));
        newColors.push(HSLToHex(h, s - 20, l));
        break;
      case 'triadic':
        newColors.push(HSLToHex((h + 120) % 360, s, l));
        newColors.push(HSLToHex((h + 240) % 360, s, l));
        newColors.push(HSLToHex((h + 120) % 360, s, l - 20));
        newColors.push(HSLToHex((h + 240) % 360, s, l - 20));
        break;
      default:
        newColors = Array(5).fill().map(() => generateRandomColor());
    }

    return newColors;
  };

  const generateNewColors = () => {
    const baseColor = generateRandomColor();
    const newColors = generateHarmoniousColors(baseColor);
    
    setColors(prevColors => 
      prevColors.map((color, index) => 
        lockedColors[index] ? color : newColors[index]
      )
    );
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(colors);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const newLockedColors = Array.from(lockedColors);
    const [reorderedLock] = newLockedColors.splice(result.source.index, 1);
    newLockedColors.splice(result.destination.index, 0, reorderedLock);

    setColors(items);
    setLockedColors(newLockedColors);
  };

  const toggleLock = (index) => {
    setLockedColors(prev => {
      const newLocked = [...prev];
      newLocked[index] = !newLocked[index];
      return newLocked;
    });
  };

  const savePalette = () => {
    setSavedPalettes(prev => [...prev, { id: Date.now(), colors: [...colors] }]);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
  };

  const deletePalette = (id) => {
    setSavedPalettes(prev => prev.filter(palette => palette.id !== id));
  };

  const exportPalettes = () => {
    const dataStr = JSON.stringify(savedPalettes);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'color-palettes.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const copyColorCode = (color) => {
    navigator.clipboard.writeText(color);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
  };

  useEffect(() => {
    generateNewColors();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">Color Palette Generator</h1>
        
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardContent className="p-6">
            <div className="flex justify-center gap-4 mb-6">
              <Button
                onClick={() => setHarmonyMode('analogous')}
                className={`${harmonyMode === 'analogous' ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                Analogous
              </Button>
              <Button
                onClick={() => setHarmonyMode('complementary')}
                className={`${harmonyMode === 'complementary' ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                Complementary
              </Button>
              <Button
                onClick={() => setHarmonyMode('triadic')}
                className={`${harmonyMode === 'triadic' ? 'bg-blue-600' : 'bg-gray-600'}`}
              >
                Triadic
              </Button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="colors" direction="horizontal">
                {(provided) => (
                  <div 
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex flex-wrap gap-4 mb-6"
                  >
                    {colors.map((color, index) => (
                      <Draggable key={index} draggableId={`color-${index}`} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex-1 min-w-[200px]"
                          >
                            <div 
                              className="h-32 rounded-lg cursor-pointer transition-transform hover:scale-105"
                              style={{ backgroundColor: color }}
                              onClick={() => copyColorCode(color)}
                            />
                            <div className="flex items-center justify-between mt-2">
                              <span 
                                className="text-white font-mono cursor-pointer"
                                onClick={() => copyColorCode(color)}
                              >
                                {color.toUpperCase()}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleLock(index)}
                                className="text-white hover:text-gray-300"
                              >
                                {lockedColors[index] ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            
            <div className="flex justify-center gap-4">
              <Button
                onClick={generateNewColors}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate New Colors
              </Button>
              <Button
                onClick={savePalette}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Palette
              </Button>
            </div>
          </CardContent>
        </Card>

        {savedPalettes.length > 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Saved Palettes</h2>
                <Button
                  onClick={exportPalettes}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Palettes
                </Button>
              </div>
              <div className="grid gap-4">
                {savedPalettes.map(palette => (
                  <div 
                    key={palette.id}
                    className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1 flex gap-2">
                      {palette.colors.map((color, index) => (
                        <div
                          key={index}
                          className="flex-1 h-16 rounded cursor-pointer transition-transform hover:scale-105"
                          style={{ backgroundColor: color }}
                          onClick={() => copyColorCode(color)}
                        />
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deletePalette(palette.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {showAlert && (
          <Alert className="fixed bottom-4 right-4 bg-green-600 text-white border-none">
            <AlertDescription>
              Copied to clipboard!
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default ColorPaletteGenerator;