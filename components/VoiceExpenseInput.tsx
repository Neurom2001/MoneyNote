
import React, { useState, useRef } from 'react';
import { Mic, Loader2, Check, X, ArrowRight, AlertCircle, FileText } from 'lucide-react';
import { TransactionType } from '../types';

interface AIParsedTransaction {
  label: string;
  amount: number;
  type: TransactionType;
  category: string;
}

interface VoiceExpenseInputProps {
  onTransactionsConfirmed: (transactions: AIParsedTransaction[]) => void;
}

const VoiceExpenseInput: React.FC<VoiceExpenseInputProps> = ({ onTransactionsConfirmed }) => {
  const [status, setStatus] = useState<'idle' | 'recording' | 'transcribing' | 'analyzing'>('idle');
  const [parsedData, setParsedData] = useState<AIParsedTransaction[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setStatus('recording');
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Microphone access denied or not available.");
      setStatus('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setStatus('transcribing');
    try {
      // 1. Convert Blob to Base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        
        if (!base64Audio) {
            console.error("Failed to convert audio");
            setStatus('idle');
            return;
        }

        try {
          // 2. Transcribe Audio
          const transcribeRes = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: base64Audio, mimeType: audioBlob.type }),
          });
          const transcribeData = await transcribeRes.json();
          
          if (!transcribeData.text) throw new Error(transcribeData.error || "Transcription failed");

          // 3. Analyze/Parse Text
          setStatus('analyzing');
          const parseRes = await fetch('/api/parse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: transcribeData.text }),
          });
          const parseData = await parseRes.json();

          if (parseData.transactions && parseData.transactions.length > 0) {
              setParsedData(parseData.transactions);
              setShowReviewModal(true);
              setStatus('idle');
          } else {
              alert("Could not find any transactions in audio.");
              setStatus('idle');
          }

        } catch (err: any) {
            console.error("API Error:", err);
            alert("Error: " + err.message);
            setStatus('idle');
        }
      };
    } catch (e) {
      console.error("Error processing audio", e);
      setStatus('idle');
    }
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.type === 'touchstart') e.preventDefault();
    if (status === 'idle') startRecording();
  };

  const handleStop = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.type === 'touchend') e.preventDefault();
    if (status === 'recording') stopRecording();
  };

  const handleConfirm = () => {
    onTransactionsConfirmed(parsedData);
    setShowReviewModal(false);
    setParsedData([]);
  };

  return (
    <>
      {/* Microphone Button */}
      <div className="flex flex-col items-center gap-2 relative z-50">
        <button
          onMouseDown={handleStart}
          onMouseUp={handleStop}
          onMouseLeave={handleStop}
          onTouchStart={handleStart}
          onTouchEnd={handleStop}
          disabled={status !== 'idle' && status !== 'recording'}
          className={`
            relative flex items-center justify-center p-4 rounded-full shadow-lg transition-all duration-200 select-none
            ${status === 'recording' 
              ? 'bg-red-500 text-white scale-110 shadow-red-500/40 ring-4 ring-red-500/20' 
              : (status === 'transcribing' || status === 'analyzing')
                ? 'bg-amber-500 cursor-wait animate-pulse' 
                : 'bg-slate-700 dark:bg-slate-600 text-white hover:bg-slate-800'
            }
          `}
          title="Hold to Speak"
          style={{ touchAction: 'none' }}
        >
          {(status === 'transcribing' || status === 'analyzing') ? (
            <Loader2 size={24} className="animate-spin text-white" />
          ) : status === 'recording' ? (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>
              <Mic size={24} className="animate-pulse" />
            </>
          ) : (
            <Mic size={24} />
          )}
        </button>
        
        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest opacity-80 bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
          {status === 'idle' && 'Hold to Speak'}
          {status === 'recording' && 'Recording...'}
          {status === 'transcribing' && 'Transcribing...'}
          {status === 'analyzing' && 'AI Analyzing...'}
        </span>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 transform transition-all scale-100">
               <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                   <div className="flex items-center gap-3">
                       <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                           <FileText className="text-emerald-600 dark:text-emerald-400" size={20} />
                       </div>
                       <h3 className="font-bold text-slate-900 dark:text-white text-lg">Review Transactions</h3>
                   </div>
                   <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={24} /></button>
               </div>

               <div className="space-y-3 max-h-[60vh] overflow-y-auto mb-6 pr-1">
                   {parsedData.map((item, idx) => (
                       <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600">
                           <div className="flex flex-col">
                               <span className="font-bold text-slate-800 dark:text-white">{item.label}</span>
                               <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                   {item.category} <ArrowRight size={10}/> {item.type}
                               </span>
                           </div>
                           <span className={`font-bold text-lg ${item.type === 'INCOME' ? 'text-emerald-500' : 'text-red-500'}`}>
                               {item.type === 'INCOME' ? '+' : '-'}{item.amount.toLocaleString()}
                           </span>
                       </div>
                   ))}
               </div>

               <div className="flex gap-3">
                   <button 
                     onClick={() => setShowReviewModal(false)} 
                     className="flex-1 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleConfirm} 
                     className="flex-1 py-3.5 rounded-xl bg-emerald-500 text-slate-900 font-bold hover:bg-emerald-400 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                   >
                     <Check size={18} /> Confirm & Save
                   </button>
               </div>
           </div>
        </div>
      )}
    </>
  );
};

export default VoiceExpenseInput;
