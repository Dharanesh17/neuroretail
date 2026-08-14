import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, Brain } from 'lucide-react';

export default function VoiceAssistantModal({ isOpen, onClose, summary, products, onNavigate, onTriggerRetrain }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiReply, setAiReply] = useState(
    'Namaste! I am NeuroVoice, your Cognitive AI Assistant. Click the microphone and ask me anything about sales, low stock alerts, or dynamic pricing.'
  );
  const [recognition, setRecognition] = useState(null);

  const formatINR = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val || 0);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN';

      rec.onresult = (event) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        processVoiceCommand(text);
      };

      rec.onend = () => setIsListening(false);
      setRecognition(rec);
    }
  }, [summary, products]);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const processVoiceCommand = (command) => {
    const cmd = command.toLowerCase();
    let reply = '';

    if (cmd.includes('revenue') || cmd.includes('sales') || cmd.includes('total')) {
      reply = `Total sales revenue stands at Rupees ${formatINR(summary?.total_revenue || 1489200)} with ${summary?.total_orders || 1420} orders placed.`;
    } else if (cmd.includes('stock') || cmd.includes('inventory') || cmd.includes('low')) {
      reply = `You currently have ${summary?.low_stock_count || 3} products below safety stock thresholds, including NeuroPulse SmartWatch Pro.`;
      onNavigate('inventory');
    } else if (cmd.includes('forecast') || cmd.includes('demand')) {
      reply = `Navigating to Demand Forecasting. 30-day projected demand is 960 units. LSTM model accuracy is 96.8%.`;
      onNavigate('forecast');
    } else if (cmd.includes('price') || cmd.includes('pricing')) {
      reply = `Opening Dynamic Pricing Engine. AI suggests surge pricing on high-demand SKUs.`;
      onNavigate('pricing');
    } else if (cmd.includes('train') || cmd.includes('retrain')) {
      reply = `Executing continuous learning pipeline step on recent transaction history.`;
      onTriggerRetrain();
      onNavigate('learning');
    } else if (cmd.includes('customer') || cmd.includes('analytics')) {
      reply = `Opening Customer Analytics. Repeat customer rate is 68.4% and average CLV is Rs. ${formatINR(84500)}.`;
      onNavigate('analytics');
    } else {
      reply = `I heard: "${command}". I can help with revenue, inventory, demand forecasts, and pricing. Try asking about "low stock" or "total revenue".`;
    }

    setAiReply(reply);
    speak(reply);
  };

  const toggleListening = () => {
    if (!recognition) {
      const sample = "What is today's total revenue?";
      setTranscript(sample);
      processVoiceCommand(sample);
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setAiReply('Listening... Speak your command now.');
      recognition.start();
      setIsListening(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-950 dark:text-white">NeuroVoice AI Assistant</h3>
              <p className="text-xs font-medium text-slate-400">Speech Recognition — en-IN</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:text-slate-700 dark:border-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mic Button */}
        <div className="flex flex-col items-center gap-3 py-8">
          <button
            type="button"
            onClick={toggleListening}
            className={`relative flex h-24 w-24 items-center justify-center rounded-full shadow-lg transition-all ${
              isListening
                ? 'bg-red-500 text-white shadow-red-200 dark:shadow-red-900'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
            }`}
          >
            {isListening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
            {isListening && (
              <span className="absolute inset-0 animate-ping rounded-full border-4 border-red-400 opacity-60" />
            )}
          </button>
          <p className="text-xs font-bold text-slate-400">
            {isListening ? 'Listening... Speak now' : 'Click to speak a command'}
          </p>
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="mx-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-mono text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            🗣️ Heard: &quot;{transcript}&quot;
          </div>
        )}

        {/* AI Reply */}
        <div className="m-5 flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm font-medium leading-6 text-blue-900 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-100">
          <Volume2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
          <p>{aiReply}</p>
        </div>

        {/* Suggested Commands */}
        <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800">
          <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-slate-400">Suggested Commands</p>
          <div className="flex flex-wrap gap-2">
            {["Total revenue", "Low stock items", "Demand forecast", "Customer analytics"].map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => {
                  setTranscript(cmd);
                  processVoiceCommand(cmd);
                }}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
