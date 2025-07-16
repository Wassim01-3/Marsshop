import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Product, ProductSize, ProductColor } from "@/types";
import { Plus, X, Image as ImageIcon, Palette } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EditProductDialogProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<Product>) => void;
}

function normalizeHex(hex: string): string {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) {
    h = h.split("").map(x => x + x).join("");
  }
  if (!/^[0-9A-Fa-f]{6}$/.test(h)) return "";
  return "#" + h.toUpperCase();
}

function isValidHex(hex: string): boolean {
  const h = hex.trim().replace(/^#/, "");
  return /^[0-9A-Fa-f]{6}$/.test(h);
}

const EditProductDialog = ({ product, isOpen, onClose, onSave }: EditProductDialogProps) => {
  const [form, setForm] = useState(() => ({
    stock: product?.stock || 0,
    price: product?.price || 0,
    sizes: product?.sizes ? [...product.sizes] : [],
    colors: product?.colors ? [...product.colors] : [],
    disabledSizes: [] as ProductSize[],
    disabledColors: [] as ProductColor[],
    newSize: { name: "", stock: 0 },
    newColor: { name: "", value: ["#000000"], images: [] as string[] },
  }));

  // Reset form when product changes
  React.useEffect(() => {
    setForm({
      stock: product?.stock || 0,
      price: product?.price || 0,
      sizes: product?.sizes ? [...product.sizes] : [],
      colors: product?.colors ? [...product.colors] : [],
      disabledSizes: [],
      disabledColors: [],
      newSize: { name: "", stock: 0 },
      newColor: { name: "", value: ["#000000"], images: [] },
    });
  }, [product, isOpen]);

  // Handlers
  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, stock: Math.max(0, parseInt(e.target.value) || 0) }));
  };
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, price: Math.max(0, parseFloat(e.target.value) || 0) }));
  };
  const handleSizeStockChange = (idx: number, value: number) => {
    setForm(f => {
      const sizes = [...f.sizes];
      sizes[idx] = { ...sizes[idx], stock: Math.max(0, value) };
      return { ...f, sizes };
    });
  };
  const handleDisableSize = (idx: number) => {
    setForm(f => {
      const size = f.sizes[idx];
      return {
        ...f,
        sizes: f.sizes.filter((_, i) => i !== idx),
        disabledSizes: [...f.disabledSizes, size],
      };
    });
  };
  const handleEnableSize = (idx: number) => {
    setForm(f => {
      const size = f.disabledSizes[idx];
      return {
        ...f,
        sizes: [...f.sizes, size],
        disabledSizes: f.disabledSizes.filter((_, i) => i !== idx),
      };
    });
  };
  const handleNewSizeChange = (field: 'name' | 'stock', value: string | number) => {
    setForm(f => ({ ...f, newSize: { ...f.newSize, [field]: value } }));
  };
  const handleAddSize = () => {
    if (!form.newSize.name.trim() || form.newSize.stock <= 0) return;
    // Prevent duplicate size names
    if (form.sizes.some(s => s.name.toLowerCase() === form.newSize.name.toLowerCase())) return;
    const newSize: ProductSize = {
      id: `size-${Date.now()}`,
      name: form.newSize.name,
      stock: form.newSize.stock,
    };
    setForm(f => ({
      ...f,
      sizes: [...f.sizes, newSize],
      stock: f.stock + form.newSize.stock, // Increase main stock
      newSize: { name: "", stock: 0 },
    }));
  };
  // Colors
  const handleDisableColor = (idx: number) => {
    setForm(f => {
      const color = f.colors[idx];
      return {
        ...f,
        colors: f.colors.filter((_, i) => i !== idx),
        disabledColors: [...f.disabledColors, color],
      };
    });
  };
  const handleEnableColor = (idx: number) => {
    setForm(f => {
      const color = f.disabledColors[idx];
      return {
        ...f,
        colors: [...f.colors, color],
        disabledColors: f.disabledColors.filter((_, i) => i !== idx),
      };
    });
  };
  // For combined color creation
  const handleNewColorNameChange = (value: string) => {
    setForm(f => ({ ...f, newColor: { ...f.newColor, name: value } }));
  };
  const handleNewColorValueChange = (idx: number, value: string) => {
    // Just update the value as typed, don't normalize here
    setForm(f => ({
      ...f,
      newColor: {
        ...f.newColor,
        value: Array.isArray(f.newColor.value)
          ? f.newColor.value.map((v, i) => (i === idx ? value : v))
          : [value],
      },
    }));
    // Optionally, validate as the user types
    const valid = isValidHex(value);
    setColorInputErrors(e => ({ ...e, [idx]: !valid }));
  };
  const handleAddColorStop = () => {
    setForm(f => ({
      ...f,
      newColor: {
        ...f.newColor,
        value: Array.isArray(f.newColor.value)
          ? [...f.newColor.value, "#000000"]
          : [f.newColor.value as string, "#000000"],
      },
    }));
  };
  const handleRemoveColorStop = (idx: number) => {
    setForm(f => ({
      ...f,
      newColor: {
        ...f.newColor,
        value: Array.isArray(f.newColor.value)
          ? f.newColor.value.filter((_, i) => i !== idx)
          : [],
      },
    }));
  };
  const handleAddColor = () => {
    if (!form.newColor.name.trim()) return;
    // Prevent duplicate color names
    if (form.colors.some(c => c.name.toLowerCase() === form.newColor.name.toLowerCase())) return;
    const newColor: ProductColor = {
      id: `color-${Date.now()}`,
      name: form.newColor.name,
      value: Array.isArray(form.newColor.value) && form.newColor.value.length > 1
        ? [...form.newColor.value]
        : Array.isArray(form.newColor.value)
          ? form.newColor.value[0]
          : form.newColor.value,
      images: form.newColor.images,
    };
    setForm(f => ({
      ...f,
      colors: [...f.colors, newColor],
      newColor: { name: "", value: ["#000000"], images: [] },
    }));
  };
  // TODO: Add handler for uploading color photo if needed

  // Save handler
  const handleSave = () => {
    onSave({
      stock: form.stock,
      price: form.price,
      sizes: form.sizes,
      colors: form.colors,
    });
  };

  // Copy of getColorCircleStyle from Admin.tsx for consistent color rendering
  function getColorCircleStyle(val: string | string[]) {
    if (Array.isArray(val)) {
      const stops = val.map((color, i) => {
        const start = Math.round((i / val.length) * 100);
        const end = Math.round(((i + 1) / val.length) * 100);
        return `${color} ${start}%, ${color} ${end}%`;
      });
      return { background: `linear-gradient(90deg, ${stops.join(", ")})` };
    }
    if (typeof val === 'string') {
      return { backgroundColor: val };
    }
    return {};
  }

  // For color picker popover state
  const [colorPickerOpenIdx, setColorPickerOpenIdx] = useState<number | null>(null);
  const [colorInputErrors, setColorInputErrors] = useState<{[idx: number]: boolean}>({});

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl shadow-xl border border-gray-200">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-2xl font-bold text-mars-700">
            <span>Edit Product</span>
            <span className="text-gray-400 font-normal text-lg">#{product?.id}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-8 py-4">
          {/* Main Stock & Price */}
          <Card className="bg-white/80 shadow-sm border border-gray-100 rounded-xl">
            <CardHeader className="pb-2 border-b border-gray-100">
              <CardTitle className="text-lg font-semibold text-mars-700">Main Info</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Stock</label>
                <Input type="number" min={0} value={form.stock} onChange={handleStockChange} className="rounded-lg border-gray-200 focus:border-mars-400 focus:ring-mars-200" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Price</label>
                <Input type="number" min={0} step={0.001} value={form.price} onChange={handlePriceChange} className="rounded-lg border-gray-200 focus:border-mars-400 focus:ring-mars-200" />
              </div>
            </CardContent>
          </Card>

          {/* Sizes Management */}
          <Card className="bg-gradient-to-r from-gray-50 to-white/80 border border-gray-100 rounded-xl shadow-sm">
            <CardHeader className="pb-2 border-b border-gray-100 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-mars-700 flex items-center gap-2">
                <span>Sizes</span>
                <Plus className="h-4 w-4 text-mars-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {form.sizes.length === 0 && <div className="text-gray-400">No sizes</div>}
              <div className="flex flex-col gap-2">
                {form.sizes.map((size, idx) => (
                  <div key={size.id || size.name} className="flex items-center gap-4 bg-white/70 rounded-lg px-3 py-2 border border-gray-100 hover:shadow-sm transition">
                    <span className="font-medium w-20 text-gray-700">{size.name}</span>
                    <Input type="number" min={0} value={size.stock} onChange={e => handleSizeStockChange(idx, parseInt(e.target.value) || 0)} className="w-24 rounded-md border-gray-200 focus:border-mars-400" />
                    <Button size="sm" variant="outline" className="ml-auto text-gray-500 hover:text-mars-600" onClick={() => handleDisableSize(idx)}>Disable</Button>
                  </div>
                ))}
              </div>
              {/* Disabled sizes */}
              {form.disabledSizes.length > 0 && (
                <div className="mt-2 text-xs text-gray-400">
                  Disabled: {form.disabledSizes.map((s, idx) => (
                    <span key={s.id || s.name} className="mr-2">
                      {s.name} <Button size="sm" variant="ghost" className="text-mars-400 hover:text-mars-600" onClick={() => handleEnableSize(idx)}>Enable</Button>
                    </span>
                  ))}
                </div>
              )}
              {/* Add new size */}
              <div className="flex items-center gap-2 mt-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <Input placeholder="Size name" value={form.newSize.name} onChange={e => handleNewSizeChange('name', e.target.value)} className="w-32 rounded-md border-gray-200 focus:border-mars-400" />
                <Input type="number" min={0} placeholder="Stock" value={form.newSize.stock} onChange={e => handleNewSizeChange('stock', parseInt(e.target.value) || 0)} className="w-24 rounded-md border-gray-200 focus:border-mars-400" />
                <Button size="sm" variant="outline" className="text-mars-600 border-mars-200 hover:bg-mars-50" onClick={handleAddSize}>Add Size</Button>
              </div>
            </CardContent>
          </Card>

          {/* Colors Management */}
          <Card className="bg-gradient-to-r from-gray-50 to-white/80 border border-gray-100 rounded-xl shadow-sm">
            <CardHeader className="pb-2 border-b border-gray-100 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold text-mars-700 flex items-center gap-2">
                <span>Colors</span>
                <Plus className="h-4 w-4 text-mars-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {form.colors.length === 0 && <div className="text-gray-400">No colors</div>}
              <div className="flex flex-col gap-2">
                {form.colors.map((color, idx) => (
                  <div key={color.id || color.name} className="flex items-center gap-4 bg-white/70 rounded-lg px-3 py-2 border border-gray-100 hover:shadow-sm transition">
                    <span className="flex items-center min-w-[120px]">
                      <span className="w-8 h-8 rounded-full border mr-2 inline-block align-middle" style={getColorCircleStyle(color.value)} />
                      <span className="align-middle font-medium text-gray-700">{color.name}</span>
                    </span>
                    <Button size="sm" variant="outline" className="ml-auto text-gray-500 hover:text-mars-600" onClick={() => handleDisableColor(idx)}>Disable</Button>
                  </div>
                ))}
              </div>
              {/* Disabled colors */}
              {form.disabledColors.length > 0 && (
                <div className="mt-2 text-xs text-gray-400">
                  Disabled: {form.disabledColors.map((c, idx) => (
                    <span key={c.id || c.name} className="mr-2">
                      {c.name} <Button size="sm" variant="ghost" className="text-mars-400 hover:text-mars-600" onClick={() => handleEnableColor(idx)}>Enable</Button>
                    </span>
                  ))}
                </div>
              )}
              {/* Add new color (combined color support) */}
              <div className="flex flex-col gap-2 mt-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center gap-2">
                  <Input placeholder="Color name" value={form.newColor.name} onChange={e => handleNewColorNameChange(e.target.value)} className="w-32 rounded-md border-gray-200 focus:border-mars-400" />
                  <Button size="sm" variant="outline" className="text-mars-600 border-mars-200 hover:bg-mars-50" onClick={handleAddColorStop}>+ Stop</Button>
                  <Button size="sm" variant="outline" className="text-mars-600 border-mars-200 hover:bg-mars-50" onClick={handleAddColor}>Add Color</Button>
                </div>
                <div className="flex items-center gap-2">
                  {/* Preview swatch for combined color */}
                  <span className="w-8 h-8 rounded-full border mr-2 inline-block align-middle" style={getColorCircleStyle(form.newColor.value)} />
                  {Array.isArray(form.newColor.value) && form.newColor.value.map((val, idx) => (
                    <span key={idx} className="flex items-center gap-1">
                      <Input
                        value={val}
                        onChange={e => handleNewColorValueChange(idx, e.target.value)}
                        onBlur={e => {
                          // On blur, auto-correct to normalized hex or revert to previous valid
                          const norm = normalizeHex(e.target.value);
                          if (norm) {
                            handleNewColorValueChange(idx, norm);
                          } else {
                            // revert to previous valid value
                            setForm(f => ({
                              ...f,
                              newColor: {
                                ...f.newColor,
                                value: Array.isArray(f.newColor.value)
                                  ? f.newColor.value.map((v, i) => (i === idx ? "#000000" : v))
                                  : ["#000000"],
                              },
                            }));
                            setColorInputErrors(e => ({ ...e, [idx]: false }));
                          }
                        }}
                        className={`text-xs font-mono w-24 text-center border ${colorInputErrors[idx] ? 'border-red-500' : ''}`}
                        maxLength={7}
                        pattern="#?[0-9A-Fa-f]{6}"
                        autoComplete="off"
                      />
                      {colorInputErrors[idx] && (
                        <span className="text-xs text-red-500 mt-1">Invalid hex color</span>
                      )}
                      {form.newColor.value.length > 1 && (
                        <Button size="icon" variant="ghost" className="hover:bg-mars-50" onClick={() => handleRemoveColorStop(idx)} title="Remove stop">
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </span>
                  ))}
                </div>
                <Button size="sm" variant="outline" className="text-mars-600 border-mars-200 hover:bg-mars-50"><ImageIcon className="h-4 w-4" />Add Photo</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <DialogFooter className="flex flex-row justify-end gap-3 pt-6 border-t border-gray-100 mt-8">
          <Button variant="outline" className="rounded-lg px-6 py-2 text-gray-600 border-gray-300 hover:bg-gray-100" onClick={onClose}>Cancel</Button>
          <Button className="bg-mars-600 hover:bg-mars-700 text-white rounded-lg px-6 py-2 font-semibold shadow-sm" onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog; 