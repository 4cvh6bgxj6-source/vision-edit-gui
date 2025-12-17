
import React, { useState, useRef } from 'react';
import { geminiService } from './services/geminiService.ts';
import { PRESET_FILTERS } from './constants.tsx';
import { ImageState } from './types.ts';
import Button from './components/Button.tsx';

const App: React.FC = () => {
  const [imageState, setImageState] = useState<ImageState>({
    original: null,
    current: null,
    history: []
  });
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setImageState({
          original: base64,
          current: base64,
          history: [base64]
        });
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processEdit = async (editPrompt: string) => {
    if (!imageState.current) return;

    setIsProcessing(true);
    setError(null);
    try {
      const mimeType = imageState.current.split(';')[0].split(':')[1];
      const result = await geminiService.editImage({
        image: imageState.current,
        prompt: editPrompt,
        mimeType
      });

      setImageState(prev => ({
        ...prev,
        current: result,
        history: [...prev.history, result]
      }));
      setPrompt('');
    } catch (err: any) {
      console.error("Edit failed:", err);
      setError(err.message || "Si è verificato un errore durante la modifica.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUndo = () => {
    if (imageState.history.length > 1) {
      const newHistory = [...imageState.history];
      newHistory.pop();
      const previous = newHistory[newHistory.length - 1];
      setImageState(prev => ({
        ...prev,
        current: previous,
        history: newHistory
      }));
    }
  };

  const handleDownload = () => {
    if (imageState.current) {
      const link = document.createElement('a');
      link.href = imageState.current;
      link.download = 'visionedit-ai-result.png';
      link.click();
    }
  };

  const resetAll = () => {
    setImageState({
      original: null,
      current: null,
      history: []
    });
    setPrompt('');
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">V</div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            VisionEdit AI
          </h1>
        </div>
        {imageState.current && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleUndo} disabled={imageState.history.length <= 1}>
              Annulla
            </Button>
            <Button variant="primary" size="sm" onClick={handleDownload}>
              Scarica
            </Button>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)]">
        <aside className="w-full lg:w-80 border-r border-slate-800 bg-slate-900/20 p-6 space-y-6">
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Editor AI</h2>
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Cosa vuoi cambiare?"
                className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <Button 
                className="w-full" 
                onClick={() => processEdit(prompt)}
                isLoading={isProcessing}
                disabled={!prompt.trim() || !imageState.current}
              >
                Applica
              </Button>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Presets</h2>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_FILTERS.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => processEdit(filter.prompt)}
                  disabled={!imageState.current || isProcessing}
                  className="p-3 rounded-lg bg-slate-800/40 border border-slate-700 hover:bg-slate-700 transition-colors text-center disabled:opacity-30"
                >
                  <div className="text-xl mb-1">{filter.icon}</div>
                  <div className="text-[10px] font-medium uppercase tracking-tighter">{filter.label}</div>
                </button>
              ))}
            </div>
          </div>

          {imageState.current && (
            <div className="pt-4 border-t border-slate-800">
              <Button variant="outline" className="w-full border-red-900/50 text-red-400 hover:bg-red-900/20" onClick={resetAll}>
                Rimuovi Immagine
              </Button>
            </div>
          )}
        </aside>

        <section className="flex-1 bg-slate-950 flex items-center justify-center p-4 relative">
          {!imageState.current ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="max-w-md w-full aspect-square border-2 border-dashed border-slate-700 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-blue-500 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-slate-400 font-medium">Carica una foto</p>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload}/>
            </div>
          ) : (
            <div className="relative max-w-full max-h-full flex items-center justify-center p-4">
              <img 
                src={imageState.current} 
                alt="Preview" 
                className={`max-w-full max-h-[80vh] rounded-lg shadow-2xl transition-all duration-300 ${isProcessing ? 'blur-sm opacity-50 scale-95' : 'opacity-100 scale-100'}`}
              />
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-slate-900/80 px-6 py-4 rounded-2xl border border-blue-500/50 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-blue-400 tracking-widest uppercase animate-pulse">L'AI sta creando...</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-900 text-red-100 text-xs font-bold rounded-full border border-red-500 animate-bounce">
              {error}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
