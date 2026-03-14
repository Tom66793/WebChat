'use client';
import { useEffect, useRef, useState } from 'react';
import {
  collection, addDoc, onSnapshot, orderBy, query,
  serverTimestamp, limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhoto: string | null;
  createdAt: any;
}

interface Group {
  id: string;
  name: string;
  description: string;
}

interface Props {
  group: Group;
}

export default function ChatRoom({ group }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'groups', group.id, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Message)));
    });
    return unsubscribe;
  }, [group.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user || sending) return;
    setSending(true);
    const msgText = text.trim();
    setText('');
    try {
      await addDoc(collection(db, 'groups', group.id, 'messages'), {
        text: msgText,
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonyme',
        userPhoto: user.photoURL,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
      setText(msgText);
    } finally {
      setSending(false);
    }
  };

  const avatarUrl = (name: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=32`;

  const formatTime = (ts: any) => {
    if (!ts?.toDate) return '';
    return ts.toDate().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-screen flex-1 bg-gray-800">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
            {group.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-white font-semibold"># {group.name}</h2>
            {group.description && <p className="text-gray-400 text-sm">{group.description}</p>}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-600/20 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-400 font-medium">Bienvenue dans #{group.name} !</p>
            <p className="text-gray-600 text-sm mt-1">Soyez le premier à envoyer un message.</p>
          </div>
        )}

        {messages.map((msg, i) => {
          const isOwn = msg.userId === user?.uid;
          const showAvatar = i === 0 || messages[i - 1].userId !== msg.userId;

          return (
            <div key={msg.id} className={`flex items-end gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 flex-shrink-0">
                {showAvatar && (
                  <img
                    src={msg.userPhoto || avatarUrl(msg.userName)}
                    alt={msg.userName}
                    className="w-8 h-8 rounded-full"
                  />
                )}
              </div>
              <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                {showAvatar && (
                  <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <span className="text-xs font-semibold text-gray-300">{msg.userName}</span>
                    <span className="text-xs text-gray-600">{formatTime(msg.createdAt)}</span>
                  </div>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isOwn
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-gray-700 text-gray-100 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-700/50">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message dans #${group.name}`}
            className="flex-1 bg-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e as any);
              }
            }}
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl px-5 py-3 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
