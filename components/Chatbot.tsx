'use client';
import { Menu, Send, SendHorizonal, User, X } from 'lucide-react';
import { Nunito } from 'next/font/google';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button, Card, Input, Textarea } from './aspect-ui';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
});

type Sender = 'user' | 'bot';

interface Message {
  id: string;
  text: string;
  sender: Sender;
  timestamp: string; // store as ISO string for localStorage
  suggestions?: number[];
  isStreaming?: boolean;
}

interface Question {
  id: number;
  question: string;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  date: string; // YYYY-MM-DD
  messages: Message[];
}

const STORAGE_KEY = 'nafis_chat_sessions_v1';

const COMMANDS = [
  {
    key: 'hire',
    label: 'Hire / Work with you',
    question: 'Are you available for freelancing or new projects?',
  },
  {
    key: 'skills',
    label: 'Your skills',
    question: 'Tell me about your skills',
  },
  {
    key: 'projects',
    label: 'Projects you have built',
    question: 'What kind of web projects have you built?',
  },
  {
    key: 'about',
    label: 'About you',
    question: 'Can you introduce yourself?',
  },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [locked, setLocked] = useState(false); // prevent multitasking while bot responds
  const [inputValue, setInputValue] = useState('');

  const [historyOpen, setHistoryOpen] = useState(false);

  // Command palette
  const [showCommands, setShowCommands] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<NodeJS.Timeout | null>(null);
  const fullTextRef = useRef<string>('');
  const currentBotId = useRef<string | null>(null);
  const initializedRef = useRef(false);

  const hireRegex = /(hire|freelance|freelancer|project|availability|work with|contract)/i;
  const [showHireFormFor, setShowHireFormFor] = useState<string | null>(null);

  // ---- Derived: active session & messages ----
  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || null,
    [sessions, activeSessionId]
  );

  const messages: Message[] = activeSession?.messages || [];

  // ---- Load FAQ questions from API (for suggestions) ----
  useEffect(() => {
    fetch('/api/chat')
      .then((r) => r.json())
      .then((d) => setQuestions(d.questions || []))
      .catch(() => { });
  }, []);

  // ---- Load sessions from localStorage & ensure today session exists ----
  // useEffect(() => {
  //   if (typeof window === 'undefined') return;

  //   try {
  //     const raw = localStorage.getItem(STORAGE_KEY);
  //     let loaded: ChatSession[] = raw ? JSON.parse(raw) : [];

  //     const today = new Date();
  //     const todayStr = today.toISOString().slice(0, 10);

  //     // find today's session
  //     let todaySession = loaded
  //       .filter((s) => s.date === todayStr)
  //       .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))[0];

  //     if (!todaySession) {
  //       // create new session for today with welcome message
  //       const welcomeMessage: Message = {
  //         id: 'welcome',
  //         text: "Hi there! 👋 I'm Nafis's AI assistant. Ask me anything!",
  //         sender: 'bot',
  //         timestamp: new Date().toISOString(),
  //         suggestions: [11, 2, 8],
  //       };

  //       todaySession = {
  //         id: `session-${Date.now()}`,
  //         title: `Chat on ${todayStr}`,
  //         createdAt: new Date().toISOString(),
  //         date: todayStr,
  //         messages: [welcomeMessage],
  //       };

  //       loaded = [...loaded, todaySession];
  //     }

  //     setSessions(loaded);
  //     setActiveSessionId(todaySession.id);
  //     initializedRef.current = true;
  //   } catch (e) {
  //     console.error('Failed to load sessions', e);
  //     // fallback: create a default session
  //     const today = new Date();
  //     const todayStr = today.toISOString().slice(0, 10);

  //     const welcomeMessage: Message = {
  //       id: 'welcome',
  //       text: "Hi there! 👋 I'm Nafis's AI assistant. Ask me anything!",
  //       sender: 'bot',
  //       timestamp: new Date().toISOString(),
  //       suggestions: [11, 2, 8],
  //     };

  //     const s: ChatSession = {
  //       id: `session-${Date.now()}`,
  //       title: `Chat on ${todayStr}`,
  //       createdAt: new Date().toISOString(),
  //       date: todayStr,
  //       messages: [welcomeMessage],
  //     };
  //     setSessions([s]);
  //     setActiveSessionId(s.id);
  //     initializedRef.current = true;
  //   }
  // }, []);

  // ---- Load sessions from localStorage & ensure today session exists ----
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const raw = localStorage.getItem(STORAGE_KEY);
    let loaded: ChatSession[] = raw ? JSON.parse(raw) : [];

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    // Try to get today's session
    let todaySession = loaded.find(s => s.date === todayStr);

    // If no session for today → create one
    if (!todaySession) {
      const welcomeMessage: Message = {
        id: 'welcome',
        text: "Hi there! 👋 I'm Nafis's AI assistant. Ask me anything!",
        sender: 'bot',
        timestamp: new Date().toISOString(),
        suggestions: [11, 2, 8],
      };

      todaySession = {
        id: `session-${Date.now()}`,
        title: `Chat on ${todayStr}`,
        createdAt: new Date().toISOString(),
        date: todayStr,
        messages: [welcomeMessage],
      };

      loaded.push(todaySession);
    }

    // ---- IMPORTANT FIX: always set last session active ----
    const latest = loaded[loaded.length - 1];

    setSessions(loaded);
    setActiveSessionId(latest.id);   // ← fixes blank history on reload
    initializedRef.current = true;
  }, []);

  // ---- Persist sessions to localStorage whenever they change ----
  useEffect(() => {
    if (!initializedRef.current) return;
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions', e);
    }
  }, [sessions]);

  // ---- Scroll to bottom on new messages ----
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ---- Helpers to update active session messages ----
  const updateActiveSession = (updater: (msgs: Message[]) => Message[]) => {
    if (!activeSessionId) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId ? { ...s, messages: updater(s.messages) } : s
      )
    );
  };

  const appendMessage = (msg: Message) => {
    updateActiveSession((msgs) => [...msgs, msg]);
  };

  // ---- Main sendMessage logic ----
  const sendMessage = async (text?: string) => {
    if (!activeSessionId) return;
    if (locked) return;

    const msg = (text ?? inputValue).trim();
    if (!msg) return;

    setLocked(true);
    setShowHireFormFor(null);
    setInputValue('');
    setShowCommands(false);
    setCommandQuery('');

    const nowISO = new Date().toISOString();

    // user message
    appendMessage({
      id: `${Date.now()}`,
      text: msg,
      sender: 'user',
      timestamp: nowISO,
    });

    const hiringIntent = hireRegex.test(msg);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: msg }),
      });

      const data = await res.json();
      const answer =
        data.answer || data?.output?.content || "I don't have enough info to answer that.";
      const suggestions: number[] = data.suggestions || [];

      const botId = `b-${Date.now()}`;
      fullTextRef.current = answer;
      currentBotId.current = botId;

      // add placeholder bot message
      appendMessage({
        id: botId,
        text: '',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isStreaming: true,
      });

      let i = 0;
      streamRef.current = setInterval(() => {
        i++;
        updateActiveSession((msgs) =>
          msgs.map((m) =>
            m.id === botId ? { ...m, text: answer.slice(0, i), isStreaming: true } : m
          )
        );

        if (i >= answer.length) {
          if (streamRef.current) {
            clearInterval(streamRef.current);
            streamRef.current = null;
          }
          currentBotId.current = null;

          updateActiveSession((msgs) =>
            msgs.map((m) =>
              m.id === botId
                ? { ...m, text: answer, isStreaming: false, suggestions }
                : m
            )
          );

          setLocked(false);
          if (hiringIntent) setShowHireFormFor(botId);
        }
      }, 15);
    } catch (e) {
      console.error(e);
      appendMessage({
        id: `err-${Date.now()}`,
        text: '⚠ Something went wrong. Please try again.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
      });
      setLocked(false);
    }
  };

  // ---- Stop streaming & reveal full text ----
  const stopStreaming = () => {
    if (streamRef.current) {
      clearInterval(streamRef.current);
      streamRef.current = null;
    }
    const id = currentBotId.current;
    if (id) {
      updateActiveSession((msgs) =>
        msgs.map((m) =>
          m.id === id
            ? { ...m, text: fullTextRef.current, isStreaming: false }
            : m
        )
      );
    }
    currentBotId.current = null;
    setLocked(false);
  };

  // ---- History: new session manually (optional) ----
  const handleNewSession = () => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const welcomeMessage: Message = {
      id: 'welcome-' + Date.now(),
      text: "Hi there! 👋 I'm Nafis's AI assistant. Ask me anything!",
      sender: 'bot',
      timestamp: new Date().toISOString(),
      suggestions: [11, 2, 8],
    };

    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: `Chat on ${todayStr} (${sessions.length + 1})`,
      createdAt: new Date().toISOString(),
      date: todayStr,
      messages: [welcomeMessage],
    };

    setSessions((prev) => [...prev, newSession]);
    setActiveSessionId(newSession.id);
    setHistoryOpen(false);
  };

  // ---- Command palette ----
  const filteredCommands = useMemo(() => {
    if (!showCommands) return [];
    const q = commandQuery.toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter(
      (cmd) =>
        cmd.key.toLowerCase().startsWith(q) ||
        cmd.label.toLowerCase().includes(q)
    );
  }, [showCommands, commandQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (!locked && value.startsWith('/')) {
      setShowCommands(true);
      setCommandQuery(value.slice(1));
    } else {
      setShowCommands(false);
      setCommandQuery('');
    }
  };

  const handleCommandSelect = (cmd: (typeof COMMANDS)[number]) => {
    setShowCommands(false);
    setCommandQuery('');
    setInputValue('');
    sendMessage(cmd.question);
  };

  const handleInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      if (showCommands && filteredCommands[0]) {
        e.preventDefault();
        handleCommandSelect(filteredCommands[0]);
        return;
      }
      if (!locked) {
        e.preventDefault();
        sendMessage();
      }
    }

    if (e.key === 'Escape') {
      setShowCommands(false);
      setCommandQuery('');
    }
  };

  // ---- Hire Form ----
  function HireForm({ messageId }: { messageId: string }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [brief, setBrief] = useState('');

    const sendForm = async () => {
      const originalUser =
        messages.filter((m) => m.sender === 'user').slice(-1)[0]?.text ?? 'unknown';

      await fetch('/api/hire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, brief, original_question: originalUser }),
      });

      appendMessage({
        id: 'hire-' + Date.now(),
        text: `Thanks! I'll reach you at **${email}** 📩`,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      });

      setShowHireFormFor(null);
    };

    return (
      <Card className="my-3 p-4 flex flex-col gap-2">
        <Input
          placeholder="Your name"
          icon={<User />}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Textarea
          placeholder="Project details"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
        />
        <Button
          variant="primary"
          className="bg-primaryColor hover:bg-primaryColor/80 text-text"
          onClick={sendForm}
        >
          Send Request
        </Button>
      </Card>
    );
  }

  // ---- Sessions sorted for history panel ----
  const sortedSessions = useMemo(
    () =>
      [...sessions].sort((a, b) =>
        a.createdAt < b.createdAt ? 1 : -1
      ),
    [sessions]
  );

  return (
    <>
      {/* Floating Chat Open Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed flex justify-center items-center bottom-6 right-6 bg-primaryColor hover:bg-primaryColor/80 text-text w-14 h-14 rounded-full shadow-lg ${isOpen ? 'scale-0' : 'scale-100'
          }`}
      >
        <Send />
      </Button>

      {/* Chat UI */}
      <div
        className={`fixed bottom-6 md:right-6 translate-x-2 md:translate-x-0 w-[calc(100%-16px)] md:max-w-[380px] h-[640px] bg-bg-dark border border-border rounded-2xl shadow-xl flex flex-col transition text-sm tracking-wide z-51 ${nunito.className} ${isOpen ? 'scale-100' : 'scale-0 pointer-events-none'
          }`}
      >
        {/* Header */}
        <div className="p-4 bg-bg text-text rounded-t-2xl flex justify-between items-center border-b border-border">
          <div className="flex items-center gap-2">
            <button
              className="p-1 rounded hover:text-primaryColor"
              onClick={() => setHistoryOpen((p) => !p)}
              aria-label="Open history"
            >
              <Menu size={18} />
            </button>
            <span className="font-semibold text-sm">Nafis AI Assistant</span>
          </div>
          <button
            className="hover:text-primaryColor"
            onClick={() => {
              setIsOpen(false);
              stopStreaming();
            }}
          >
            <X />
          </button>
        </div>

        {/* History Panel & Messages */}
        <div className="relative flex-1 overflow-hidden">
          {/* History Panel (inside chat, slide-in panel) */}
          {historyOpen && (
            <div className="absolute inset-y-0 left-0 w-56 bg-bg border-r border-border z-20 flex flex-col">
              <div className="p-3 flex justify-between items-center border-b border-border">
                <span className="text-xs font-semibold text-text-muted">Chat History</span>
                <button
                  className="text-xs text-text hover:text-primaryColor"
                  onClick={() => setHistoryOpen(false)}
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto light-scroll">
                {sortedSessions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveSessionId(s.id);
                      setHistoryOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 border-b border-border/40 text-[11px] ${s.id === activeSessionId ? 'bg-primaryColor/10 border-l-2 border-primaryColor' : ''
                      }`}
                  >
                    <div className="font-semibold text-text">
                      {s.title}
                    </div>
                    <div className="text-text-muted opacity-70">
                      {new Date(s.createdAt).toLocaleString()}
                    </div>
                    {s.messages[0] && (
                      <div className="line-clamp-1 text-[10px] text-text-muted">
                        {s.messages[0].text.replace(/\n/g, ' ')}
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="p-3 border-t border-border">
                <Button
                  size="small"
                  className="w-full bg-primaryColor hover:bg-primaryColor/80 text-text text-xs"
                  onClick={handleNewSession}
                >
                  New chat
                </Button>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto light-scroll max-h-full">
            {messages.map((m) => (
              <div key={m.id}>
                <div className={`flex ${m.sender === 'user' ? 'justify-end' : ''}`}>
                  <div
                    className={`p-3 rounded-xl max-w-[80%] shadow font-light text-text ${m.sender === 'user' ? 'bg-blue-600/40' : 'bg-bg-light'
                      }`}
                  >
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-text-muted">
                      <span>
                        {new Date(m.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {m.isStreaming && <span className="italic opacity-70">typing…</span>}
                    </div>
                  </div>
                </div>

                {m.id === showHireFormFor && !m.isStreaming && (
                  <HireForm messageId={m.id} />
                )}

                {/* Suggestions */}
                {!m.isStreaming && m.suggestions && m.suggestions.length > 0 && (
                  <div className="ml-2 mt-2 flex flex-wrap gap-2">
                    {m.suggestions.map((id) => {
                      const q = questions.find((x) => x.id === id);
                      return (
                        q && (
                          <button
                            key={id}
                            disabled={locked}
                            onClick={() => sendMessage(q.question)}
                            className={`px-3 py-1 text-xs rounded-full border border-border hover:border-primaryColor transition-colors duration-300 ease-in-out text-text-muted ${locked ? 'opacity-40' : ''
                              }`}
                          >
                            {q.question}
                          </button>
                        )
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input + Command Palette */}
        <div className="relative p-4 border-t border-border">
          {/* Command menu (Notion-style) */}
          {showCommands && filteredCommands.length > 0 && (
            <div className="absolute bottom-17 left-4 right-4 mb-2 z-10">
              <Card className="bg-bg-light border border-border shadow-xl gap-2 py-2">
                {filteredCommands.map((cmd) => (
                  <button
                    key={cmd.key}
                    onClick={() => handleCommandSelect(cmd)}
                    className="w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-bg-dark/60 transition-colors border-b border-border last:border-b-0 "
                  >
                    <span className="font-semibold text-text">/{cmd.key}</span>
                    <span className="text-[10px] text-text-muted">{cmd.label}</span>
                  </button>
                ))}
              </Card>
            </div>
          )}

          <div className="flex gap-2">
            <input
              className="flex-1 border rounded-full px-4 py-2 bg-bg border-border text-text focus:outline-none focus:ring-2 focus:ring-primaryColor"
              disabled={locked}
              placeholder={locked ? 'Bot is responding…' : "Type your message... or '/' for commands"}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
            />
            <button
              disabled={locked}
              onClick={() => sendMessage()}
              className="w-10 rounded-full bg-primaryColor text-text flex items-center justify-center disabled:opacity-50"
            >
              {locked ? <Send /> : <SendHorizonal />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
