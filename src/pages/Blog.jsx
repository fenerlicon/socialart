import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Loader, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';

const stripCdata = (str) => {
  if (!str) return '';
  return str
    .replace(/<!\[CDATA\[/gi, '')
    .replace(/\]\]>/gi, '')
    .replace(/&lt;!\[CDATA\[/gi, '')
    .replace(/\]\]&gt;/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const getCategory = (post) => {
  const slug = post.slug.toLowerCase();
  const title = post.title.toLowerCase();
  
  if (slug.includes('ugc') || slug.includes('influencer') || title.includes('ugc') || title.includes('influencer')) {
    return 'UGC ve Influencer Pazarlaması';
  }
  if (slug.includes('kreatif') || title.includes('kreatif') || slug.includes('reklam-kreatifi') || title.includes('reklam kreatif')) {
    return 'Kreatif ve Reklam Performansı';
  }
  if (slug.includes('meta') || slug.includes('reklam') || title.includes('reklam') || title.includes('meta')) {
    return 'Meta Reklam Rehberleri';
  }
  if (slug.includes('sosyal-medya') || slug.includes('instagram') || title.includes('sosyal medya') || title.includes('instagram')) {
    return 'Sosyal Medya Yönetimi Rehberleri';
  }
  if (slug.includes('buyut') || slug.includes('büyüt') || slug.includes('growth') || slug.includes('danisman') || title.includes('büyüt') || title.includes('growth') || title.includes('danışman') || title.includes('strateji')) {
    return 'Marka Büyütme Rehberleri';
  }
  
  return 'Genel Dijital Pazarlama';
};

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setPosts(data || []);
      } catch (err) {
        console.error('Blogları çekerken hata oluştu:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchBlogs();
  }, []);

  const categories = [
    'Tümü',
    'Meta Reklam Rehberleri',
    'Sosyal Medya Yönetimi Rehberleri',
    'UGC ve Influencer Pazarlaması',
    'Kreatif ve Reklam Performansı',
    'Marka Büyütme Rehberleri'
  ];

  const filteredPosts = posts.filter(post => {
    if (selectedCategory === 'Tümü') return true;
    return getCategory(post) === selectedCategory;
  });

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
          .cat-btn {
            padding: 10px 20px;
            border-radius: 50px;
            background: rgba(255,255,255,0.02);
            border: 1px solid rgba(255,255,255,0.05);
            color: #ccc;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .cat-btn.active {
            background: var(--primary);
            border-color: var(--primary);
            color: #fff;
            box-shadow: 0 5px 15px rgba(255,0,85,0.25);
          }
          .cat-btn:hover:not(.active) {
            background: rgba(255,255,255,0.06);
            color: #fff;
            border-color: rgba(255,255,255,0.15);
          }
        `}
      </style>
      <section className="section-padding" style={{ paddingTop: '320px', minHeight: '100vh', background: 'var(--bg-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 className="section-title" style={{ fontSize: '3.5rem', marginBottom: '15px' }}>Blog & <span className="gradient-text">Strateji</span></h1>
            <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>Dijital dünyadaki büyüme yolculuğunuzda size rehberlik edecek teknik bilgiler ve güncel market trendleri.</p>
          </div>

          {/* Categories bar */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '60px' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '50px' }}>
                <Loader className="spin" size={40} color="var(--primary)" style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '15px', color: '#aaa' }}>Bloglar yükleniyor...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '50px', color: '#aaa' }}>
                Seçili kategoride henüz blog yazısı bulunmuyor.
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.slug} className="glass blog-card">
                  <div className="blog-image-wrap">
                    <img src={post.cover_image} alt={post.title} className="blog-image" width="400" height="250" loading="lazy" />
                    <div className="blog-overlay">
                      <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px' }}>OKUMAYA BAŞLA</span>
                    </div>
                  </div>
                  
                  <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '15px', fontWeight: '600', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={14} color="var(--primary)" /> {new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={14} color="var(--primary)" /> {post.read_time}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px' }}><Tag size={12} color="var(--primary)" /> {getCategory(post)}</span>
                    </div>
                    
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '15px', fontWeight: '800', lineHeight: '1.3' }}>{stripCdata(post.title)}</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '25px', flex: 1, lineHeight: '1.6', fontSize: '0.95rem' }}>
                      {stripCdata(post.excerpt)}
                    </p>
                    
                    <Link to={`/blog/${post.slug}`} style={{ 
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
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default Blog;
