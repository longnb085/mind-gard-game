
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decodeBase64, encodeBase64, decodeAudioData } from '../services/geminiService';

interface VoiceDungeonProps {
  onExit: () => void;
}

const VoiceDungeon: React.FC<VoiceDungeonProps> = ({ onExit }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            console.log('Voice session opened');
            setIsActive(true);
            setIsConnecting(false);

            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              
              const pcmBlob = {
                data: encodeBase64(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000'
              };

              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decodeBase64(base64Audio),
                ctx,
                24000,
                1
              );
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            // Transcription handling
            if (message.serverContent?.outputTranscription) {
               setTranscription(prev => [...prev.slice(-4), `AI: ${message.serverContent.outputTranscription.text}`]);
            }
          },
          onerror: (e) => console.error('Live API Error:', e),
          onclose: () => setIsActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
          },
          systemInstruction: 'You are a mischievous dungeon master. Keep your narration punchy and spooky. Respond with voice only. If user stays silent, provoke them with a riddle.'
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start session:', err);
      setIsConnecting(false);
    }
  };

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsActive(false);
  }, []);

  useEffect(() => {
    return () => stopSession();
  }, [stopSession]);

  return (
    <div className="h-full flex flex-col items-center justify-center animate-fade-in py-12">
      <div className="w-full max-w-2xl text-center space-y-8">
        <div className="relative">
          <div className={`w-64 h-64 mx-auto rounded-full bg-indigo-500/10 border-4 border-indigo-500/20 flex items-center justify-center transition-all duration-500 ${isActive ? 'scale-110 shadow-[0_0_50px_rgba(99,102,241,0.4)]' : ''}`}>
             <i className={`fas fa-microphone-lines text-6xl transition-colors duration-500 ${isActive ? 'text-indigo-400' : 'text-slate-600'}`}></i>
             
             {/* Pulsing Visualizer Rings */}
             {isActive && (
               <>
                 <div className="absolute inset-0 rounded-full border-2 border-indigo-500/50 animate-[ping_2s_linear_infinite]"></div>
                 <div className="absolute inset-4 rounded-full border-2 border-cyan-500/30 animate-[ping_3s_linear_infinite_1s]"></div>
               </>
             )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl font-orbitron font-bold">Echo Dungeon</h2>
          <p className="text-slate-400">Step into the shadows. The Master is listening to your every breath.</p>
        </div>

        <div className="flex gap-4 justify-center">
          {!isActive ? (
            <button 
              onClick={startSession}
              disabled={isConnecting}
              className="px-12 py-4 rounded-2xl game-gradient font-bold text-xl shadow-xl hover:scale-105 transition-all disabled:opacity-50"
            >
              {isConnecting ? 'AWAKENING THE MASTER...' : 'ENTER THE VOID'}
            </button>
          ) : (
            <button 
              onClick={stopSession}
              className="px-12 py-4 rounded-2xl bg-rose-600 font-bold text-xl shadow-xl hover:bg-rose-500 transition-all"
            >
              FLEE THE DUNGEON
            </button>
          )}
          
          <button onClick={onExit} className="px-8 py-4 rounded-2xl bg-slate-800 border border-slate-700 font-bold text-xl hover:bg-slate-700 transition-all">
            EXIT
          </button>
        </div>

        {/* Live Logs */}
        <div className="h-40 glass rounded-2xl p-6 overflow-hidden flex flex-col justify-end text-left border border-white/5">
           <p className="text-xs text-indigo-400 font-orbitron mb-2 uppercase tracking-widest opacity-50">Dungeon Transmission</p>
           {transcription.length === 0 ? (
             <p className="text-slate-600 italic">Silence fills the chamber...</p>
           ) : (
             transcription.map((t, i) => (
               <p key={i} className="text-sm text-slate-300 animate-in fade-in slide-in-from-left-2">{t}</p>
             ))
           )}
        </div>
      </div>
    </div>
  );
};

export default VoiceDungeon;
