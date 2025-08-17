
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { UploadCloud, X, Loader2, Type, Droplet, Palette, Expand, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useContent } from '@/providers/content-provider';
import { cn } from '@/lib/utils';
import { useGesture } from '@use-gesture/react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { type StoryItem, type CaptionConfig } from '@/lib/types';
import { useTheme } from 'next-themes';
import imageCompression from 'browser-image-compression';

const mainBgColors = [
  // Whites & Greys
  '#FFFFFF', '#F1FAEE', '#E5E5E5', '#CAD2C5', '#A8DADC',
  // Yellows & Oranges
  '#FDFD96', '#FFD8BE', '#e76f51',
  // Pinks & Reds
  '#FADADD', '#E63946',
  // Greens & Teals
  '#C1E1C1', '#A4C3B2', '#84A98C', '#6B9080', '#52796F', '#354F52', '#2a9d8f',
  // Blues & Purples
  '#BDE0FE', '#E0BBE4', '#457B9D', '#1D3557',
  // Black
  '#1A1A1A', '#000000',
];

const textBgColors = [
  '#FFFFFF', '#F1FAEE', '#E5E5E5', '#A8DADC', '#E63946', '#1D3557', '#1A1A1A', '#000000',
];

const colorPalettes = {
  text: [...new Set(['#FFFFFF', '#F1FAEE', '#E5E5E5', '#CAD2C5', '#A8DADC', '#FDFD96', '#FFD8BE', '#FADADD', '#C1E1C1', '#A4C3B2', '#84A98C', '#BDE0FE', '#E0BBE4', '#e76f51', '#E63946', '#6B9080', '#52796F', '#354F52', '#2a9d8f', '#457B9D', '#1D3557', '#1A1A1A', '#000000'])],
  textBg: textBgColors,
  mainBg: mainBgColors,
};

type ActiveEditingTool = 'text' | 'textBg' | 'mainBg' | 'mediaScale' | 'textScale' | null;


