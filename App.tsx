
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppState, City, PaparazziShot, AnalysisResult, FashionItem, AgentPersona, ContentCategory, Brand, Magazine, SocialPlatform, RunwayShow, Season, Photographer, GroundingChunk, ChatMessage } from './types';
import { generatePaparazziShot, analyzeFashionTrend, compositeImage, generateSpeech, decodeBase64Audio, decodeAudioData, getConsultation } from './services/geminiService';

const PERSONAS: AgentPersona[] = [
  { 
    id: 'patrick', 
    name: 'Patrick Henry Sweeney', 
    role: 'Founder, Aspen Fashion Intelligence', 
    style: 'Precision & Imagination. Heritage meets Avant-Garde.', 
    avatarIcon: 'fa-chess-king', 
    voiceName: 'Fenrir',
    bio: `By day, I wear precision: Traditional, fine-cut tailoring. By night, I wear imagination: Creative high fashion that disrupts expectation. Aspen Fashion Intelligence was born from this duality. I believe style is intelligence expressed physically.`
  },
  { 
    id: 'mina', 
    name: 'Mina Sato', 
    role: 'Avant-Garde Minimalist', 
    style: 'Architectural, cold, focused on silhouettes.', 
    avatarIcon: 'fa-user-astronaut', 
    voiceName: 'Kore',
    bio: 'Tokyo-based conceptualist. Mina sees clothing as mobile architecture and hates unnecessary hardware.'
  },
  { 
    id: 'leo', 
    name: "Leo 'Vibe' Chen", 
    role: 'Streetwear Hypebeast', 
    style: 'Modern, energetic, focused on drops and culture.', 
    avatarIcon: 'fa-bolt', 
    voiceName: 'Puck',
    bio: 'Resale market mogul. Leo knows exactly what is trending on Discord before it hits the runway.'
  },
  { 
    id: 'rachael', 
    name: 'Rachael Marie Ballentine', 
    role: 'In Memoriam | Cultural Observer', 
    style: 'Colorado polish. Road-tested glamour. Mountain pragmatism.', 
    avatarIcon: 'fa-mountain-sun', 
    voiceName: 'Zephyr',
    bio: 'Rachael is remembered as a Colorado original: stylish, quick, funny, restless, and impossible to mistake for anyone else. Her archive keeps the look, the wit, and the road-light alive.'
  }
];

const CATEGORIES = [
  'Vogue',
  'Elle',
  'GQ',
  'W',
  'Facebook',
  'Instagram',
  'TikTok',
  'Pinterest',
  'Fashion Feeds',
  'Master Photographers',
  'You Got The Look',
  'Spring / Summer',
  'Fall / Winter',
  'Runway Archives (10y)'
] as const;

type AppCategory = ContentCategory;

const RACHAEL_ARCHIVE_IMAGES = [
  { src: '/rachael-ballentine/hero.jpg', label: 'Portrait' },
  { src: '/rachael-ballentine/portrait.jpg', label: 'Studio poise' },
  { src: '/rachael-ballentine/taiwan.jpg', label: 'Traveler' },
  { src: '/rachael-ballentine/colorado-rail.jpg', label: 'Colorado light' },
  { src: '/rachael-ballentine/mountain-jeep.jpg', label: 'High country' },
  { src: '/rachael-ballentine/music-room.jpg', label: 'Music room' },
  { src: '/rachael-ballentine/friends-close.jpg', label: 'Friends' },
  { src: '/rachael-ballentine/rooftop-friends.jpg', label: 'Rooftop' },
  { src: '/rachael-ballentine/early-friends.jpg', label: 'Archive' },
];

