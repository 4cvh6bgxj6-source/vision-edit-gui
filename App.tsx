
import React, { useState, useRef, useCallback } from 'react';
import { geminiService } from './services/geminiService';
import { PRESET_FILTERS } from './constants';
import { ImageState } from './types';
import Button from './components/Button';

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
      setError("Si è verificato un errore durante la modifica dell'immagine. Riprova.");
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
    <div className="min-h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/50 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">V</div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
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

      <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 border-r border-slate-800 bg-slate-900/30 overflow-y-auto custom-scrollbar p-6 space-y-8 order-2 lg:order-1">
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Comandi AI</h2>
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Es: Aggiungi degli occhiali da sole o cambia lo sfondo in una foresta..."
                className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-500"
              />
              <Button 
                className="w-full" 
                onClick={() => processEdit(prompt)}
                isLoading={isProcessing}
                disabled={!prompt.trim() || !imageState.current}
              >
                Applica Modifica
              </Button>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Filtri Rapidi</h2>
            <div className="grid grid-cols-2 gap-3">
              {PRESET_FILTERS.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => processEdit(filter.prompt)}
                  disabled={!imageState.current || isProcessing}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/40 border border-slate-700 hover:bg-slate-700/60 hover:border-slate-500 transition-all group disabled:opacity-50 disabled:hover:bg-slate-800/40"
                >
                  <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{filter.icon}</span>
                  <span className="text-xs font-medium text-slate-300">{filter.label}</span>
                </button>
              ))}
            </div>
          </div>

          {imageState.current && (
            <div className="pt-4 border-t border-slate-800">
              <Button variant="outline" className="w-full text-red-400 hover:text-red-300" onClick={resetAll}>
                Nuova Immagine
              </Button>
            </div>
          )}
        </aside>

        {/* Workspace */}
        <section className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-4 lg:p-12 overflow-hidden order-1 lg:order-2">
          {!imageState.current ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="max-w-xl w-full aspect-square border-2 border-dashed border-slate-700 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-all">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-slate-200">Carica una foto per iniziare</p>
                <p className="text-sm text-slate-500 mt-1">Trascina un file o clicca per sfogliare</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload}
              />
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center group">
              <div className="relative max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-slate-800">
                <img 
                  src={imageState.current} 
                  alt="Current preview" 
                  className={`max-w-full max-h-full object-contain transition-opacity duration-500 ${isProcessing ? 'opacity-50 blur-sm' : 'opacity-100'}`}
                />
                
                {isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                    <div className="p-6 glass-panel rounded-2xl flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                      <p className="text-sm font-medium animate-pulse text-blue-400 tracking-wide uppercase">Elaborazione AI...</p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-900/80 border border-red-500 text-red-200 text-sm rounded-lg backdrop-blur-md">
                  {error}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Footer Info */}
      <footer className="h-8 px-6 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-900 bg-slate-950">
        <div>Modifica Immagini con Gemini 2.5 Flash Image</div>
        <div>Made with ❤️ by VisionEdit</div>
      </footer>
    </div>
  );
};

export default App;
