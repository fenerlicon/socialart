import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, User, Share2, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

const stripCdata = (str) => {
  if (!str) return '';
  return str
    .replace(/<!\[CDATA\[/gi, '')
    .replace(/\]\]>/gi, '')
    .replace(/&lt;!\[CDATA\[/gi, '')
    .replace(/\]\]&gt;/gi, '')
    .trim();
};

function BlogDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('slug', id)
          .single();
          
        if (error) throw error;
        setPost(data);
      } catch (err) {
        console.error('Blog çekerken hata oluştu:', err);
        setError('Aradığınız blog yazısı bulunamadı.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="blog-detail-page" style={{ paddingTop: '200px', minHeight: '100vh', background: 'var(--bg-color)', textAlign: 'center' }}>
        <Loader className="spin" size={60} color="var(--primary)" style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }} />
        <h3 style={{ marginTop: '20px', color: '#aaa' }}>Makale Yükleniyor...</h3>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-detail-page" style={{ paddingTop: '200px', minHeight: '100vh', background: 'var(--bg-color)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>{error || 'Blog bulunamadı.'}</h2>
        <Link to="/blog" className="btn btn-primary">Bloglara Dön</Link>
      </div>
    );
  }

  return (
    <div className="blog-detail-page" style={{ paddingTop: '200px', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div className="container">
        {/* Navigation */}
        <Link to="/blog" className="btn btn-outline" style={{ marginBottom: '40px', padding: '10px 20px', fontSize: '0.9rem' }}>
          <ArrowLeft size={18} /> Blog Listesine Dön
        </Link>

        <article className="blog-content-wrap glass" style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
          {/* Header Image */}
          <div style={{ width: '100%', height: '450px', overflow: 'hidden', position: 'relative' }}>
            <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '50px', background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)' }}>
               <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                 <span className="glass" style={{ padding: '8px 20px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '1px' }}>DİJİTAL PAZARLAMA</span>
               </div>
               <h1 style={{ fontSize: '3.5rem', fontWeight: '900', lineHeight: '1.2' }}>{stripCdata(post.title)}</h1>
            </div>
          </div>

          {/* Meta Info */}
          <div style={{ padding: '30px 60px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
             <div style={{ display: 'flex', gap: '30px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#bbb', fontWeight: '500' }}>
                 <Calendar size={18} color="var(--primary)" /> <span>{new Date(post.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#bbb', fontWeight: '500' }}>
                 <User size={18} color="var(--primary)" /> <span>Socialart Ekibi</span>
               </div>
             </div>
             <div style={{ display: 'flex', gap: '15px' }}>
               <button 
                className="btn btn-outline" 
                style={{ padding: '10px 20px', borderRadius: '50px' }} 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Bağlantı kopyalandı!");
                }}>
                 <Share2 size={16} /> Paylaş
               </button>
             </div>
          </div>

          {/* Body Content */}
          <div 
            className="blog-body" 
            style={{ padding: '60px', color: '#ddd', fontSize: '1.25rem', lineHeight: '1.9' }}
            dangerouslySetInnerHTML={{ __html: stripCdata(post.content) }}
          />

          {/* Footer CTA */}
          <div style={{ padding: '80px 40px', background: 'radial-gradient(circle at center, rgba(138,43,226,0.1) 0%, transparent 70%)', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ fontSize: '2.5rem', marginBottom: '20px', fontWeight: '800' }}>Markanızı Büyütmeye Hazır mısınız?</h3>
            <p style={{ color: '#aaa', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto', fontSize: '1.1rem' }}>Uzman ekibimiz markanıza özel dijital pazarlama ve büyüme stratejileri geliştirmek için hazır. Hemen ücretsiz analiz talebinde bulunun.</p>
            <a href="/#funnel" className="btn btn-primary" style={{ padding: '18px 40px', fontSize: '1.1rem' }}>Ekibimizle Toplantı Planlayın <ArrowRight size={20} style={{ marginLeft: '10px' }} /></a>
          </div>
        </article>
      </div>

      <style>{`
        .blog-body h2 { color: #fff; margin: 60px 0 25px 0; font-size: 2.2rem; font-weight: 800; line-height: 1.3; }
        .blog-body h3 { color: #fff; margin: 40px 0 20px 0; font-size: 1.8rem; font-weight: 700; line-height: 1.3; }
        .blog-body p { margin-bottom: 30px; font-weight: 400; }
        .blog-body blockquote { border-left: 4px solid var(--primary); padding: 25px 40px; margin: 50px 0; background: rgba(255,0,85,0.05); font-style: italic; font-size: 1.5rem; color: #fff; border-radius: 0 15px 15px 0; }
        .blog-body ul { margin-bottom: 30px; padding-left: 20px; }
        .blog-body li { margin-bottom: 15px; }
        @media (max-width: 768px) {
          .blog-body { padding: 40px 20px; font-size: 1.1rem; }
          .blog-content-wrap h1 { font-size: 2.2rem !important; }
        }
      `}</style>
    </div>
  );
}

export default BlogDetail;

