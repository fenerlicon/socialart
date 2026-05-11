import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div 
      className="glass faq-item" 
      style={{ 
        marginBottom: '15px', 
        borderRadius: '20px', 
        overflow: 'hidden', 
        border: '1px solid rgba(255,255,255,0.05)',
        transition: 'all 0.3s ease'
      }}
    >
      <button
        onClick={onClick}
        style={{
          width: '100%',
          padding: '25px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          color: '#fff'
        }}
      >
        <span style={{ fontSize: '1.1rem', fontWeight: '700', color: isOpen ? 'var(--primary)' : '#fff' }}>
          {question}
        </span>
        {isOpen ? <ChevronUp size={20} color="var(--primary)" /> : <ChevronDown size={20} color="#666" />}
      </button>
      
      <div 
        style={{ 
          maxHeight: isOpen ? '500px' : '0', 
          opacity: isOpen ? 1 : 0,
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'rgba(255,255,255,0.02)'
        }}
      >
        <div style={{ padding: '0 25px 25px 25px', color: '#aaa', lineHeight: '1.7', fontSize: '1rem' }}>
          {answer}
        </div>
      </div>
    </div>
  );
};

const FAQAccordion = ({ items }) => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="faq-accordion" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {items.map((item, index) => (
        <FAQItem 
          key={index}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === index}
          onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
        />
      ))}
    </div>
  );
};

export default FAQAccordion;
