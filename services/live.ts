
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from "@google/genai";
import { PropertyService } from "./propertyService";
import { getEnv } from "../utils/env";

export interface LiveState {
  isConnected: boolean;
  isSpeaking: boolean;
}

export type TranscriptCallback = (role: 'user' | 'model', text: string, isFinal: boolean) => void;
export type ShowPropertiesCallback = (propertyIds: string[]) => void;

export class LiveClient {
  private ai: GoogleGenAI;
  private sessionPromise: Promise<any> | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private outputNode: GainNode | null = null;
  private nextStartTime: number = 0;
  private sources: Set<AudioBufferSourceNode> = new Set();
  
  // Transcription state
  private currentInputTranscription: string = "";
  private currentOutputTranscription: string = "";
  
  private onTranscript: TranscriptCallback;
  private onStateChange: (state: LiveState) => void;
  private onShowProperties?: ShowPropertiesCallback;

  constructor(
    onTranscript: TranscriptCallback,
    onStateChange: (state: LiveState) => void,
    onShowProperties?: ShowPropertiesCallback
  ) {
    const apiKey = getEnv("API_KEY");
    if (!apiKey) {
      throw new Error("API Key is missing");
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.onTranscript = onTranscript;
    this.onStateChange = onStateChange;
    this.onShowProperties = onShowProperties;
  }

  async connect() {
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    if (this.inputAudioContext.state === 'suspended') await this.inputAudioContext.resume();
    if (this.outputAudioContext.state === 'suspended') await this.outputAudioContext.resume();

    this.outputNode = this.outputAudioContext.createGain();
    this.outputNode.connect(this.outputAudioContext.destination);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Inject data into prompt for tool use
    const currentProperties = PropertyService.getAll().slice(0, 15); 
    const propertiesContext = JSON.stringify(currentProperties.map(p => ({
        id: p.id,
        title: p.title,
        price: p.price,
        city: p.city,
        type: p.type,
        beds: p.beds
    })));

    const liveSystemPrompt = `You are Aqar AI, a Saudi real estate assistant.
    Access to database (partial): ${propertiesContext}.
    If matching properties found, call 'showProperties' with IDs.
    Keep responses short.`;

    const showPropertiesTool: FunctionDeclaration = {
        name: "showProperties",
        description: "Show property cards to the user on their screen.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            propertyIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of property IDs to show."
            }
          },
          required: ["propertyIds"]
        }
    };

    this.sessionPromise = this.ai.live.connect({
      model: 'gemini-3.8-live',
      callbacks: {
        onopen: () => {
          this.onStateChange({ isConnected: true, isSpeaking: false });
          this.startAudioInput(stream);
        },
        onmessage: (message: LiveServerMessage) => this.handleMessage(message),
        onclose: () => {
          this.onStateChange({ isConnected: false, isSpeaking: false });
          this.cleanup();
        },
        onerror: (err) => {
          console.error("Live API Error:", err);
          this.onStateChange({ isConnected: false, isSpeaking: false });
          this.cleanup();
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
        },
        systemInstruction: liveSystemPrompt,
        inputAudioTranscription: {}, 
        outputAudioTranscription: {},
        tools: [{ functionDeclarations: [showPropertiesTool] }]
      }
    });

    await this.sessionPromise;
  }

  private startAudioInput(stream: MediaStream) {
    if (!this.inputAudioContext) return;

    this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
    this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
    
    this.scriptProcessor.onaudioprocess = (e) => {
      if (!this.sessionPromise) return;

      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = this.createPcmBlob(inputData);
      
      this.sessionPromise.then(session => {
          session.sendRealtimeInput({
            audio: {
              data: pcmBlob.data,
              mimeType: 'audio/pcm;rate=16000'
            }
          });
      }).catch(err => {
          if (this.sessionPromise) console.error("Failed to send audio input:", err);
      });
    };

    this.inputSource.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.inputAudioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
    const { serverContent, toolCall } = message;

    if (toolCall) {
        for (const fc of toolCall.functionCalls) {
            if (fc.name === 'showProperties') {
                const ids = fc.args['propertyIds'] as string[];
                if (this.onShowProperties && ids && ids.length > 0) {
                    this.onShowProperties(ids);
                }
                
                if (this.sessionPromise) {
                    this.sessionPromise.then(session => {
                        session.sendToolResponse({
                            functionResponses: {
                                name: fc.name,
                                id: fc.id,
                                response: { result: "Properties displayed to user." }
                            }
                        });
                    });
                }
            }
        }
    }

    if (!serverContent) return;

    if (serverContent.inputTranscription) {
      this.currentInputTranscription += serverContent.inputTranscription.text;
      this.onTranscript('user', this.currentInputTranscription, false);
    }

    if (serverContent.outputTranscription) {
      this.currentOutputTranscription += serverContent.outputTranscription.text;
      this.onTranscript('model', this.currentOutputTranscription, false);
    }

    if (serverContent.turnComplete) {
      if (this.currentInputTranscription) {
         this.onTranscript('user', this.currentInputTranscription, true);
      }
      if (this.currentOutputTranscription) {
         this.onTranscript('model', this.currentOutputTranscription, true);
      }
      this.currentInputTranscription = "";
      this.currentOutputTranscription = "";
      this.onStateChange({ isConnected: true, isSpeaking: false });
    }

    const audioData = serverContent.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData) {
      this.onStateChange({ isConnected: true, isSpeaking: true });
      await this.playAudioChunk(audioData);
    }

    if (serverContent.interrupted) {
      this.stopAllAudio();
      this.currentOutputTranscription = ""; 
      this.onStateChange({ isConnected: true, isSpeaking: false });
    }
  }

  private async playAudioChunk(base64Audio: string) {
    if (!this.outputAudioContext || !this.outputNode) return;

    this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);

    const audioBuffer = await this.decodeAudioData(
      this.base64ToUint8Array(base64Audio),
      this.outputAudioContext,
      24000
    );

    const source = this.outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.outputNode);
    
    source.addEventListener('ended', () => {
      this.sources.delete(source);
      if (this.sources.size === 0) {
        this.onStateChange({ isConnected: true, isSpeaking: false });
      }
    });

    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
    this.sources.add(source);
  }

  private stopAllAudio() {
    this.sources.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    this.sources.clear();
    this.nextStartTime = 0;
  }

  disconnect() {
    this.cleanup();
  }

  private cleanup() {
    this.stopAllAudio();
    if (this.inputSource) {
        try { this.inputSource.disconnect(); } catch (e) {}
    }
    if (this.scriptProcessor) {
        try { this.scriptProcessor.disconnect(); } catch (e) {}
    }
    if (this.inputAudioContext) {
        try { this.inputAudioContext.close(); } catch (e) {}
    }
    if (this.outputAudioContext) {
        try { this.outputAudioContext.close(); } catch (e) {}
    }
    
    this.inputSource = null;
    this.scriptProcessor = null;
    this.inputAudioContext = null;
    this.outputAudioContext = null;
    this.sessionPromise = null;
  }

  private createPcmBlob(data: Float32Array): { data: string, mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      const s = Math.max(-1, Math.min(1, data[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    const bytes = new Uint8Array(int16.buffer);
    return {
      data: this.uint8ArrayToBase64(bytes),
      mimeType: 'audio/pcm;rate=16000'
    };
  }

  private uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number
  ): Promise<AudioBuffer> {
    const numChannels = 1;
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  }
}
