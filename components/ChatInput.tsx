import React, { useRef, useEffect } from 'react';
import { ArrowUp, Mic, Radio, Image as ImageIcon, X } from 'lucide-react';
import { LiveState } from '../services/live';

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  isLoading: boolean;
  isDictating: boolean;
  onDictate: () => void;
  liveState: LiveState;
  onLiveToggle: () => void;
  placeholder: string;
  isCentered?: boolean;
  suggestions: string[];
  onSuggestionClick: (s: string) => void;
  lang: 'en' | 'ar';
  selectedImage?: string | null;
  onImageSelect?: (base64: string | null) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  isLoading,
  isDictating,
  onDictate,
  liveState,
  onLiveToggle,
  placeholder,
  isCentered = false,
  suggestions,
  onSuggestionClick,
  lang,
  selectedImage,
  onImageSelect
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && !liveState.isConnected) {
      inputRef.current?.focus();
    }
  }, [isLoading, liveState.isConnected]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageSelect) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasContent = value.trim().length > 0 || !!selectedImage;

  return (
    <div className={`w-full mx-auto transition-all duration-300 ${isCentered ? 'max-w-2xl' : 'max-w-3xl'}`}>
      
      {/* Quiet Apple Prompt Suggestions */}
      {!isLoading && !liveState.isConnected && suggestions.length > 0 && !selectedImage && (
        <div 
          className={`flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 mb-1.5 no-scrollbar ${isCentered ? 'justify-center flex-wrap' : ''}`}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          {suggestions.map((s, i) => (
            <button 
              key={i}
              onClick={() => onSuggestionClick(s)}
              className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-neutral-100/80 dark:bg-neutral-800/60 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/60 transition-colors border border-black/[0.04] dark:border-white/[0.06] whitespace-nowrap shrink-0"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Image Preview Thumbnail */}
      {selectedImage && (
        <div className="mb-2 sm:mb-3 relative inline-block animate-in fade-in zoom-in-95 duration-200">
          <img 
            src={selectedImage} 
            alt="Selected preview" 
            className="h-16 sm:h-20 w-auto rounded-xl sm:rounded-2xl object-cover border border-black/[0.08] dark:border-white/[0.12] shadow-sm"
          />
          <button 
            onClick={() => onImageSelect && onImageSelect(null)}
            className="absolute -top-1.5 -right-1.5 bg-neutral-800 text-white rounded-full p-1 hover:bg-neutral-900 transition-colors shadow-md"
            aria-label="Remove image"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Floating Apple-Style Input Capsule */}
      <div 
        className={`relative flex items-center transition-all duration-300 rounded-[24px] sm:rounded-[28px] bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.12] shadow-lg shadow-black/[0.03] ${
          isCentered ? 'py-1.5 sm:py-2 px-2.5 sm:px-3 shadow-xl' : 'py-1 sm:py-1.5 px-2 sm:px-3'
        } ${liveState.isConnected ? 'ring-2 ring-[#0071E3]/40 bg-blue-50/20 dark:bg-blue-950/20' : ''} ${
          isDictating ? 'ring-2 ring-emerald-500/40' : ''
        }`}
      >
        {/* Left Action: Image attachment */}
        {!liveState.isConnected && onImageSelect && (
          <div className="flex items-center shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className={`p-1.5 sm:p-2 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors ${
                selectedImage ? 'text-[#0071E3]' : ''
              }`}
              title={lang === 'ar' ? 'إرفاق صورة أو مخطط' : 'Attach image'}
            >
              <ImageIcon className="w-4 h-4 stroke-[1.8]" />
            </button>
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept="image/png, image/jpeg, image/webp" 
          onChange={handleFileChange}
        />

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            liveState.isConnected 
              ? (lang === 'ar' ? 'محادثة صوتية نشطة...' : 'Live conversation active...') 
              : isDictating 
              ? (lang === 'ar' ? 'جاري الاستماع...' : 'Listening...') 
              : placeholder
          }
          className="flex-1 min-w-0 bg-transparent border-0 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-0"
          disabled={isLoading || liveState.isConnected || isDictating}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        />

        {/* Right Actions: Voice Dictation, Live Voice, Send */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          {/* Dictation */}
          {!liveState.isConnected && (
            <button
              onClick={onDictate}
              className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                isDictating 
                  ? 'text-[#0071E3] bg-[#0071E3]/10 animate-pulse' 
                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
              }`}
              title={lang === 'ar' ? 'إملاء صوتي' : 'Dictate'}
              disabled={isLoading}
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.6]" />
            </button>
          )}

          {/* Live Voice API Button */}
          <button
            onClick={onLiveToggle}
            className={`p-1.5 sm:p-2 rounded-full transition-all flex items-center justify-center ${
              liveState.isConnected 
                ? 'bg-[#0071E3] text-white shadow-md animate-pulse' 
                : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
            }`}
            title={liveState.isConnected ? (lang === 'ar' ? 'إنهاء المحادثة الصوتية' : 'End Voice Session') : (lang === 'ar' ? 'محادثة صوتية حية (Gemini Live)' : 'Start Voice Conversation')}
          >
            <Radio className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.6]" />
          </button>

          {/* Apple Circular Send Button */}
          {!liveState.isConnected && (
            <button 
              onClick={onSend}
              disabled={!hasContent || isLoading}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 ml-0.5 sm:ml-1 rtl:ml-0 rtl:mr-0.5 rtl:sm:mr-1 ${
                hasContent && !isLoading
                  ? 'bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-sm hover:scale-105 active:scale-95' 
                  : 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
