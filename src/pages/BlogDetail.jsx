import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Share2 } from 'lucide-react';

function BlogDetail() {
  const { id } = useParams();

  // Mock blog data - In a real app, this would come from Supabase
  const blogPosts = {
    "sosyal-medya-algoritma": {
      title: "Sosyal Medya Algoritmaları 2026'da Bizi Neler Bekliyor?",
      date: "06 Nisan 2026",
      author: "Arda Furkan Aslanbaş",
      category: "Strateji",
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      content: `
        <p>Dijital pazarlama dünyası, her geçen gün daha karmaşık ve veri odaklı bir hale geliyor. 2026 yılına girerken, sosyal medya platformlarının algoritmalarında köklü değişiklikler görmeye başladık. Peki, bu yeni dönemde markanızı nasıl konumlandırmalısınız?</p>
        
        <h3>Yapay Zeka Destekli İçerik Dağıtımı</h3>
        <p>Artık algoritmalar sadece takipçi sayınıza veya etkileşim oranlarınıza bakmıyor. Yapay zeka, her kullanıcının anlık ruh halini ve ilgi alanını saniyeler içinde analiz ederek en uygun içeriği karşısına çıkarıyor. Bu, "viral" olmanın artık bir şans değil, bir veri bilimi olduğu anlamına geliyor.</p>
        
        <h3>Topluluk Odaklı Büyüme</h3>
        <p>Geniş kitlelere hitap etmek yerine, sadık ve niş topluluklar oluşturmak 2026'nın anahtarı. Algoritmalar, paylaşılan içeriklerin altındaki gerçek tartışmaları ve topluluk bağlarını ödüllendiriyor.</p>
        
        <blockquote>
          "Marka sadakati, artık sadece reklamla değil, kurulan gerçek bağlarla ölçülüyor."
        </blockquote>
        
        <h3>Önerilerimiz:</h3>
        <ul>
          <li>Video içeriklerinde ilk 2 saniyeye odaklanın.</li>
          <li>Kullanıcı yorumlarına sadece yanıt vermeyin, onları içeriğinizin bir parçası yapın.</li>
          <li>Data analiz araçlarını kullanarak kitle davranışlarınızı haftalık takip edin.</li>
        </ul>
      `
    },
    "kisa-video-gucu": {
      title: "Kısa Video Formatlarının Gücü (Reels, TikTok, Shorts)",
      date: "28 Mart 2026",
      author: "Socialart Ekibi",
      category: "Prodüksiyon",
      image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      content: `
        <p>Kısa video formatları (Short-form video), artık dijital pazarlamanın opsiyonel bir parçası değil, tam kalbi konumunda. Reels, TikTok ve YouTube Shorts arasındaki yarış, markalar için devasa bir fırsat havuzu oluşturuyor.</p>
        
        <h3>Neden Kısa Video?</h3>
        <p>İnsanların dikkat süresinin 8 saniyenin altına düştüğü bir çağda, mesajınızı hızlı ve etkileyici bir şekilde iletmek zorundasınız. Kısa videolar, en yüksek organik erişim oranına sahip formatlar olarak öne çıkıyor.</p>
        
        <h3>Sinematik Dokunuşun Önemi</h3>
        <p>Doğal içerikler (UGC) hala çok değerli ancak 2026'da "premium" hissettiren, kaliteli ışık ve kurguya sahip videoların daha çok ödüllendirildiğini görüyoruz. Sosyal Art olarak bizim odaklandığımız nokta da tam olarak bu: Doğallığı bozmadan sinematik kaliteyi yakalamak.</p>
      `
    },
    "kampanya-kurgusu": {
      title: "Etkili Bir Kampanya Kurgusu Nasıl Hazırlanır?",
      date: "14 Mart 2026",
      author: "Socialart Strateji",
      category: "Reklam",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      content: `
        <p>Bir reklam kampanyasının başarılı olması için sadece bütçe ayırmak yetmez. Doğru kurgu, doğru hedefleme ve etkileyici kreatiflerin bir araya gelmesi gerekir.</p>
        
        <h3>Satış Hunisi (Sales Funnel) Mantığı</h3>
        <p>Hedef kitlenizi henüz markanızı tanımıyorken doğrudan satışa zorlamayın. Farkındalık, ilgi, arzu ve eylem (AIDA) adımlarını izleyerek kitlenizi ısıtın.</p>
      `
    }
  };

  const post = blogPosts[id] || blogPosts["sosyal-medya-algoritma"];

  return (
    <div className="blog-detail-page" style={{ paddingTop: '120px', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div className="container">
        {/* Navigation */}
        <Link to="/blog" className="btn btn-outline" style={{ marginBottom: '40px', padding: '10px 20px', fontSize: '0.9rem' }}>
          <ArrowLeft size={18} /> Blog Listesine Dön
        </Link>

        <article className="blog-content-wrap glass" style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
          {/* Header Image */}
          <div style={{ width: '100%', height: '400px', overflow: 'hidden', position: 'relative' }}>
            <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '40px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
               <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                 <span className="glass" style={{ padding: '6px 16px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)' }}>{post.category}</span>
               </div>
               <h1 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: '1.2' }}>{post.title}</h1>
            </div>
          </div>

          {/* Meta Info */}
          <div style={{ padding: '30px 60px', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
             <div style={{ display: 'flex', gap: '25px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                 <Calendar size={16} /> <span>{post.date}</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                 <User size={16} /> <span>{post.author}</span>
               </div>
             </div>
             <div style={{ display: 'flex', gap: '15px' }}>
               <button className="glass" style={{ padding: '10px', borderRadius: '50%', color: 'var(--text-color)' }}><Share2 size={18} /></button>
             </div>
          </div>

          {/* Body Content */}
          <div 
            className="blog-body" 
            style={{ padding: '60px', color: '#ddd', fontSize: '1.2rem', lineHeight: '1.8' }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Footer CTA */}
          <div style={{ padding: '60px', background: 'rgba(138,43,226,0.05)', textAlign: 'center', borderTop: '1px solid var(--surface-border)' }}>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>Bu Konuda Yardıma mı İhtiyacınız Var?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px auto' }}>Uzman ekibimiz markanıza özel stratejiler geliştirmek için hazır. Hemen bir ön görüşme planlayalım.</p>
            <a href="/#funnel" className="btn btn-primary">Ücretsiz Analiz İstiyorum</a>
          </div>
        </article>
      </div>

      <style>{`
        .blog-body h3 { color: #fff; margin: 40px 0 20px 0; font-size: 1.8rem; font-weight: 700; }
        .blog-body p { margin-bottom: 25px; }
        .blog-body blockquote { border-left: 4px solid var(--primary); padding: 20px 40px; margin: 40px 0; background: rgba(138,43,226,0.05); font-style: italic; font-size: 1.4rem; color: #fff; }
        .blog-body ul { margin-bottom: 25px; padding-left: 20px; }
        .blog-body li { margin-bottom: 15px; }
        @media (max-width: 768px) {
          .blog-body { padding: 30px 20px; font-size: 1.1rem; }
          .blog-content-wrap h1 { font-size: 2rem !important; }
        }
      `}</style>
    </div>
  );
}

export default BlogDetail;
