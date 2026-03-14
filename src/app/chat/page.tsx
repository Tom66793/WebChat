'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import GroupList from '@/components/GroupList';
import ChatRoom from '@/components/ChatRoom';

interface Group {
  id: string;
  name: string;
  description: string;
  createdByName: string;
}

export default function ChatPage() {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <GroupList selectedGroup={selectedGroup} onSelectGroup={setSelectedGroup} />
      {selectedGroup ? (
        <ChatRoom group={selectedGroup} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-800">
          <div className="w-20 h-20 rounded-full bg-indigo-600/20 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Bienvenue sur WebChat</h2>
          <p className="text-gray-400 text-center max-w-sm">
            Sélectionnez un groupe dans la barre latérale ou créez-en un nouveau pour commencer à discuter.
          </p>
        </div>
      )}
    </div>
  );
}