const EditableCaption = ({
  caption,
  isSelected,
  onSelect,
  onChange,
  onRemove,
}: {
  caption: CaptionConfig;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<CaptionConfig>) => void;
  onRemove: () => void;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [caption.text, caption.fontSize]);

  useEffect(() => {
    if (isSelected && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isSelected]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({ text: e.target.value });
  };
  
  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    onSelect();
    if (caption.text === 'Your Text') {
      onChange({ text: '' });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (e.target.value.trim() === '') {
      onChange({ text: 'Your Text' });
    }
  };

  const bind = useGesture(
    {
      onDrag: ({ pinching, offset: [dx, dy] }) => {
        if (pinching) return;
        onChange({ x: dx, y: dy });
      },
    },
    {
      drag: { from: () => [caption.x, caption.y], filterTaps: true, pointer: { keys: false } },
    }
  );

  return (
    <div
      {...bind()}
      className="absolute z-20 cursor-grab active:cursor-grabbing touch-none"
      style={{
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) translate(${caption.x}px, ${caption.y}px) rotate(${caption.rotation || 0}deg)`,
        width: 'calc(100% - 32px)',
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div
        className={cn(
          "relative w-full",
          isSelected && "ring-2 ring-offset-2 ring-offset-black/50 ring-white rounded-lg"
        )}
      >
        <textarea
          ref={textareaRef}
          value={caption.text === 'Your Text' && !isSelected ? '' : caption.text}
          placeholder={isSelected ? '' : 'Your Text'}
          onChange={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="w-full m-0 overflow-hidden text-center bg-transparent border-0 resize-none outline-none font-bold placeholder:text-current"
          style={{
            fontSize: `${caption.fontSize}rem`,
            lineHeight: 1.4,
            color: caption.color,
            backgroundColor: caption.hasBackground ? caption.backgroundColor : 'transparent',
            borderRadius: '0.5rem',
            padding: '0.375rem 0.75rem',
            textShadow: !caption.hasBackground ? '1px 1px 4px rgba(0,0,0,0.7)' : 'none',
          }}
          dir="ltr"
          rows={1}
        />
        {isSelected && (
          <button
            type="button"
            className="absolute -top-2 -right-2 z-30 cursor-pointer rounded-full bg-destructive p-0.5 hover:bg-destructive/75"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <X className="h-3 w-3 text-destructive-foreground" />
          </button>
        )}
      </div>
    </div>
  );
};


interface StoryUploaderProps {
  onSuccess?: (newItemId: string) => void;
  onClose?: () => void;
}

export function StoryUploader({ onSuccess, onClose }: StoryUploaderProps) {
  const { toast } = useToast();
  const { addStoryItem } = useContent();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  
  const [captions, setCaptions] = useState<CaptionConfig[]>([]);
  const [activeCaptionId, setActiveCaptionId] = useState<string | null>(null);
  const activeCaption = captions.find(c => c.id === activeCaptionId);

  const { resolvedTheme } = useTheme();
  const [bgColor, setBgColor] = useState(resolvedTheme === 'dark' ? '#000000' : '#FFFFFF');
  const [activeEditingTool, setActiveEditingTool] = useState<ActiveEditingTool>(null);

  const [mediaScale, setMediaScale] = useState(1);
  const [mediaPosition, setMediaPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setBgColor(resolvedTheme === 'dark' ? '#000000' : '#FFFFFF');
  }, [resolvedTheme]);

  useGesture({
    onDrag: ({ pinching, offset: [dx, dy] }) => !pinching && setMediaPosition({ x: dx, y: dy }),
    onPinch: ({ offset: [d] }) => setMediaScale(1 + d / 200),
  }, { target: mediaRef, eventOptions: { passive: false }, drag: { from: () => [mediaPosition.x, mediaPosition.y] }, pinch: { from: () => [(mediaScale - 1) * 200, 0] } });


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type.startsWith('image/')) {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };
        try {
            const compressedFile = await imageCompression(selectedFile, options);
            console.log(`Original image size: ${selectedFile.size / 1024 / 1024} MB`);
            console.log(`Compressed image size: ${compressedFile.size / 1024 / 1024} MB`);

            setFile(compressedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(compressedFile);

        } catch (error) {
            console.error('Image compression error:', error);
            toast({ variant: 'destructive', title: 'Compression Failed', description: 'Could not compress the image. Please try another file.' });
            setFile(selectedFile); // Fallback to original file
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        }
    } else { // It's a video
        if (selectedFile.size > 20 * 1024 * 1024) { // 20MB limit
            toast({ variant: 'destructive', title: 'File too large', description: 'Please select a file smaller than 20MB.' });
            return;
        }
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
    }
  };
  
  const handlePost = async () => {
      if (!file) {
          toast({ variant: 'destructive', title: 'No file selected', description: 'Please select a file to post.' });
          return;
      }
      setIsUploading(true);
      try {
          const newItem = await addStoryItem(file, {
            captionConfigs: captions.map(c => ({...c, text: c.text === 'Your Text' ? '' : c.text})),
            mediaConfig: {
              scale: mediaScale,
              x: mediaPosition.x,
              y: mediaPosition.y,
              bgColor: bgColor,
            }
          });
          toast({ title: 'Story Posted!', description: 'Your story is now live for 24 hours.' });
          if (onSuccess) onSuccess(newItem.id);
          if (onClose) onClose();
      } catch (error: any) {
          console.error(error);
          toast({ variant: 'destructive', title: 'Upload Failed', description: error.message || 'Could not post your story.' });
      } finally {
          setIsUploading(false);
      }
  };
  
  const addCaption = () => {
    const newCaption: CaptionConfig = {
      id: `caption-${Date.now()}`,
      text: 'Your Text',
      color: resolvedTheme === 'dark' ? '#FFFFFF' : '#1A1A1A',
      backgroundColor: '#000000',
      hasBackground: false,
      x: 0,
      y: 0,
      fontSize: 1.125,
      rotation: 0,
    };
    setCaptions(prev => [...prev, newCaption]);
    setActiveCaptionId(newCaption.id);
    setActiveEditingTool('text');
  };

  const updateActiveCaption = (updates: Partial<CaptionConfig>) => {
    if (!activeCaptionId) return;
    setCaptions(prev => prev.map(c => 
      c.id === activeCaptionId ? { ...c, ...updates } : c
    ));
  };


  const ColorSwatches = ({ colors, onSelect, selectedColor }: { colors: string[], onSelect: (color: string) => void, selectedColor: string }) => (
    <div className="flex flex-wrap gap-2 py-2 px-1">
        {colors.map(color => (
            <Button key={color} variant="outline" size="icon" className={cn("h-8 w-8 rounded-full", selectedColor === color && "ring-2 ring-foreground ring-offset-2 ring-offset-background")} onClick={() => onSelect(color)}>
                <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: color }}/>
            </Button>
        ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <DialogHeader>
        <DialogTitle>Add to Your Story</DialogTitle>
        <DialogDescription>
          Drag and resize content. Tap text to edit.
        </DialogDescription>
      </DialogHeader>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 py-4">
        <div 
          className={cn(
            "relative w-full aspect-[9/16] md:max-w-sm md:mx-auto rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0",
             (resolvedTheme === 'dark' ? "bg-black" : "bg-white")
          )}
          style={{ backgroundColor: previewUrl ? bgColor : undefined }}
          onClick={() => {
              setActiveCaptionId(null);
              setActiveEditingTool(null);
          }}
        >
            {previewUrl && file ? (
                <>
                    <div 
                        ref={mediaRef}
                        className="absolute w-full h-full touch-none"
                        style={{
                            transform: `translate(${mediaPosition.x}px, ${mediaPosition.y}px) scale(${mediaScale})`,
                            transition: 'transform 0.05s ease-out'
                        }}
                    >
                    {file.type.startsWith('image/') ? (
                        <Image 
                            src={previewUrl}
                            alt="Preview"
                            fill={true}
                            style={{objectFit: "contain"}}
                            className="pointer-events-none"
                            draggable={false}
                        />
                    ) : (
                        <video
                            src={previewUrl}
                            controls={false}
                            autoPlay
                            muted
                            loop
                            className="pointer-events-none w-full h-full object-contain"
                        />
                    )}
                    </div>
                   
                    {captions.map((caption) => (
                      <EditableCaption
                        key={caption.id}
                        caption={caption}
                        isSelected={activeCaptionId === caption.id}
                        onSelect={() => {
                          setActiveCaptionId(caption.id);
                          setActiveEditingTool('text');
                        }}
                        onChange={(updates) => {
                          setCaptions(prev => prev.map(c => c.id === caption.id ? {...c, ...updates} : c))
                        }}
                        onRemove={() => {
                          setCaptions(prev => prev.filter(c => c.id !== caption.id));
                          if(activeCaptionId === caption.id) {
                            setActiveCaptionId(null);
                            setActiveEditingTool(null);
                          }
                        }}
                      />
                    ))}


                    <Button 
                        type="button" 
                        variant="destructive" 
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 z-30"
                        onClick={() => {
                          setFile(null);
                          setPreviewUrl(null);
                          setCaptions([]);
                          setActiveCaptionId(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </>
            ) : (
                <div 
                    className={cn(
                      "flex flex-col items-center justify-center w-full h-full cursor-pointer transition-colors",
                      resolvedTheme === 'dark' ? "hover:bg-black" : "hover:bg-white",
                      bgColor
                    )}
                    onClick={() => fileInputRef.current?.click()}
                    style={{ backgroundColor: bgColor}}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,video/mp4,video/webm"
                    />
                    <UploadCloud className={cn("h-8 w-8", resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600')} />
                    <p className={cn("mt-2 text-sm", resolvedTheme === 'dark' ? 'text-gray-400' : 'text-gray-600')}>Click to upload a file</p>
                    <p className={cn("text-xs", resolvedTheme === 'dark' ? 'text-gray-500' : 'text-gray-500')}>PNG, JPG, GIF, MP4, WEBM</p>
                </div>
            )}
        </div>

        {previewUrl && (
            <div className="space-y-4 px-1">
                 <div className='grid grid-cols-2 gap-2'>
                    <Button variant="outline" onClick={addCaption}><PlusCircle className='mr-2'/>Add Caption</Button>
                    <Button variant="outline" className={cn(activeEditingTool === 'mediaScale' && "bg-muted")} onClick={() => setActiveEditingTool('mediaScale')}><Expand className='mr-2'/>Media Size</Button>
                    <Button variant="outline" className={cn(activeEditingTool === 'text' && "bg-muted")} onClick={() => setActiveEditingTool('text')} disabled={!activeCaption}><Type className='mr-2'/>Text Color</Button>
                    <Button variant="outline" className={cn(activeEditingTool === 'textScale' && "bg-muted")} onClick={() => setActiveEditingTool('textScale')} disabled={!activeCaption}><Type className='mr-2'/>Text Size</Button>
                    <Button variant="outline" className={cn(activeEditingTool === 'mainBg' && "bg-muted")} onClick={() => setActiveEditingTool('mainBg')}><Palette className='mr-2'/>BG Color</Button>
                    <Button variant="outline" className={cn(activeEditingTool === 'textBg' && "bg-muted")} onClick={() => setActiveEditingTool('textBg')} disabled={!activeCaption}><Droplet className='mr-2'/>Text BG</Button>
                </div>


                {activeEditingTool === 'text' && activeCaption && (
                    <div className="flex items-center gap-4">
                      <div className="flex-grow">
                        <ColorSwatches colors={colorPalettes.text} onSelect={(color) => updateActiveCaption({ color })} selectedColor={activeCaption.color} />
                      </div>
                    </div>
                )}
                {activeEditingTool === 'textBg' && activeCaption && (
                  <>
                      <div className="flex items-center space-x-2">
                          <Label htmlFor="caption-bg-switch" className="text-sm">Caption BG</Label>
                          <Switch id="caption-bg-switch" checked={activeCaption?.hasBackground} onCheckedChange={(checked) => updateActiveCaption({ hasBackground: checked })} disabled={!activeCaption}/>
                      </div>
                      {activeCaption.hasBackground && <ColorSwatches colors={colorPalettes.textBg} onSelect={(backgroundColor) => updateActiveCaption({ backgroundColor })} selectedColor={activeCaption.backgroundColor} />}
                  </>
                )}
                {activeEditingTool === 'mainBg' && <ColorSwatches colors={colorPalettes.mainBg} onSelect={setBgColor} selectedColor={bgColor} />}

                {activeEditingTool === 'mediaScale' && (
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-sm">Media Size</Label>
                        <div className="flex items-center gap-2">
                            <Expand className="text-muted-foreground h-4 w-4" />
                            <Slider value={[mediaScale]} onValueChange={(v) => setMediaScale(v[0])} min={0.5} max={2.5} step={0.01} />
                            <Expand className="text-muted-foreground h-6 w-6"/>
                        </div>
                    </div>
                )}
                
                {activeEditingTool === 'textScale' && activeCaption && (
                  <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm">Text Size</Label>
                      <div className="flex items-center gap-2">
                          <Type className="text-muted-foreground h-4 w-4" />
                          <Slider value={[activeCaption.fontSize]} onValueChange={(v) => updateActiveCaption({ fontSize: v[0] })} min={0.5} max={3} step={0.05} />
                          <Type className="text-muted-foreground h-6 w-6" />
                      </div>
                  </div>
                )}
            </div>
        )}
      </div>
      
      <DialogFooter className='pt-4'>
        <DialogClose asChild>
            <Button variant="ghost" onClick={onClose} disabled={isUploading}>Cancel</Button>
        </DialogClose>
        <Button onClick={handlePost} disabled={!file || isUploading} className="gradient-border text-foreground">
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Story
        </Button>
      </DialogFooter>
    </div>
  );
}
