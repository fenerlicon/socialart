import React from 'react';
import { Link } from 'react-router-dom';

function Blog() {
  const posts = [
    {
      id: "sosyal-medya-algoritma",
      title: "Sosyal Medya Algoritmaları 2026'da Bizi Neler Bekliyor?",
      date: "06 Nisan 2026",
      excerpt: "Büyük platformlardaki en son algoritma değişiklikleri ve markanız için almanız gereken aksiyonlar...",
    },
    {
      id: "kisa-video-gucu",
      title: "Kısa Video Formatlarının Gücü (Reels, TikTok, Shorts)",
      date: "28 Mart 2026",
      excerpt: "Etkileşiminizi ve marka bilinirliğinizi artırmak için kısa video formatlarını nasıl optimize etmelisiniz?",
    },
    {
      id: "kampanya-kurgusu",
      title: "Etkili Bir Kampanya Kurgusu Nasıl Hazırlanır?",
      date: "14 Mart 2026",
      excerpt: "Baştan sona dönüşüm getiren bir reklam kampanya stratejisinin olmazsa olmaz adımları.",
    }
  ];

  return (
    <>
      <section className="section-padding" style={{ paddingTop: '150px', minHeight: '100vh' }}>
        <div className="container">
          <h1 className="section-title">Blog & <span className="gradient-text">Makaleler</span></h1>
          <p className="section-subtitle">Dijital pazarlama dünyasından en güncel haberler ve stratejiler.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '40px' }}>
            {posts.map((post) => (
              <div key={post.id} className="glass" style={{ padding: '30px', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '10px' }}>{post.date}</span>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '15px' }}>{post.title}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '20px', flex: 1 }}>
                  {post.excerpt}
                </p>
                <Link to={`/blog/${post.id}`} className="btn btn-outline" style={{ alignSelf: 'flex-start' }}>Devamını Oku</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Blog;
