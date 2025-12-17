
import React from 'react';
import { FilterOption } from './types';

export const PRESET_FILTERS: FilterOption[] = [
  { id: 'b&w', label: 'Bianco e Nero', prompt: 'Converti questa immagine in un bianco e nero artistico ad alto contrasto.', icon: '🌓' },
  { id: 'watercolor', label: 'Acquerello', prompt: 'Trasforma questa immagine in un dipinto ad acquerello delicato.', icon: '🎨' },
  { id: 'cyberpunk', label: 'Cyberpunk', prompt: 'Applica uno stile cyberpunk con luci al neon blu e rosa.', icon: '🌃' },
  { id: 'sketch', label: 'Schizzo', prompt: 'Trasforma questa immagine in uno schizzo a matita dettagliato.', icon: '✏️' },
  { id: 'vintage', label: 'Vintage', prompt: 'Applica un effetto pellicola vintage anni 70 con grana e colori caldi.', icon: '🎞️' },
  { id: 'pixel', label: 'Pixel Art', prompt: 'Trasforma l\'immagine in pixel art in stile videogioco retro.', icon: '👾' },
];

export const SYSTEM_INSTRUCTION = "Sei un esperto editor di immagini AI. Quando ricevi un'immagine e una richiesta di modifica, genera una nuova immagine che rifletta accuratamente i cambiamenti richiesti mantenendo la composizione originale dove possibile.";
