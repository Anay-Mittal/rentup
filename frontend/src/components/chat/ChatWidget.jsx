import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Sparkles,
  ArrowRight,
  ImageOff,
} from 'lucide-react';
import { API_BASE_URL as BASE_URL } from '../../config';
import './ChatWidget.css';

const INITIAL_MESSAGE = {
  role: 'bot',
  text: "Hi! I'm your property assistant. Ask me something like \"find me a 2BHK in Mumbai under 1 crore\" or \"any rentals in Bangalore\".",
  matches: [],
};

const formatPrice = (p) => {
  const n = Number(p.price || 0).toLocaleString('en-IN');
  return p.listingType === 'rent' ? `₹${n}/${p.rentPeriod || 'monthly'}` : `₹${n}`;
};

const resolveImage = (img) => {
  if (!img) return null;
  return img.startsWith('http') ? img : `${BASE_URL}/${img}`;
};

const PropertyCard = ({ match, onOpen }) => {
  const [broken, setBroken] = useState(false);
  const src = resolveImage(match.image);

  return (
    <button type="button" className="cw-card" onClick={() => onOpen(match._id)}>
      <div className="cw-card-img">
        {src && !broken ? (
          <img src={src} alt={match.title} onError={() => setBroken(true)} />
        ) : (
          <ImageOff size={20} />
        )}
      </div>
      <div className="cw-card-body">
        <div className="cw-card-header">
          <span className="cw-card-title">{match.title}</span>
          <span
            className={`cw-card-chip ${
              match.listingType === 'rent' ? 'chip-rent' : 'chip-sale'
            }`}
          >
            {match.listingType === 'rent' ? 'RENT' : 'SALE'}
          </span>
        </div>
        <div className="cw-card-meta">
          <span className="cw-card-price">{formatPrice(match)}</span>
          <span className="cw-card-loc">{match.location}</span>
        </div>
        {(match.pros?.length > 0 || match.cons?.length > 0) && (
          <div className="cw-card-pros-cons">
            {match.pros?.length > 0 && (
              <div className="cw-pros">
                <span className="cw-label">Pros</span>
                <ul>
                  {match.pros.slice(0, 3).map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            {match.cons?.length > 0 && (
              <div className="cw-cons">
                <span className="cw-label">Cons</span>
                <ul>
                  {match.cons.slice(0, 3).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <span className="cw-card-open">
          Open <ArrowRight size={12} />
        </span>
      </div>
    </button>
  );
};

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const openProperty = (id) => {
    setOpen(false);
    navigate(`/property/${id}`);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      const { data } = await axios.post(`${BASE_URL}/api/chat`, { message: text });
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: data.reply, matches: data.matches || [] },
      ]);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Something went wrong. Please try again.';
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: msg, matches: [], error: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const suggestions = [
    'Find me a 2BHK in Mumbai under 1 crore',
    'Any rentals in Bangalore under 50k',
    'Show me farmhouses for rent',
  ];

  return (
    <>
      {!open && (
        <button
          type="button"
          className="cw-fab"
          onClick={() => setOpen(true)}
          aria-label="Open chat"
        >
          <MessageCircle size={22} />
          <span className="cw-fab-label">Ask AI</span>
        </button>
      )}

      {open && (
        <div className="cw-panel" role="dialog" aria-label="AI Property Assistant">
          <header className="cw-header">
            <div className="cw-header-info">
              <div className="cw-header-icon">
                <Sparkles size={16} />
              </div>
              <div>
                <h4>Property Assistant</h4>
                <p>Powered by Gemini</p>
              </div>
            </div>
            <button
              type="button"
              className="cw-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </header>

          <div ref={scrollRef} className="cw-body">
            {messages.map((m, i) => (
              <div key={i} className={`cw-msg cw-msg-${m.role}`}>
                <div className={`cw-bubble ${m.error ? 'cw-bubble-error' : ''}`}>
                  {m.text}
                </div>
                {m.matches && m.matches.length > 0 && (
                  <div className="cw-matches">
                    {m.matches.map((match) => (
                      <PropertyCard
                        key={match._id}
                        match={match}
                        onOpen={openProperty}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="cw-msg cw-msg-bot">
                <div className="cw-bubble cw-thinking">
                  <Loader2 size={14} className="cw-spin" />
                  <span>Searching properties…</span>
                </div>
              </div>
            )}

            {messages.length === 1 && !loading && (
              <div className="cw-suggestions">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="cw-suggestion"
                    onClick={() => {
                      setInput(s);
                      setTimeout(() => inputRef.current?.focus(), 0);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <footer className="cw-footer">
            <input
              ref={inputRef}
              type="text"
              className="cw-input"
              placeholder="Describe the property you want…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              type="button"
              className="cw-send"
              onClick={send}
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </footer>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
