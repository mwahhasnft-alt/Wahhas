import React, { useMemo, useState } from 'react';
import PropertyCard from './PropertyCard';
import { Volume2, Loader2, MapPin, Globe, Atom, ArrowUpRight } from 'lucide-react';
import { Lang, GroundingSource } from '../types';
import { generateSpeech } from '../services/gemini';

interface MessageBubbleProps {
  role: 'user' | 'model';
  content: string;
  image?: string;
  isStreaming?: boolean;
  lang: Lang;
  compareSet?: Set<string>;
  groundingSources?: GroundingSource[];
  onPropertyAction?: (action: 'view' | 'save' | 'chat' | 'compare', data: any) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  role, 
  content, 
  image, 
  isStreaming, 
  lang, 
  compareSet, 
  groundingSources, 
  onPropertyAction 
}) => {
  const isUser = role === 'user';
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  // Parser to split text and property cards
  const parsedContent = useMemo(() => {
    if (isUser) return [{ type: 'text', content }];

    const parts: Array<{ type: 'text' | 'card'; content: any }> = [];
    const regex = /\[Property Card\]\s*ID: (.*?)\s*Title: (.*?)\s*Price: (.*?)\s*Location: (.*?)\s*Type: (.*?)\s*Specs: (.*?)\s*Highlights: (.*?)\s*Actions: (.*?)(?=\[Property Card\]|$|\n\n)/gs;

    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const text = content.substring(lastIndex, match.index).trim();
        if (text) parts.push({ type: 'text', content: text });
      }

      parts.push({
        type: 'card',
        content: {
          id: match[1],
          title: match[2],
          price: match[3],
          location: match[4],
          type: match[5],
          specs: match[6],
          highlights: match[7],
          actions: match[8]
        }
      });

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      const text = content.substring(lastIndex).trim();
      if (text) parts.push({ type: 'text', content: text });
    }

    return parts;
  }, [content, isUser]);

  const handlePlayAudio = async () => {
    if (isPlaying) return;
    setIsAudioLoading(true);
    try {
      const audioBuffer = await generateSpeech(content.replace(/\[Property Card\].*?Actions:.*$/gs, 'And here are the property details.').replace(/\*\*/g, ''));
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createBufferSource();
      source.buffer = await audioContext.decodeAudioData(audioBuffer);
      source.connect(audioContext.destination);
      source.onended = () => setIsPlaying(false);
      setIsPlaying(true);
      source.start(0);
    } catch (e) {
      console.error("Failed to play audio", e);
    } finally {
      setIsAudioLoading(false);
    }
  };

  return (
    <div className={`flex w-full mb-4 sm:mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex flex-col max-w-[94%] sm:max-w-[85%] md:max-w-[78%] min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* User Image Attachment */}
        {image && (
          <div className="mb-2 max-w-xs sm:max-w-sm overflow-hidden rounded-[18px] sm:rounded-[20px] border border-black/[0.08] dark:border-white/[0.12] shadow-sm">
            <img src={image} alt="User upload" className="w-full h-auto object-cover" />
          </div>
        )}

        {/* Message Container */}
        <div 
          className={`relative group transition-all text-xs sm:text-sm md:text-[15px] leading-[1.68] break-words [overflow-wrap:anywhere] w-full ${
            isUser
              ? 'bg-[#0071E3] text-white px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-[20px] rounded-br-[6px] shadow-sm font-sans'
              : 'bg-white/90 dark:bg-[#1C1C1E]/90 text-neutral-900 dark:text-neutral-100 px-3.5 py-3 sm:px-5 sm:py-4 rounded-[20px] rounded-bl-[6px] border border-black/[0.06] dark:border-white/[0.08] shadow-sm font-sans backdrop-blur-md'
          }`}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          {parsedContent.map((part, index) => {
            if (part.type === 'card') {
              return (
                <div key={index} className="my-2 sm:my-3 w-full max-w-full overflow-hidden">
                  <PropertyCard 
                    data={part.content} 
                    lang={lang} 
                    isCompared={compareSet?.has(part.content.id)}
                    onAction={onPropertyAction}
                  />
                </div>
              );
            } else {
              const textContent = part.content as string;
              const parts = textContent.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
              
              return (
                <span key={index} className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                  {parts.map((subPart, i) => {
                    if (subPart.startsWith('**') && subPart.endsWith('**') && subPart.length >= 4) {
                      return <strong key={i} className="font-semibold">{subPart.slice(2, -2)}</strong>;
                    }
                    const linkMatch = subPart.match(/^\[(.*?)\]\((.*?)\)$/);
                    if (linkMatch) {
                      return (
                        <a 
                          key={i} 
                          href={linkMatch[2]} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`underline underline-offset-2 break-all ${isUser ? 'text-white/90 hover:text-white' : 'text-[#0071E3] hover:text-[#0077ED]'}`}
                        >
                          {linkMatch[1]}
                        </a>
                      );
                    }
                    return <span key={i}>{subPart}</span>;
                  })}
                </span>
              );
            }
          })}
          
          {isStreaming && (
            <span className="inline-block w-1.5 h-3.5 sm:h-4 ml-1 rtl:mr-1 rtl:ml-0 align-middle bg-[#0071E3] animate-pulse"></span>
          )}

          {/* Minimalist Audio Speaker Button */}
          {!isUser && !isStreaming && (
            <button 
              onClick={handlePlayAudio}
              disabled={isAudioLoading || isPlaying}
              className={`absolute top-2.5 sm:top-3 ${lang === 'ar' ? 'left-2.5 sm:left-3' : 'right-2.5 sm:right-3'} p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity ${
                isPlaying ? 'opacity-100 text-[#0071E3]' : ''
              }`}
              title={lang === 'ar' ? 'قراءة صوتية' : 'Speak'}
            >
              {isAudioLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'animate-pulse' : ''}`} />
              )}
            </button>
          )}
        </div>

        {/* Minimalist Footnote Citations (Grounding Sources) */}
        {groundingSources && groundingSources.length > 0 && !isUser && (
          <div className="mt-1.5 sm:mt-2 flex flex-wrap gap-1 sm:gap-1.5 items-center max-w-full">
            {groundingSources.map((source, sIdx) => {
              const isMap = source.type === 'maps';
              const isScience = source.type === 'science';
              return (
                <a
                  key={sIdx}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-neutral-100/70 dark:bg-neutral-900/60 border border-black/[0.05] dark:border-white/[0.08] transition-colors max-w-full"
                >
                  {isMap && <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#0071E3] shrink-0" />}
                  {isScience && <Atom className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-teal-600 dark:text-teal-400 shrink-0" />}
                  {!isMap && !isScience && <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-neutral-400 shrink-0" />}
                  <span className="truncate max-w-[130px] sm:max-w-[190px]">{source.title}</span>
                  <ArrowUpRight className="w-2.5 h-2.5 opacity-60 shrink-0" />
                </a>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default MessageBubble;
