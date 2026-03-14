'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import CreateGroupModal from './CreateGroupModal';

interface Group {
  id: string;
  name: string;
  description: string;
  createdByName: string;
}

interface Props {
  selectedGroup: Group | null;
  onSelectGroup: (group: Group) => void;
}

export default function GroupList({ selectedGroup, onSelectGroup }: Props) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'groups'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGroups(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Group)));
    });
    return unsubscribe;
  }, []);

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const avatarUrl = (name: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=32`;

  return (
    <>
      <div className="w-72 bg-gray-900 flex flex-col h-screen border-r border-gray-700/50">
        {/* Header */}
        <div className="p-4 border-b border-gray-700/50">
          <h1 className="text-xl font-bold text-white mb-3">WebChat</h1>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un groupe..."
            className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
          />
        </div>

        {/* Groups */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="flex items-center justify-between px-2 py-2 mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Groupes</span>
            <button
              onClick={() => setShowModal(true)}
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
              title="Créer un groupe"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {filtered.length === 0 && (
            <p className="text-gray-600 text-sm text-center py-8">Aucun groupe trouvé</p>
          )}

          {filtered.map((group) => (
            <button
              key={group.id}
              onClick={() => onSelectGroup(group)}
              className={`w-full text-left px-3 py-3 rounded-lg mb-1 transition-colors flex items-center gap-3 ${
                selectedGroup?.id === group.id
                  ? 'bg-indigo-600/20 border border-indigo-500/30'
                  : 'hover:bg-gray-800'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {group.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className={`font-medium text-sm truncate ${selectedGroup?.id === group.id ? 'text-indigo-300' : 'text-gray-200'}`}>
                  # {group.name}
                </p>
                {group.description && (
                  <p className="text-gray-500 text-xs truncate">{group.description}</p>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* User footer */}
        <div className="p-4 border-t border-gray-700/50 flex items-center gap-3">
          <img
            src={user?.photoURL || avatarUrl(user?.displayName || user?.email || 'U')}
            alt="avatar"
            className="w-9 h-9 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.displayName || 'Utilisateur'}</p>
            <p className="text-gray-500 text-xs truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="text-gray-500 hover:text-red-400 transition-colors"
            title="Se déconnecter"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {showModal && <CreateGroupModal onClose={() => setShowModal(false)} />}
    </>
  );
}