const RachaelArchivePage: React.FC = () => (
  <main className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
    <section className="relative min-h-screen flex items-end">
      <img src="/rachael-ballentine/hero.jpg" alt="Rachael Marie Ballentine" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-zinc-950" />
      <div className="relative z-10 w-full px-6 py-16 md:px-20">
        <div className="max-w-5xl">
          <p className="mb-5 text-[11px] font-black uppercase tracking-[0.55em] text-aspen-gold">Aspen Fashion Archive</p>
          <h1 className="font-serif text-5xl font-bold uppercase leading-none tracking-tighter md:text-8xl">Rachael Marie Ballentine</h1>
          <p className="mt-6 max-w-3xl font-serif text-2xl italic leading-relaxed text-zinc-200 md:text-3xl">A Colorado original with style, wit, and a traveler's heart.</p>
        </div>
      </div>
    </section>

    <section className="px-6 py-20 md:px-20">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[3rem] border border-white/10 bg-white/5 p-4">
            <img src="/rachael-ballentine/mountain-jeep.jpg" alt="Rachael in the Colorado high country" className="aspect-[4/5] w-full rounded-[2.5rem] object-cover" />
          </div>
          <p className="px-4 text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500">In Loving Memory</p>
        </div>
        <article className="space-y-8 self-center text-xl leading-relaxed text-zinc-300">
          <p>There are people who enter a room quietly, and people who change the room before anyone has finished turning around. Rachael Marie Ballentine belonged to the second group.</p>
          <p>She carried beauty without softness, humor without apology, and style that was never costume. In photographs she is glamorous, mischievous, polished, and free: crossing cities overseas, standing in Colorado light, laughing with friends, and making ordinary moments feel camera-ready.</p>
          <p>Friends knew her as restless, loyal, sharp-eyed, and alive to music, clothes, travel, and the theater of a night out. She could move from society rooms to jeep roads, from Denver rooftops to Hong Kong lights, from Colorado water and stone to the bright color of a birthday table.</p>
          <p className="text-zinc-500">Family service details and additional remembrances may be added as they are confirmed.</p>
        </article>
      </div>
    </section>

    <section className="px-6 pb-24 md:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-end justify-between gap-8">
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.5em] text-aspen-gold">Visual Memory</p>
            <h2 className="font-serif text-4xl font-bold uppercase tracking-tight md:text-6xl">The Archive</h2>
          </div>
          <div className="hidden h-px flex-1 bg-white/10 md:block" />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {RACHAEL_ARCHIVE_IMAGES.map((image) => (
            <figure key={image.src} className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
              <img src={image.src} alt={image.label} className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105" />
              <figcaption className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500">{image.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  </main>
);

const BrandLogo: React.FC<{ brandHint?: string }> = ({ brandHint }) => {
  if (!brandHint) return <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 border border-zinc-100 shadow-sm shrink-0"><i className="fas fa-fingerprint text-[10px]"></i></div>;
  const brand = brandHint.toLowerCase();
  let display = brandHint.charAt(0).toUpperCase();
  let bgColor = 'bg-zinc-900';
  if (brand.includes('versace')) { display = 'V'; bgColor = 'bg-black text-[#c5a059] border-[#c5a059]/30'; }
  else if (brand.includes('prada')) { display = 'P'; bgColor = 'bg-black text-white'; }
  return <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center text-[10px] font-bold border shadow-md shrink-0 transition-transform hover:scale-110`}>{display}</div>;
};

const StudioApp: React.FC = () => {
  const savedPlan = localStorage.getItem('aspen_membership_plan');
  const sessionUser = localStorage.getItem('aspen_session_active');

  const [state, setState] = useState<AppState & { 
    activeCategory: AppCategory,
    selectedItem: FashionItem | null,
    shareItem: FashionItem | null,
    filterCategory: string,
    isCameraActive: boolean,
    searchQuery: string,
    isLoggedIn: boolean,
    authView: 'login' | 'subscription',
    isCompositing: boolean,
    isFlashing: boolean,
    showLookModal: boolean,
    lookMode: 'magazine' | 'runway',
    lookSelection: string,
    isSpeaking: boolean,
    chatMessages: ChatMessage[],
    chatInput: string,
    isChatting: boolean,
    wardrobeImage: string | null,
    showAgentProfile: boolean,
    autoSpeak: boolean,
    copyStatus: string | null,
    showPhilosophy: boolean,
    itemSearchQuery: string
  }>({
    isKeySelected: false,
    activeCity: 'Paris',
    activeCategory: 'Vogue',
    activeBrand: null,
    activeMagazine: null,
    activePlatform: 'Instagram',
    isGenerating: false,
    isAnalyzing: false,
    shots: [],
    selectedShotId: null,
    selectedPersonaId: 'patrick',
    selectedItem: null,
    shareItem: null,
    filterCategory: 'All',
    isCameraActive: false,
    savedAnalyses: [],
    searchQuery: '',
    isLoggedIn: !!sessionUser,
    authView: 'login',
    membershipPlan: savedPlan as any || null,
    isCompositing: false,
    isFlashing: false,
    showLookModal: false,
    lookMode: 'magazine',
    lookSelection: 'VOGUE',
    isSpeaking: false,
    chatMessages: [],
    chatInput: '',
    isChatting: true,
    wardrobeImage: null,
    showAgentProfile: false,
    autoSpeak: true,
    copyStatus: null,
    showPhilosophy: false,
    itemSearchQuery: ''
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wardrobeInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentPersona = useMemo(() => PERSONAS.find(p => p.id === state.selectedPersonaId) || PERSONAS[0], [state.selectedPersonaId]);

  useEffect(() => {
    // When deployed outside Google AI Studio, the API key comes from env vars
    // so we skip the aistudio key check and mark as selected
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const checkKey = async () => {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setState(prev => ({ ...prev, isKeySelected: selected }));
      };
      checkKey();
    } else {
      setState(prev => ({ ...prev, isKeySelected: true }));
    }
  }, []);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [state.chatMessages]);

  const handleSpeak = async (text: string, voiceOverride?: string) => {
    if (!text || text.trim() === '') return;
    if (state.isSpeaking) return;
    setState(p => ({ ...p, isSpeaking: true }));
    try {
      const voice = voiceOverride || currentPersona.voiceName;
      const base64Audio = await generateSpeech(text, voice);
      if (base64Audio) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decoded = decodeBase64Audio(base64Audio);
        const buffer = await decodeAudioData(decoded, audioCtx);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        source.onended = () => setState(p => ({ ...p, isSpeaking: false }));
        source.start();
      } else {
        setState(p => ({ ...p, isSpeaking: false }));
      }
    } catch (e) {
      setState(p => ({ ...p, isSpeaking: false }));
    }
  };

  const handleAgentIntro = () => {
    if (currentPersona.id === 'patrick') {
      const introText = `Welcome. I am Patrick Henry Sweeney, founder of Aspen Fashion Intelligence. I believe style is intelligence expressed physically. Your clothing should speak before you do — and linger after you leave.`;
      handleSpeak(introText, 'Fenrir'); 
    } else if (currentPersona.id === 'rachael') {
      const introText = `This is the Rachael Marie Ballentine archive: Colorado polish, road-tested glamour, mountain pragmatism, and a life remembered in photographs.`;
      handleSpeak(introText, 'Zephyr');
    } else {
      handleSpeak(`Hello. I am ${currentPersona.name}, your ${currentPersona.role}. ${currentPersona.bio}`);
    }
  };

  const handleScan = async (shot: PaparazziShot) => {
    setState(prev => ({ ...prev, isAnalyzing: true }));
    try {
      const analysis = await analyzeFashionTrend(shot.prompt, currentPersona.name, currentPersona.style);
      setState(prev => ({ ...prev, isAnalyzing: false, shots: prev.shots.map(s => s.id === shot.id ? { ...s, analysis } : s) }));
      
      const systemNote: ChatMessage = { role: 'model', text: `Intelligence Scan Complete.` };
      setState(p => ({ ...p, chatMessages: [...p.chatMessages, systemNote] }));
      
      if (state.autoSpeak) handleSpeak(analysis.agentVerdict);
    } catch (error) { setState(prev => ({ ...prev, isAnalyzing: false })); }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!state.chatInput.trim() && !state.wardrobeImage) return;

    const userMsg = state.chatInput.trim();
    const asset = state.wardrobeImage;

    const userMessage: ChatMessage = { role: 'user', text: userMsg || "Analyze my wardrobe upload.", assetUrl: asset || undefined };
    setState(p => ({ 
      ...p, 
      chatMessages: [...p.chatMessages, userMessage], 
      chatInput: '',
      isAnalyzing: true,
      wardrobeImage: null 
    }));

    try {
      const responseText = await getConsultation(
        currentPersona.name, 
        currentPersona.style, 
        userMsg || "Analyze this wardrobe asset.", 
        state.chatMessages,
        asset || undefined
      );
      const modelMessage: ChatMessage = { role: 'model', text: responseText };
      setState(p => ({ ...p, chatMessages: [...p.chatMessages, modelMessage], isAnalyzing: false }));
      if (state.autoSpeak) handleSpeak(responseText);
    } catch (err) {
      setState(p => ({ ...p, isAnalyzing: false }));
    }
  };

  const startCamera = async () => {
    setState(prev => ({ ...prev, isCameraActive: true }));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setState(prev => ({ ...prev, isCameraActive: false }));
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setState(prev => ({ ...prev, isCameraActive: false }));
  };

  const captureStudioScan = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        setState(p => ({ 
          ...p, 
          wardrobeImage: dataUrl, 
          showLookModal: false
        }));
        stopCamera();
      }
    }
  };

  const handlePlanSelection = (plan: 'Elite' | 'Lifetime' | 'Trial') => {
    localStorage.setItem('aspen_membership_plan', plan);
    localStorage.setItem('aspen_session_active', 'true');
    setState(prev => ({ ...prev, membershipPlan: plan, isLoggedIn: true }));
  };

  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    setState(p => ({ ...p, copyStatus: 'Link Copied!' }));
    setTimeout(() => setState(p => ({ ...p, copyStatus: null })), 2000);
  };

  const activeShot = state.shots.find(s => s.id === state.selectedShotId);
  const processedItems = useMemo(() => {
    if (!activeShot?.analysis?.identifiedItems) return [];
    let items = [...activeShot.analysis.identifiedItems];
    
    if (state.filterCategory !== 'All') {
      items = items.filter(item => item.category === state.filterCategory);
    }

    if (state.itemSearchQuery.trim()) {
      const query = state.itemSearchQuery.toLowerCase().trim();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) || 
        (item.brandHint && item.brandHint.toLowerCase().includes(query)) ||
        item.category.toLowerCase().includes(query)
      );
    }

    return items;
  }, [activeShot, state.filterCategory, state.itemSearchQuery]);

  if (!state.isKeySelected) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-700">
           <div className="w-20 h-20 bg-aspen-gold rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse"><i className="fas fa-key text-white text-3xl"></i></div>
           <div className="space-y-4">
             <h1 className="text-4xl font-serif font-bold text-white uppercase tracking-tighter">Neural Studio Access</h1>
             <p className="text-zinc-400 text-sm leading-relaxed font-medium">Connect a billing-enabled project to initialize the Gemini engine.</p>
           </div>
           <div className="p-8 bg-zinc-900 rounded-[2.5rem] border border-zinc-800 space-y-6 shadow-2xl">
             <div className="space-y-2">
               <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Billing Required</p>
               <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="block text-aspen-gold hover:text-white transition-colors text-xs font-bold underline">View Billing Documentation</a>
             </div>
             <button onClick={async () => { if ((window as any).aistudio) { await (window as any).aistudio.openSelectKey(); } setState(prev => ({ ...prev, isKeySelected: true })); }} className="w-full py-5 bg-white text-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-aspen-gold hover:text-white transition-all transform active:scale-95 shadow-xl">Initialize Studio Key</button>
           </div>
        </div>
      </div>
    );
  }

  if (!state.isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
        <div className="w-full max-w-5xl bg-white rounded-[3rem] shadow-2xl p-12 animate-in fade-in zoom-in-95 duration-700">
           <div className="text-center space-y-4 mb-12">
             <h1 className="text-6xl font-serif font-bold uppercase tracking-tighter">Aspen Fashion</h1>
             <p className="text-[12px] text-zinc-400 font-black tracking-[0.5em] uppercase">Private Intelligence Studio</p>
           </div>
           {state.authView === 'login' ? (
             <div className="max-w-md mx-auto space-y-8">
               <div className="space-y-4">
                 <input type="email" placeholder="Proprietary Email" className="w-full px-8 py-5 bg-zinc-50 rounded-2xl text-xs border border-zinc-100 outline-none focus:ring-1 focus:ring-aspen-gold transition-all" />
                 <input type="password" placeholder="Access Cipher" className="w-full px-8 py-5 bg-zinc-50 rounded-2xl text-xs border border-zinc-100 outline-none focus:ring-1 focus:ring-aspen-gold transition-all" />
               </div>
               <button onClick={() => setState(p => ({ ...p, authView: 'subscription' }))} className="w-full aspen-bg-gold text-white py-5 rounded-2xl text-[11px] font-black tracking-widest uppercase shadow-xl hover:bg-zinc-900 transition-all">Authorize Access</button>
             </div>
           ) : (
             <div className="space-y-12 animate-in slide-in-from-bottom-4">
               <div className="text-center space-y-2"><h2 className="text-3xl font-serif font-bold uppercase">Select Your Studio Tier</h2><p className="text-[10px] text-zinc-400 font-black tracking-widest uppercase">Global Heritage Archive Access</p></div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="p-10 rounded-[2.5rem] bg-zinc-50 border border-zinc-100 flex flex-col justify-between hover:border-aspen-gold/30 transition-all group">
                    <div className="space-y-6">
                      <div className="flex justify-between items-start"><p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Entry Tier</p></div>
                      <div className="space-y-1"><span className="text-4xl font-serif font-bold text-zinc-900">7 Days</span><p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">TRIAL ACCESS</p></div>
                    </div>
                    <button onClick={() => handlePlanSelection('Trial')} className="mt-10 w-full py-5 rounded-2xl border border-zinc-200 text-zinc-900 text-[10px] font-black tracking-widest uppercase hover:bg-zinc-900 hover:text-white transition-all">Start Trial Session</button>
                 </div>
                 <div className="p-10 rounded-[2.5rem] bg-white border border-aspen-gold/20 flex flex-col justify-between shadow-xl relative group">
                    <div className="space-y-6">
                      <div className="space-y-1"><p className="text-[10px] font-black text-aspen-gold uppercase tracking-widest">Professional Tier</p><div className="flex items-baseline text-4xl font-serif font-bold text-zinc-900">$5/mo</div></div>
                    </div>
                    <button onClick={() => handlePlanSelection('Elite')} className="mt-10 w-full py-5 rounded-2xl aspen-bg-gold text-white text-[10px] font-black tracking-widest uppercase shadow-lg shadow-aspen-gold/20 hover:bg-zinc-900 transition-all">Select Elite Monthly</button>
                 </div>
                 <div className="p-10 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                    <div className="space-y-6 relative z-10"><div className="space-y-1"><p className="text-[10px] font-black text-aspen-gold uppercase tracking-widest">Founder Tier</p><div className="flex items-baseline text-white text-4xl font-serif font-bold">$50</div></div></div>
                    <button onClick={() => handlePlanSelection('Lifetime')} className="mt-10 w-full py-5 rounded-2xl bg-white text-zinc-900 text-[10px] font-black tracking-widest uppercase hover:bg-aspen-gold hover:text-white transition-all shadow-xl relative z-10">Initialize Lifetime Pass</button>
                 </div>
               </div>
             </div>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Main Navigation Sidebar */}
        <aside className="w-[320px] bg-white h-full flex flex-col border-r border-zinc-100 shrink-0 hidden md:flex">
          <header className="p-12 pb-6">
            <h1 className="text-3xl font-serif font-bold text-zinc-900 uppercase tracking-tighter">Aspen Fashion</h1>
            <p className="text-[9px] text-zinc-400 uppercase font-black tracking-[0.5em] mt-2">Neural Studio Studio</p>
          </header>
          <nav className="flex-1 overflow-y-auto px-8 py-4 space-y-1 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setState(prev => ({ ...prev, activeCategory: cat as AppCategory, selectedShotId: null }))} className={`w-full text-left px-6 py-5 text-[10px] tracking-[0.3em] font-black uppercase transition-all rounded-2xl flex justify-between items-center group ${state.activeCategory === cat ? 'bg-zinc-900 text-white shadow-2xl translate-x-2' : 'text-zinc-400 hover:bg-zinc-50'}`}>
                <span className="truncate">{cat}</span>
                {state.activeCategory === cat && <div className="w-2.5 h-2.5 rounded-full bg-aspen-gold shadow-[0_0_10px_rgba(197,160,89,0.8)] animate-pulse"></div>}
              </button>
            ))}
          </nav>
          <footer className="p-10 border-t border-zinc-50 flex flex-col space-y-4">
            <button onClick={() => setState(p => ({ ...p, showLookModal: true }))} className="w-full flex items-center space-x-5 p-6 bg-aspen-gold text-white rounded-2xl hover:bg-zinc-900 transition-all shadow-2xl group active:scale-95">
              <i className="fas fa-fingerprint text-2xl group-hover:scale-110 transition-transform"></i>
              <div className="text-left"><p className="text-[11px] font-black uppercase tracking-[0.2em] leading-none">Initialize Scan</p></div>
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setState(p => ({ ...p, showPhilosophy: true }))} className="py-4 bg-zinc-50 text-zinc-400 hover:text-zinc-900 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all">Philosophy</button>
              <button onClick={() => { localStorage.removeItem('aspen_session_active'); setState(p => ({ ...p, isLoggedIn: false })); }} className="py-4 bg-zinc-50 text-zinc-400 hover:text-red-500 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all">De-Authorize</button>
            </div>
          </footer>
        </aside>

        {/* Intelligence Feed */}
        <section className="flex-1 h-full flex flex-col relative bg-[#f9f9f9] border-r border-zinc-100">
          <header className="bg-white/90 backdrop-blur-xl border-b border-zinc-100 p-10 flex justify-between items-center">
            <div className="flex items-baseline space-x-5">
              <h2 className="text-4xl font-serif font-bold uppercase text-zinc-900 tracking-tight">{state.activeCategory}</h2>
              {state.membershipPlan && <div className="px-4 py-1.5 bg-aspen-gold/10 rounded-full text-[10px] font-black text-aspen-gold tracking-[0.2em] uppercase border border-aspen-gold/20">{state.membershipPlan} Elite</div>}
            </div>
            <button onClick={() => { setState(p => ({ ...p, isGenerating: true })); generatePaparazziShot({ category: state.activeCategory }).then(res => setState(p => ({ ...p, isGenerating: false, shots: [{ id: Math.random().toString(), ...res, timestamp: Date.now(), city: 'Studio Pulse' }, ...p.shots], selectedShotId: p.shots[0]?.id || null }))); }} className="px-10 py-4 bg-zinc-900 text-white rounded-full text-[11px] font-black uppercase tracking-[0.3em] hover:bg-aspen-gold transition-all shadow-2xl active:scale-95">Synthesize Imagery</button>
          </header>

          <div className="flex-1 p-14 overflow-y-auto flex flex-col items-center no-scrollbar">
            {state.isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center space-y-8">
                <div className="w-20 h-20 border-[6px] border-aspen-gold border-t-transparent rounded-full animate-spin shadow-2xl"></div>
                <p className="text-[11px] text-aspen-gold uppercase font-black tracking-[0.8em] animate-pulse">Rendering Reality...</p>
              </div>
            ) : activeShot ? (
              <div className="w-full max-w-2xl space-y-12 animate-in fade-in duration-1000">
                 <div className={`relative group ${state.isAnalyzing ? 'is-scanning' : ''} rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-[20px] border-white bg-white`}>
                    <img src={activeShot.url} className="w-full h-auto transition-transform duration-1000 group-hover:scale-105" />
                    <div className="scan-line"></div>
                    {!activeShot.analysis && !state.isAnalyzing && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[4px] duration-500">
                         <button onClick={() => handleScan(activeShot)} className="bg-white px-16 py-7 rounded-full text-[13px] font-black uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:bg-aspen-gold hover:text-white transition-all transform hover:scale-110 active:scale-95">Analyze Heritage</button>
                      </div>
                    )}
                 </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20 space-y-8 grayscale">
                <div className="w-32 h-32 rounded-[2.5rem] border-4 border-zinc-300 flex items-center justify-center">
                  <i className="fas fa-camera-retro text-6xl"></i>
                </div>
                <p className="text-[12px] font-black uppercase tracking-[0.6em]">Awaiting Studio Input</p>
              </div>
            )}
          </div>

          {state.shots.length > 0 && (
            <div className="h-36 bg-white border-t border-zinc-100 p-8 flex space-x-6 overflow-x-auto no-scrollbar items-center">
              {state.shots.map(s => <div key={s.id} onClick={() => setState(p => ({ ...p, selectedShotId: s.id }))} className={`shrink-0 w-28 h-full cursor-pointer rounded-3xl overflow-hidden border-[3px] transition-all duration-500 ${state.selectedShotId === s.id ? 'border-aspen-gold scale-110 shadow-2xl z-10' : 'border-transparent opacity-30 hover:opacity-100 grayscale hover:grayscale-0'}`}><img src={s.url} className="w-full h-full object-cover" /></div>)}
            </div>
          )}
        </section>

        {/* Neural Consultation Hub */}
        <section className="w-full md:w-[600px] h-full flex flex-col bg-white shadow-[0_0_100px_rgba(0,0,0,0.1)] z-20 border-l border-zinc-100 relative">
          
          <header className="p-12 border-b border-zinc-100 bg-zinc-50/50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 cursor-pointer group" onClick={() => setState(p => ({ ...p, showAgentProfile: !p.showAgentProfile }))}>
                <div className="relative">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:scale-110 ${state.selectedPersonaId === 'patrick' ? 'bg-aspen-gold text-white ring-8 ring-aspen-gold/10' : 'bg-white border-2 border-zinc-100 text-zinc-900'} ${state.isSpeaking ? 'animate-pulse ring-offset-8 ring-offset-white ring-aspen-gold' : ''}`}>
                    <i className={`fas ${currentPersona.avatarIcon} text-3xl`}></i>
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-[5px] border-white rounded-full shadow-lg"></div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <select value={state.selectedPersonaId} onChange={(e) => setState(p => ({ ...p, selectedPersonaId: e.target.value, chatMessages: [] }))} className={`text-3xl font-serif font-bold bg-transparent border-none p-0 cursor-pointer focus:ring-0 ${state.selectedPersonaId === 'patrick' ? 'text-aspen-gold' : 'text-zinc-900'}`}>{PERSONAS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-black uppercase tracking-[0.4em] mt-2">{currentPersona.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                 <button onClick={() => setState(p => ({ ...p, autoSpeak: !p.autoSpeak }))} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${state.autoSpeak ? 'bg-aspen-gold text-white shadow-xl' : 'bg-zinc-100 text-zinc-400'}`}><i className={`fas fa-volume-${state.autoSpeak ? 'up' : 'mute'} text-sm`}></i></button>
                 <button onClick={() => setState(p => ({ ...p, showAgentProfile: !p.showAgentProfile }))} className={`w-12 h-12 rounded-full flex items-center justify-center bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-all ${state.showAgentProfile ? 'bg-zinc-900 text-white shadow-xl' : ''}`}><i className="fas fa-signature text-sm"></i></button>
              </div>
            </div>

            {state.showAgentProfile && (
              <div className="mt-10 p-10 bg-white rounded-[3.5rem] border border-zinc-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] animate-in slide-in-from-top-6 duration-500">
                <div className="flex items-center justify-between mb-8">
                  <p className="text-[11px] font-black text-aspen-gold uppercase tracking-[0.5em]">Identity Profile</p>
                  <span className="text-[9px] bg-zinc-50 px-4 py-2 rounded-full uppercase font-black text-zinc-400 tracking-[0.2em] border border-zinc-100">Live Connection Active</span>
                </div>
                <p className="text-lg text-zinc-700 leading-relaxed italic font-serif px-2 mb-10">"{currentPersona.bio}"</p>
                <button onClick={handleAgentIntro} className="w-full py-6 bg-zinc-900 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-aspen-gold transition-all flex items-center justify-center space-x-4 shadow-2xl active:scale-95">
                  <i className="fas fa-microphone-alt"></i>
                  <span>Initialize Neural Audio</span>
                </button>
              </div>
            )}
          </header>

          <div className="flex-1 overflow-y-auto p-12 space-y-16 no-scrollbar scroll-smooth">
            {activeShot?.analysis && (
              <section className="animate-in fade-in duration-700 space-y-12">
                
                {/* Reverted Verdict Styling - Refined Text Box */}
                <div className="p-10 rounded-[3rem] bg-zinc-900 text-white shadow-2xl space-y-8 relative border border-white/5">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-3">
                       <i className="fas fa-bolt text-aspen-gold text-xs"></i>
                       <p className="text-[10px] font-black uppercase tracking-[0.5em] text-aspen-gold">Intelligence Verdict</p>
                     </div>
                     <button onClick={() => handleSpeak(activeShot.analysis!.agentVerdict)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-aspen-gold hover:bg-aspen-gold hover:text-white transition-all transform active:scale-90">
                       <i className="fas fa-volume-up text-sm"></i>
                     </button>
                   </div>
                   <p className="text-2xl md:text-3xl font-serif font-medium leading-relaxed italic tracking-tight">
                     "{activeShot.analysis.agentVerdict}"
                   </p>
                   <div className="flex items-center space-x-4 pt-4 border-t border-white/10">
                     <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-zinc-900 text-xs">
                       <i className={`fas ${currentPersona.avatarIcon}`}></i>
                     </div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Verified by {currentPersona.name}</p>
                   </div>
                </div>

                {/* Identified Elements with Robust Search */}
                <div className="space-y-8">
                  <div className="flex flex-col space-y-4 px-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-400">Identified Elements</h4>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-widest">Neural Map Active</span>
                      </div>
                    </div>
                    
                    {/* Piece Search Input */}
                    <div className="relative">
                      <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 text-xs"></i>
                      <input 
                        type="text" 
                        value={state.itemSearchQuery}
                        onChange={(e) => setState(p => ({ ...p, itemSearchQuery: e.target.value }))}
                        placeholder="Search by item, brand, or category..."
                        className="w-full pl-12 pr-5 py-4 bg-zinc-50 border border-zinc-100 rounded-[2rem] text-[12px] font-medium focus:bg-white focus:ring-1 focus:ring-aspen-gold/30 outline-none transition-all shadow-sm"
                      />
                      {state.itemSearchQuery && (
                        <button onClick={() => setState(p => ({ ...p, itemSearchQuery: '' }))} className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500">
                          <i className="fas fa-times-circle"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    {processedItems.length > 0 ? processedItems.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-7 rounded-[2.5rem] border border-zinc-100 bg-zinc-50/50 group hover:border-aspen-gold/40 hover:bg-white hover:shadow-xl transition-all duration-500 cursor-default transform hover:-translate-y-1">
                        <div className="flex items-center space-x-5">
                          <BrandLogo brandHint={item.brandHint} />
                          <div>
                            <p className="text-lg font-bold text-zinc-900 tracking-tight">{item.name}</p>
                            <div className="flex items-center space-x-2 mt-1.5">
                              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.4em]">{item.brandHint || 'Heritage Collective'}</p>
                              <span className="w-1 h-1 rounded-full bg-zinc-200"></span>
                              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">{item.category}</p>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => setState(p => ({ ...p, shareItem: item }))} className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-zinc-300 hover:text-aspen-gold hover:shadow-xl transition-all border border-zinc-50"><i className="fas fa-share-alt text-sm"></i></button>
                      </div>
                    )) : (
                      <div className="text-center py-10 opacity-30 italic text-sm">No items found matching "{state.itemSearchQuery}".</div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Chat History */}
            <div className="space-y-12">
              {state.chatMessages.length === 0 && !activeShot?.analysis && (
                <div className="text-center py-28 space-y-10 opacity-30">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-zinc-200 mx-auto flex items-center justify-center">
                    <i className="fas fa-comment-dots text-4xl"></i>
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.6em]">Neural Session Ready...</p>
                </div>
              )}
              {state.chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-6`}>
                  <div className={`max-w-[85%] p-9 rounded-[2.5rem] text-[15px] leading-relaxed shadow-sm transition-all hover:shadow-xl ${msg.role === 'user' ? 'bg-zinc-900 text-white rounded-tr-none' : 'bg-zinc-50 text-zinc-700 border border-zinc-100 rounded-tl-none'}`}>
                    {msg.assetUrl && <img src={msg.assetUrl} className="w-full h-64 object-cover rounded-[2rem] mb-8 border border-white/5 shadow-xl" />}
                    <span className={msg.role === 'model' ? 'font-serif text-xl' : 'font-medium'}>{msg.text}</span>
                    {msg.role === 'model' && (
                      <div className="mt-5 pt-5 border-t border-zinc-200/50 flex justify-end">
                        <button onClick={() => handleSpeak(msg.text)} className="text-aspen-gold opacity-40 hover:opacity-100 transition-all"><i className="fas fa-volume-up text-xs"></i></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Consultation Input Tray */}
          <div className="p-12 bg-white border-t border-zinc-100 shadow-2xl flex-shrink-0">
             {state.wardrobeImage && (
               <div className="mb-8 relative w-28 h-28 rounded-[2rem] overflow-hidden border-[3px] border-aspen-gold shadow-xl animate-in zoom-in-95 group">
                  <img src={state.wardrobeImage} className="w-full h-full object-cover" />
                  <button onClick={() => setState(p => ({ ...p, wardrobeImage: null }))} className="absolute top-2.5 right-2.5 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-[12px] opacity-0 group-hover:opacity-100 transition-opacity shadow-xl z-10"><i className="fas fa-times"></i></button>
               </div>
             )}
             <form onSubmit={handleSendMessage} className="flex items-center space-x-5">
               <div className="flex space-x-2.5">
                 <button type="button" onClick={() => wardrobeInputRef.current?.click()} className="w-14 h-14 p-4 rounded-2xl bg-zinc-50 text-zinc-400 hover:text-aspen-gold hover:bg-zinc-100 transition-all flex items-center justify-center border border-zinc-100 shadow-sm" title="Upload"><i className="fas fa-image text-xl"></i></button>
                 <button type="button" onClick={() => setState(p => ({ ...p, showLookModal: true }))} className="w-14 h-14 p-4 rounded-2xl bg-zinc-50 text-zinc-400 hover:text-emerald-500 hover:bg-zinc-100 transition-all flex items-center justify-center border border-zinc-100 shadow-sm" title="Camera"><i className="fas fa-camera text-xl"></i></button>
               </div>
               <input ref={wardrobeInputRef} type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setState(p => ({ ...p, wardrobeImage: reader.result as string })); reader.readAsDataURL(file); } }} className="hidden" />
               <div className="flex-1 relative">
                 <input type="text" value={state.chatInput} onChange={(e) => setState(p => ({ ...p, chatInput: e.target.value }))} placeholder={`Query the Founder...`} className="w-full px-8 py-6 bg-zinc-100 rounded-[2.5rem] text-[15px] font-medium border-transparent focus:bg-white focus:ring-2 focus:ring-aspen-gold/20 outline-none transition-all shadow-inner" />
                 {state.isAnalyzing && <div className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 border-[3px] border-aspen-gold border-t-transparent rounded-full animate-spin"></div>}
               </div>
               <button type="submit" disabled={state.isAnalyzing || (!state.chatInput.trim() && !state.wardrobeImage)} className="w-16 h-16 rounded-full bg-zinc-900 text-white flex items-center justify-center hover:bg-aspen-gold transition-all transform active:scale-90 disabled:opacity-20 shadow-xl"><i className="fas fa-paper-plane text-lg"></i></button>
             </form>
             <p className="mt-8 text-center text-[9px] font-black text-zinc-300 uppercase tracking-[0.8em]">v1.6 Neural Link Active</p>
          </div>
        </section>
      </div>

      <footer className="h-[64px] bg-zinc-950 border-t border-white/5 flex items-center px-12 justify-between z-50">
         <div className="flex items-center space-x-8 text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">
            <div className="flex items-center space-x-3"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div><span>Neural Active</span></div>
            <div className="w-px h-5 bg-zinc-800"></div>
            <span>Aspen Fashion Intel v1.6 — Heritage Mode</span>
            {state.membershipPlan && <div className="flex items-center space-x-3 text-aspen-gold ml-6"><span className="px-4 py-1.5 bg-aspen-gold/10 rounded-full border border-aspen-gold/20 tracking-[0.3em] font-black">{state.membershipPlan} Elite</span></div>}
         </div>
         <div className="text-zinc-500 text-[9px] font-black uppercase tracking-widest">© 2025 Patrick Henry Sweeney — Intelligence Studio</div>
      </footer>

      {/* Philosophy Modal */}
      {state.showPhilosophy && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-10 animate-in fade-in duration-700" onClick={() => setState(p => ({ ...p, showPhilosophy: false }))}>
           <div className="bg-white w-full max-w-4xl rounded-[5rem] shadow-2xl p-20 space-y-16 relative animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
              <header className="text-center space-y-6">
                 <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl border-4 border-aspen-gold"><i className="fas fa-chess-king text-aspen-gold text-4xl"></i></div>
                 <h2 className="text-6xl font-serif font-bold uppercase tracking-tighter text-zinc-900">The Philosophy</h2>
                 <p className="text-[11px] text-zinc-400 font-black uppercase tracking-[0.8em]">Patrick Henry Sweeney</p>
              </header>
              <div className="space-y-10 text-center max-w-2xl mx-auto">
                 <p className="text-2xl font-serif italic text-zinc-800 leading-relaxed">"By day, I wear precision. By night, I wear imagination. Aspen Fashion Intelligence was born from this duality — structure and spontaneity, heritage and innovation."</p>
                 <div className="h-px w-24 bg-aspen-gold mx-auto opacity-30"></div>
                 <p className="text-3xl font-serif font-bold text-zinc-900">"I believe style is intelligence expressed physically."</p>
              </div>
              <button onClick={() => setState(p => ({ ...p, showPhilosophy: false }))} className="absolute top-12 right-12 text-zinc-200 hover:text-aspen-gold transition-all transform hover:rotate-90 duration-500"><i className="fas fa-times text-4xl"></i></button>
           </div>
        </div>
      )}

      {/* Discovery Modal */}
      {state.shareItem && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-10 animate-in fade-in duration-300" onClick={() => setState(p => ({ ...p, shareItem: null }))}>
           <div className="bg-white w-full max-w-xl rounded-[5rem] shadow-2xl p-16 space-y-12 relative animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
              <header className="text-center space-y-6">
                <div className="w-24 h-24 bg-aspen-gold rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl"><i className="fas fa-paper-plane text-white text-4xl"></i></div>
                <h2 className="text-4xl font-serif font-bold uppercase tracking-tighter">Dispatch Intelligence</h2>
              </header>
              <div className="p-12 bg-zinc-50 rounded-[4rem] space-y-10 border border-zinc-100 shadow-inner">
                <div className="space-y-2"><p className="text-[11px] font-black text-aspen-gold uppercase tracking-[0.2em]">Master Item</p><p className="text-3xl font-serif font-bold tracking-tight">{state.shareItem.name}</p></div>
                <div className="space-y-2"><p className="text-[11px] font-black text-aspen-gold uppercase tracking-[0.2em]">Acquisition</p><p className="text-xl font-serif text-zinc-600 italic">"{state.shareItem.suggestedAcquisition}"</p></div>
              </div>
              <div className="grid grid-cols-1 gap-5 pt-6">
                <a href={`mailto:?subject=Fashion Intelligence: ${state.shareItem.name}`} className="w-full py-7 bg-zinc-900 text-white rounded-[2rem] text-[12px] font-black uppercase tracking-[0.3em] flex items-center justify-center space-x-5 hover:bg-aspen-gold transition-all shadow-xl active:scale-95"><i className="fas fa-paper-plane text-base"></i><span>Dispatch Discovery</span></a>
              </div>
              <button onClick={() => setState(p => ({ ...p, shareItem: null }))} className="absolute top-12 right-12 text-zinc-300 hover:text-zinc-900 transition-colors transform hover:rotate-90 duration-500"><i className="fas fa-times text-3xl"></i></button>
           </div>
        </div>
      )}

      {/* Studio Cam Modal */}
      {state.showLookModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/98 backdrop-blur-[100px] p-10" onClick={() => { stopCamera(); setState(p => ({ ...p, showLookModal: false })); }}>
           <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[6rem] shadow-2xl flex flex-col overflow-hidden relative" onClick={e => e.stopPropagation()}>
              <header className="p-16 border-b flex justify-between items-center">
                <div><h2 className="text-7xl font-serif font-bold uppercase tracking-tighter">Studio Capture</h2><p className="text-[11px] text-zinc-400 font-black uppercase tracking-[0.8em] mt-4 leading-none">Neural Mapping Protocol</p></div>
                <button onClick={() => { stopCamera(); setState(p => ({ ...p, showLookModal: false })); }} className="w-20 h-20 rounded-full border-[3px] border-zinc-100 flex items-center justify-center text-5xl hover:bg-zinc-900 hover:text-white transition-all transform hover:rotate-90 duration-500">&times;</button>
              </header>
              <div className="flex-1 flex flex-col items-center justify-center p-16 text-center space-y-16 relative overflow-hidden">
                 {state.isCameraActive ? (
                   <div className="w-full max-w-4xl aspect-video bg-black rounded-[4rem] overflow-hidden relative shadow-2xl border-[20px] border-zinc-900 group">
                     <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1] opacity-90 group-hover:opacity-100 transition-opacity duration-1000" />
                     <div className="absolute inset-0 pointer-events-none border border-white/5 flex items-center justify-center">
                       <div className="w-48 h-48 border-[2px] border-aspen-gold/20 rounded-full animate-pulse"></div>
                     </div>
                     <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center space-x-12">
                        <button onClick={stopCamera} className="px-12 py-6 bg-white/5 backdrop-blur-3xl text-white rounded-3xl text-[12px] font-black uppercase tracking-[0.4em] hover:bg-red-500 transition-all border border-white/10 active:scale-95">De-Initialize</button>
                        <button onClick={captureStudioScan} className="w-32 h-32 rounded-full bg-white border-[12px] border-aspen-gold shadow-2xl hover:scale-110 transition-all active:scale-90 relative overflow-hidden group">
                           <div className="w-full h-full rounded-full flex items-center justify-center">
                             <div className="w-6 h-6 rounded-full bg-aspen-gold animate-ping"></div>
                           </div>
                        </button>
                     </div>
                   </div>
                 ) : (
                   <>
                     <div className="w-80 h-80 border-[6px] border-dashed border-zinc-100 rounded-[6rem] flex items-center justify-center animate-pulse duration-[3s]"><i className="fas fa-camera-retro text-[100px] text-zinc-100"></i></div>
                     <div className="space-y-10">
                       <h3 className="text-6xl font-serif italic text-zinc-900 tracking-tight">Initialize Heritage Scan</h3>
                       <div className="flex space-x-10 justify-center">
                         <button onClick={() => wardrobeInputRef.current?.click()} className="px-16 py-8 bg-zinc-900 text-white rounded-[2.5rem] text-[13px] font-black uppercase tracking-[0.4em] shadow-2xl hover:bg-aspen-gold transition-all transform hover:scale-110 active:scale-95">Select File</button>
                         <button onClick={startCamera} className="px-16 py-8 bg-zinc-50 text-zinc-900 rounded-[2.5rem] text-[13px] font-black uppercase tracking-[0.4em] border-2 border-zinc-200 hover:bg-zinc-200 transition-all transform hover:scale-110 active:scale-95">Initialize Live</button>
                       </div>
                     </div>
                   </>
                 )}
              </div>
           </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

const App: React.FC = () => {
  const isRachaelArchivePath =
    typeof window !== 'undefined' &&
    (window.location.pathname.includes('rachael-ballentine') || window.location.hash.includes('rachael-ballentine'));

  return isRachaelArchivePath ? <RachaelArchivePage /> : <StudioApp />;
};

export default App;
