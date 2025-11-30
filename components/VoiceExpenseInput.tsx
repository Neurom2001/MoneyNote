
import React, { useState, useRef } from 'react';
import { Mic, Check, X, Trash2, FileText, Save } from 'lucide-react';
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

// We keep this list for the AI logic, but we hide the dropdown in this version of the UI
const CATEGORY_OPTIONS = [
  "Food", "Transport", "Shopping", "Health", "Bills/Internet", 
  "Phone Bill", "Gift/Donation", "Work", "Education", "General",
  "Salary", "Bonus", "Business/Sales", "Allowance", "Refund"
];

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

  // --- Editable Logic ---

  const updateTransaction = (index: number, field: keyof AIParsedTransaction, value: any) => {
    setParsedData(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  const removeTransaction = (index: number) => {
    setParsedData(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-3 relative z-50 h-32 w-32">
        {(status === 'transcribing' || status === 'analyzing') ? (
            <div className="flex flex-col items-center gap-2" aria-live="assertive">
                <div className="dots-animation flex items-center justify-center gap-1.5 h-8">
                    <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    လုပ်ဆောင်နေသည်...
                </span>
            </div>
        ) : (
            <button
                onMouseDown={handleStart}
                onMouseUp={handleStop}
                onMouseLeave={handleStop}
                onTouchStart={handleStart}
                onTouchEnd={handleStop}
                className={`
                    relative flex items-center justify-center w-20 h-20 rounded-full shadow-xl transition-all duration-300 ease-in-out select-none focus:outline-none
                    ${status === 'recording'
                        ? 'bg-gradient-to-br from-red-500 to-red-600 text-white transform scale-120'
                        : 'bg-slate-700 dark:bg-slate-600 text-white hover:bg-slate-800'
                    }
                `}
                title="Hold to Speak"
                style={{ touchAction: 'none' }}
            >
                {status === 'recording' && (
                    <div className="absolute inset-0 rounded-full bg-red-500/50 sound-wave z-0"></div>
                )}
                <Mic size={32} className="relative z-10" />
            </button>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 transform transition-all scale-100 flex flex-col max-h-[90vh]">
               <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700 pb-3 shrink-0">
                   <div className="flex items-center gap-3">
                       <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                           <FileText className="text-emerald-600 dark:text-emerald-400" size={20} />
                       </div>
                       <h3 className="font-bold text-slate-900 dark:text-white text-lg">Confirm Transactions</h3>
                   </div>
                   <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={24} /></button>
               </div>

               <div className="space-y-3 overflow-y-auto pr-1 flex-grow mb-4">
                   {parsedData.length === 0 ? (
                       <p className="text-center text-slate-500 py-4">No transactions found.</p>
                   ) : (
                       parsedData.map((item, idx) => (
                           <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 group">
                               
                               {/* 1. Description (Wide) */}
                               <div className="flex-grow">
                                   <input 
                                     type="text" 
                                     value={item.label}
                                     onChange={(e) => updateTransaction(idx, 'label', e.target.value)}
                                     className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 placeholder-slate-400"
                                     placeholder="Description"
                                   />
                               </div>

                               {/* 2. Type (Compact) */}
                               <div className="shrink-0">
                                   <select
                                     value={item.type}
                                     onChange={(e) => updateTransaction(idx, 'type', e.target.value)}
                                     className={`rounded-lg border px-1 py-2 text-xs font-bold focus:outline-none cursor-pointer ${item.type === TransactionType.INCOME ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30'}`}
                                   >
                                       <option value={TransactionType.EXPENSE}>EXP</option>
                                       <option value={TransactionType.INCOME}>INC</option>
                                   </select>
                               </div>

                               {/* 3. Amount */}
                               <div className="w-24 shrink-0">
                                   <input 
                                     type="number" 
                                     value={item.amount}
                                     onChange={(e) => updateTransaction(idx, 'amount', parseFloat(e.target.value))}
                                     className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-2 text-sm font-bold text-slate-800 dark:text-white text-right focus:outline-none focus:border-emerald-500"
                                   />
                               </div>

                               {/* 4. Delete */}
                               <button 
                                 onClick={() => removeTransaction(idx)}
                                 className="p-2 text-slate-400 hover:text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg shrink-0"
                               >
                                   <Trash2 size={18} />
                               </button>
                           </div>
                       ))
                   )}
               </div>

               <div className="flex gap-3 shrink-0">
                   <button 
                     onClick={() => setShowReviewModal(false)} 
                     className="flex-1 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleConfirm} 
                     disabled={parsedData.length === 0}
                     className="flex-1 py-3.5 rounded-xl bg-emerald-500 text-slate-900 font-bold hover:bg-emerald-400 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <Save size={18} /> Save All
                   </button>
               </div>
           </div>
        </div>
      )}
    </>
  );
};

export default VoiceExpenseInput;
