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
import { supabase } from '../../lib/supabase';
import { getBrandConfig } from './brandConfigs';

export default function PortalFloatingAI({ customer }) {
  const brandConfig = getBrandConfig(customer?.company_code, customer?.client_name);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Merhaba ${brandConfig.name} ekibi! Ben SocialArt Marka Yapay Zeka Danışmanınızım. Reklam bütçeniz, sıradaki çekim tarihiniz, video kurgularınız veya taleplerinizi ekibimize iletmekle ilgili her konuda yanınızdayım.`
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

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // 1. Add user message
    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // 2. Multi-Intent Routing & Domain Analysis
    const lower = text.toLowerCase();
    const isVideoIntent = lower.includes('video') || lower.includes('kurgu') || lower.includes('müzik') || lower.includes('sahne') || lower.includes('montaj') || lower.includes('altyazı');
    const isAdsIntent = lower.includes('reklam') || lower.includes('bütçe') || lower.includes('harcama') || lower.includes('cpl') || lower.includes('roas') || lower.includes('lead') || lower.includes('hedef kitle');
    const isSocialIntent = lower.includes('post') || lower.includes('story') || lower.includes('caption') || lower.includes('metin') || lower.includes('açıklama') || lower.includes('grid') || lower.includes('saat');

    let departmentsToNotify = [];
    let aiReply = '';

    if (isVideoIntent && isAdsIntent) {
      departmentsToNotify.push('🎬 Video Kurgu Ekibi', '📈 Performans Pazarlama Ekibi');
      aiReply = `Talebinizi analiz ettim! Video ile ilgili bölümü Kurgu Ekibimize, reklam & bütçe güncellemesini ise Performans Pazarlama Uzmanımıza ayrı görevler olarak anlık ilettim.`;
    } else if (isVideoIntent) {
      departmentsToNotify.push('🎬 Video Kurgu Ekibi');
      aiReply = `Kurgu ve video notunuzu aldım. Kurgu ekibimize görev olarak ilettim; revize/güncelleme tamamlandığında "Prodüksiyon & Onay" sekmesinde görebilirsiniz.`;
    } else if (isAdsIntent) {
      departmentsToNotify.push('📈 Performans Pazarlama Ekibi');
      aiReply = `Bu ay Meta Ads üzerinde toplam ₺3.434,38 reklam harcaması yapıldı. Talebiniz Performans Pazarlama Uzmanımıza anlık bildirim olarak iletildi.`;
    } else if (isSocialIntent) {
      departmentsToNotify.push('📱 Sosyal Medya Ekibi');
      aiReply = `İçerik ve paylaşım notunuz Sosyal Medya Uzmanımızın içerik takvimine kaydedildi.`;
    } else if (lower.includes('çekim') || lower.includes('tarih') || lower.includes('saat')) {
      aiReply = `Sıradaki prodüksiyon çekim gününüz ${brandConfig.nextShooting.date} saat ${brandConfig.nextShooting.time} olarak planlanmıştır. Mekan: ${brandConfig.nextShooting.location}.`;
    } else {
      departmentsToNotify.push('💼 Marka Direktörü & Temsilci');
      aiReply = `Mesajınızı aldım. Marka Yöneticiniz ${brandConfig.dedicatedManager.name}'e anlık bildirim olarak iletildi. En kısa sürede sizinle iletişime geçecektir.`;
    }

    // 3. Dispatch to Supabase
    try {
      if (departmentsToNotify.length > 0 && customer?.client_name) {
        await supabase.from('client_support_messages').insert([{
          client_name: customer.client_name,
          sender_type: 'client',
          message: `🤖 [AI Yönlendirmesi -> ${departmentsToNotify.join(', ')}]: "${text}"`,
          is_read: false
        }]);

        await supabase.from('activity_log').insert([{
          target_name: customer.client_name,
          action: 'AI Müşteri Talebi',
          details: `İstek: "${text}" (${departmentsToNotify.join(', ')})`
        }]);
      }
    } catch (e) {
      console.warn('Supabase AI dispatch notice:', e);
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'ai', text: aiReply }]);
      setIsTyping(false);
    }, 600);
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
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>Marka AI Danışmanı</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-bold">
                    SocialArt VIP
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400">7/24 Marka Asistanınız & Akıllı Yönlendirme</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Body */}
          <div className="p-4 h-80 overflow-y-auto space-y-3 bg-slate-950/60">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3.5 h-3.5 text-indigo-300" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl text-xs max-w-[82%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs w-20">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse delay-200" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2.5 bg-slate-950/90 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/40 text-[11px] font-semibold text-slate-300 hover:text-white transition-all shadow-sm shrink-0"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Sorunuzu veya ekibe notunuzu yazın..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:border-indigo-500/60 outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 disabled:opacity-40 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
