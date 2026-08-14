import React, { useState } from 'react';
import { 
  FolderDown, 
  UploadCloud, 
  FileText, 
  Video, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getBrandConfig } from './brandConfigs';

export default function TabAssetsArchive({ customer }) {
  const brandConfig = getBrandConfig(customer?.company_code, customer?.client_name);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Agency Delivered 4K Master Export Packages
  const deliveredDrivePackages = brandConfig.drivePackages || [
    {
      id: 'pkg-1',
      title: 'Ağustos 2026 - 4K Master Video & Reels Paketi (Google Drive)',
      type: 'Video Masterları',
      size: '4.8 GB',
      date: '12 Ağustos 2026',
      itemsCount: '6 Dikey Video + 2 Yatay YouTube Master',
      driveUrl: 'https://drive.google.com'
    }
  ];

  // Presentations & Reports Archive
  const presentationsAndReports = [
    {
      id: 'rep-1',
      title: 'Aylık Dijital Büyüme & Meta Reklam Performans Raporu (PDF)',
      type: 'Performans Raporu',
      date: '01 Ağustos 2026',
      size: '3.4 MB',
      fileUrl: '#'
    },
    {
      id: 'rep-2',
      title: 'Marka Konumlandırma & Yıllık Kreatif Strateji Sunumu (PDF)',
      type: 'Strateji Sunumu',
      date: '15 Temmuz 2026',
      size: '12.8 MB',
      fileUrl: '#'
    }
  ];

  // Handle client file upload simulation
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setTimeout(async () => {
      const newItems = files.map(f => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
        date: new Date().toLocaleDateString('tr-TR')
      }));

      setUploadedFiles(prev => [...newItems, ...prev]);
      setUploading(false);
      setUploadSuccess(`${files.length} dosya ajans havuzuna başarıyla yüklendi!`);
      setTimeout(() => setUploadSuccess(''), 4000);

      if (customer?.client_name) {
        try {
          await supabase.from('client_support_messages').insert([{
            client_name: customer.client_name,
            sender_type: 'client',
            message: `📁 MÜŞTERİ DOSYA YÜKLEDİ: ${files.map(f => f.name).join(', ')} dosyaları ajans havuzuna eklendi.`,
            is_read: false
          }]);
        } catch (err) {}
      }
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Toast Alert */}
      {uploadSuccess && (
        <div className="relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-slate-950 border border-cyan-500/40 backdrop-blur-2xl shadow-2xl shadow-cyan-950/60 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-l-full" />
          <div className="flex items-center gap-3.5 pl-1.5">
            <div className="relative w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg shadow-cyan-500/20">
              <CheckCircle2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">Bulut Arşivi Bildirimi</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-white mt-0.5">{uploadSuccess}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUploadSuccess('')}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all shrink-0 cursor-pointer"
          >
            <span className="text-xs font-black">✕</span>
          </button>
        </div>
      )}

      {/* 1. DELIVERED 4K MASTER EXPORTS (GOOGLE DRIVE / CLOUD) [3, E] */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <FolderDown className="w-5 h-5 text-cyan-400" />
              Teslim Edilen 4K Master Video & Görsel Arşivi (Drive)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ajansımızın sizin için ürettiği yüksek çözünürlüklü nihai exportları tek tıkla Google Drive üzerinden indirin
            </p>
          </div>
          <span className="text-xs font-extrabold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-xl self-start sm:self-center">
            Bulut Deposu Aktif
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {deliveredDrivePackages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between gap-4 hover:border-cyan-500/40 transition-all shadow-md group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {pkg.type}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{pkg.size}</span>
                </div>

                <h4 className="font-extrabold text-sm text-white mt-2.5 group-hover:text-cyan-300 transition-colors">
                  {pkg.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1">{pkg.itemsCount}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-900">
                <span className="text-[11px] text-slate-500">Tarih: {pkg.date}</span>
                <a
                  href={pkg.driveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-cyan-600/20 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Google Drive'dan İndir</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. PRESENTATIONS & PDF REPORTS ARCHIVE [3, E] */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl shadow-xl space-y-5">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Strateji Sunumları & Aylık Performans Raporları
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ajansınız tarafından hazırlanan resmi PDF strateji ve performans dokümanları
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {presentationsAndReports.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 hover:border-indigo-500/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-extrabold text-xs text-white line-clamp-1">{doc.title}</h5>
                  <span className="text-[11px] text-slate-400">{doc.type} • {doc.size}</span>
                </div>
              </div>

              <button
                onClick={() => alert(`"${doc.title}" dökümanı indiriliyor...`)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-300 rounded-xl text-xs font-bold border border-slate-800 transition-all flex items-center gap-1 shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF İndir</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CLIENT DRIVE & ASSET TRANSMISSION POOL (LİNK İLETİM HAVUZU) [3, E] */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 border border-purple-500/30 p-6 rounded-3xl backdrop-blur-xl shadow-xl space-y-5">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-purple-400" />
            Ajansa Dosya & Materyal İletim Havuzu (Google Drive / WeTransfer)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Sunucu kotasını doldurmadan yüksek boyutlu 4K video, fotoğraf ve logo arşivlerinizi Google Drive veya WeTransfer linki olarak tek tıkla ajans ekibimize iletin.
          </p>
        </div>

        {/* Link Submission Form */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target;
            const driveUrl = form.driveUrl.value.trim();
            const note = form.note.value.trim();

            if (!driveUrl) return;

            setUploading(true);
            try {
              if (customer?.client_name) {
                await supabase.from('client_support_messages').insert([{
                  client_name: customer.client_name,
                  sender_type: 'client',
                  message: `🔗 MÜŞTERİ MATERYAL LİNKİ İLETTİ:\n📌 Başlık: ${note || 'Materyal Arşivi'}\n🌐 Link: ${driveUrl}`,
                  is_read: false
                }]);

                await supabase.from('activity_log').insert([{
                  target_name: customer.client_name,
                  action: 'Drive / WeTransfer Linki İletildi',
                  details: `Müşteri yeni materyal linki paylaştı: ${note || driveUrl}`
                }]);
              }

              const newItem = {
                title: note || 'Yeni Materyal Paketi',
                url: driveUrl,
                date: new Date().toLocaleDateString('tr-TR')
              };

              setUploadedFiles(prev => [newItem, ...prev]);
              setUploadSuccess('Materyal linkiniz prodüksiyon ekibimize başarıyla iletildi!');
              form.reset();
              setTimeout(() => setUploadSuccess(''), 5000);
            } catch (err) {
              console.error(err);
            } finally {
              setUploading(false);
            }
          }}
          className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 space-y-4 shadow-inner"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Google Drive, WeTransfer veya Dropbox Linkiniz *</span>
              <span className="text-[10px] text-purple-400">Herkese Açık / Paylaşımlı Link</span>
            </label>
            <input
              name="driveUrl"
              type="url"
              required
              placeholder="https://drive.google.com/drive/folders/... veya https://we.tl/..."
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              Paket Başlığı & Ekip Notunuz (İsteğe Bağlı)
            </label>
            <input
              name="note"
              type="text"
              placeholder="Örn: Ağustos Ayı Yeni Menü Fotoğrafları ve Vektörel Logolarımız"
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{uploading ? 'İletiliyor...' : '🚀 Ajans Prodüksiyon Ekibine İlet'}</span>
          </button>
        </form>

        {/* Submitted Links History */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-400 block">İlettiğiniz Materyal Linkleri:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {uploadedFiles.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs gap-2">
                  <div className="truncate">
                    <span className="text-white font-bold block truncate">{item.title}</span>
                    <a href={item.url} target="_blank" rel="noreferrer" className="text-[11px] text-purple-400 hover:underline truncate block">
                      {item.url}
                    </a>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold shrink-0">✓ İletildi</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
