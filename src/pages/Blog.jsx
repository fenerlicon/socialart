import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

const stripCdata = (str) => {
  if (!str) return '';
  // Standard CDATA, encoded CDATA, and trailing markers
  return str
    .replace(/<!\[CDATA\[/gi, '')
    .replace(/\]\]>/gi, '')
    .replace(/&lt;!\[CDATA\[/gi, '')
    .replace(/\]\]&gt;/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <section className="section-padding" style={{ paddingTop: '220px', minHeight: '100vh', background: 'var(--bg-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h1 className="section-title" style={{ fontSize: '3.5rem', marginBottom: '15px' }}>Blog & <span className="gradient-text">Strateji</span></h1>
            <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>Dijital dünyadaki büyüme yolculuğunuzda size rehberlik edecek teknik bilgiler ve güncel market trendleri.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '50px' }}>
                <Loader className="spin" size={40} color="var(--primary)" style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: '15px', color: '#aaa' }}>Bloglar yükleniyor...</p>
              </div>
            ) : posts.length === 0 ? (
              <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '50px', color: '#aaa' }}>
                Henüz blog yazısı bulunmuyor.
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.slug} className="glass blog-card">
                  <div className="blog-image-wrap">
                    <img src={post.cover_image} alt={post.title} className="blog-image" />
                    <div className="blog-overlay">
                      <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1px' }}>OKUMAYA BAŞLA</span>
                    </div>
                  </div>
                  
                  <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '15px', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '15px', fontWeight: '600' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={14} color="var(--primary)" /> {new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={14} color="var(--primary)" /> {post.read_time}</span>
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
