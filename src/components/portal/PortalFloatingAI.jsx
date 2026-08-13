import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  MessageSquare, 
  ChevronRight, 
  Zap, 
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export const PortalFloatingAI = ({ customer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Merhaba ${customer?.client_name || 'Değerli'} ekibi! Ben SocialArt Marka Yapay Zeka Asistanınızım. Reklam harcamalarınız, sıradaki çekim tarihiniz veya ajans hizmetlerimizle ilgili sorularınızı anında yanıtlayabilirim.`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    'Bu ayki reklam harcamamız ne kadar?',
    'Sıradaki video çekimi hangi gün?',
    'Kreatif kurgusu ne aşamada?',
    'Müşteri temsilcime not ilet'
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // 1. Add user message
    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // 2. Simulated AI logic with domain intelligence
    setTimeout(() => {
      let aiReply = 'Sorunuzu aldım. Ekibimizle birlikte sürecinizi optimize ediyoruz.';
      const lower = text.toLowerCase();

      if (lower.includes('harcama') || lower.includes('bütçe') || lower.includes('ne kadar')) {
        aiReply = 'Bu ay Meta Ads üzerinde toplam ₺3.434,38 reklam harcaması yapıldı. Bugünün harcaması ise ₺199,13 seviyesinde ve CPL birim maliyetimiz ₺73,00 ile hedeflerimizin altında çok verimli seyrediyor.';
      } else if (lower.includes('çekim') || lower.includes('tarih') || lower.includes('ne zaman')) {
        aiReply = 'Sıradaki prodüksiyon çekim gününüz 18 Ağustos Pazartesi saat 11:00 olarak planlanmıştır. Çekim Call Sheet rehberini "Prodüksiyon & Onay" sekmesinde bulabilirsiniz.';
      } else if (lower.includes('kurgu') || lower.includes('onay') || lower.includes('video')) {
        aiReply = 'Yeni sezon tanıtım Reels videonuzun 2. revize kurgusu tamamlandı ve "Prodüksiyon & Onay" sekmesinde onayınızı bekliyor.';
      } else if (lower.includes('temsilci') || lower.includes('not') || lower.includes('mesaj')) {
        aiReply = 'Notunuz Müşteri Temsilciniz Selin Yılmaz\'a anlık bildirim olarak iletildi. En kısa sürede WhatsApp veya panel üzerinden size dönüş sağlayacaktır.';
      }

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiReply }]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <>
      {/* FLOATING ACTION BUTTON (BOTTOM RIGHT) */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white font-extrabold text-xs shadow-2xl shadow-indigo-600/40 hover:scale-105 transition-all border border-white/20"
          >
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white animate-bounce" />
            </div>
            <span>Marka AI Asistanı</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        )}
      </div>

      {/* CHATBOT DRAWER / MODAL */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md bg-slate-900/95 border border-indigo-500/30 rounded-3xl backdrop-blur-2xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden animate-fadeIn">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border-b border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 p-0.5 shadow-md">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <h4 className="font-black text-xs text-white">SocialArt Marka AI</h4>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Site Haritası & Marka Bilgisi Aktif</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="p-4 h-72 overflow-y-auto space-y-3 bg-slate-950/60">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col max-w-[85%] ${
                  m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-800/90 text-slate-200 rounded-bl-none border border-slate-700/80 shadow-md'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold p-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>AI yanıt hazırlıyor...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-300 border border-slate-800 text-[10px] font-bold whitespace-nowrap transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Asistana bir soru sorun..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-indigo-500/50"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
