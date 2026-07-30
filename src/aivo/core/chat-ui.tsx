import React, { useState, useEffect, useRef } from 'react';
import { Aivo } from '../../aivo-mascot';
import { AivoContextManager } from './context-manager';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AivoGlobalChat({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize context manager
  useEffect(() => {
    AivoContextManager.getInstance();
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const contextManager = AivoContextManager.getInstance();
      const pageContext = contextManager.getContext();

      // Envia para API worker
      const response = await fetch('https://studymaster-worker.cesarmuniz0816.workers.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'aivo-context',
          message: userMessage,
          history: messages.slice(-10),
          pageContext: pageContext,
          timestamp: Date.now()
        })
      });

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      
      const reply = data.reply || data.response || 'Desculpe, ocorreu um erro ao processar sua resposta.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      
    } catch (error) {
      console.error('[AivoChat] Erro na comunicacao:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, ocorreu um erro de conexão. Tente novamente mais tarde.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen && messages.length === 0) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '90px',
        right: '20px',
        width: '380px',
        maxWidth: 'calc(100vw - 40px)',
        height: '500px',
        maxHeight: 'calc(100vh - 120px)',
        backgroundColor: 'var(--card-bg, #fff)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        display: isOpen ? 'flex' : 'none',
        flexDirection: 'column',
        zIndex: 99999,
        border: '1px solid var(--border-color, #eaeaea)',
        overflow: 'hidden'
      }}
      role="dialog"
      aria-label="Assistente Contextual Aivo"
      aria-modal="false" // not modal, user can interact with page
    >
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--border-color, #eaeaea)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--primary-light, #f7f9fc)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 32, height: 32, transform: 'scale(0.8)', transformOrigin: 'left center' }}>
             <Aivo size={32} state="idle" themeMode="light" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary, #111)' }}>AIVO Assistente</h3>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary, #666)' }}>Contexto dinâmico ativo</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          aria-label="Fechar chat"
          style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--text-secondary, #666)', padding: '4px'
          }}
        >
          ×
        </button>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-secondary, #666)', fontSize: '14px', maxWidth: '80%' }}>
            <p>Olá! Eu sou o AIVO. Estou conectado a esta página e posso ajudar com dúvidas sobre o conteúdo exibido.</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            backgroundColor: msg.role === 'user' ? 'var(--primary-color, #0056b3)' : 'var(--bg-secondary, #f0f0f0)',
            color: msg.role === 'user' ? '#fff' : 'var(--text-primary, #333)',
            padding: '10px 14px',
            borderRadius: msg.role === 'user' ? '14px 14px 0 14px' : '14px 14px 14px 0',
            fontSize: '14px',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap'
          }}>
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', padding: '10px 14px', backgroundColor: 'var(--bg-secondary, #f0f0f0)', borderRadius: '14px 14px 14px 0' }}>
            <div className="typing-indicator" style={{ display: 'flex', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', backgroundColor: '#999', borderRadius: '50%', animation: 'blink 1.4s infinite both' }}></span>
              <span style={{ width: '6px', height: '6px', backgroundColor: '#999', borderRadius: '50%', animation: 'blink 1.4s infinite both 0.2s' }}></span>
              <span style={{ width: '6px', height: '6px', backgroundColor: '#999', borderRadius: '50%', animation: 'blink 1.4s infinite both 0.4s' }}></span>
            </div>
            <style>{`@keyframes blink { 0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; } }`}</style>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{
        padding: '14px',
        borderTop: '1px solid var(--border-color, #eaeaea)'
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Faça uma pergunta sobre a página..."
            disabled={isLoading}
            rows={1}
            style={{
              flex: 1,
              resize: 'none',
              padding: '10px 12px',
              borderRadius: '20px',
              border: '1px solid var(--border-color, #ccc)',
              outline: 'none',
              fontSize: '14px',
              fontFamily: 'inherit',
              backgroundColor: isLoading ? '#f5f5f5' : '#fff',
              maxHeight: '100px',
              minHeight: '40px'
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: input.trim() && !isLoading ? 'var(--primary-color, #0056b3)' : '#ccc',
              color: '#fff',
              border: 'none',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            aria-label="Enviar mensagem"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
