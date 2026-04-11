import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

function Blog() {
  const posts = [
    {
      id: "sosyal-medya-algoritma",
      title: "Sosyal Medya Algoritmaları 2026'da Bizi Neler Bekliyor?",
      date: "06 Nisan 2026",
      readTime: "5 dk okuma",
      excerpt: "Büyük platformlardaki en son algoritma değişiklikleri ve markanız için almanız gereken aksiyonlar. Yapay zeka destekli içeriklerin yükselişi ve daha fazlası...",
      image: "C:/Users/Arda Furkan Aslanbaş/.gemini/antigravity/brain/5d2f4a43-3adf-45f3-b31a-8e94e55e6446/blog_cover_social_media_1775892898145.png"
    },
    {
      id: "kisa-video-gucu",
      title: "Kısa Video Formatlarının Gücü (Reels, TikTok, Shorts)",
      date: "28 Mart 2026",
      readTime: "4 dk okuma",
      excerpt: "Etkileşiminizi ve marka bilinirliğinizi artırmak için kısa video formatlarını nasıl optimize etmelisiniz? Viral olmanın matematiği çözüldü mü?",
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800"
    },
    {
      id: "kampanya-kurgusu",
      title: "Etkili Bir Kampanya Kurgusu Nasıl Hazırlanır?",
      date: "14 Mart 2026",
      readTime: "7 dk okuma",
      excerpt: "Baştan sona dönüşüm getiren bir reklam kampanya stratejisinin olmazsa olmaz adımları. Funnel kurgusundan kreatif optimizasyonuna kadar her şey.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
    }
  ];

  return (
    <>
      <style>
        {`
          .blog-card {
            transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
            height: 100%;
            display: flex;
            flex-direction: column;
            border: 1px solid rgba(255,255,255,0.05);
          }
          .blog-card:hover {
            transform: translateY(-10px);
            border-color: var(--primary);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          }
          .blog-image-wrap {
            height: 220px;
            overflow: hidden;
            border-radius: 12px 12px 0 0;
            position: relative;
          }
          .blog-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.6s ease;
          }
          .blog-card:hover .blog-image {
            transform: scale(1.1);
          }
          .blog-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.7));
            opacity: 0;
            transition: opacity 0.3s ease;
            display: flex;
            align-items: flex-end;
            padding: 20px;
          }
          .blog-card:hover .blog-overlay {
            opacity: 1;
          }
        `}
      </style>
      <section className="section-padding" style={{ paddingTop: '150px', minHeight: '100vh', background: 'var(--bg-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 className="section-title" style={{ fontSize: '3.5rem', marginBottom: '15px' }}>Blog & <span className="gradient-text">Strateji</span></h1>
            <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>Dijital dünyadaki büyüme yolculuğunuzda size rehberlik edecek teknik bilgiler ve güncel market trendleri.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
            {posts.map((post) => (
              <div key={post.id} className="glass blog-card">
                <div className="blog-image-wrap">
                  <img src={post.image} alt={post.title} className="blog-image" />
                  <div className="blog-overlay">
                    <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px' }}>OKUMAYA BAŞLA</span>
                  </div>
                </div>
                
                <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '15px', fontWeight: '600' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={14} color="var(--primary)" /> {post.date}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={14} color="var(--primary)" /> {post.readTime}</span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '15px', fontWeight: '800', lineHeight: '1.3' }}>{post.title}</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '25px', flex: 1, lineHeight: '1.6', fontSize: '0.95rem' }}>
                    {post.excerpt}
                  </p>
                  
                  <Link to={`/blog/${post.id}`} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    color: 'var(--primary)', 
                    fontWeight: '800', 
                    fontSize: '0.9rem',
                    textDecoration: 'none',
                    marginTop: 'auto'
                  }}>
                    Devamını Oku <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Blog;
