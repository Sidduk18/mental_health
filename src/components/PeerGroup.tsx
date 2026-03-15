import React, { useState, useEffect } from 'react';
import { UserProfile, PeerGroup } from '../types';
import { Users, Search, MessageSquare, ChevronRight, Loader2, Sparkles, Shield, Wind } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PeerGroupComponent({ profile }: { profile: UserProfile }) {
  const [groups, setGroups] = useState<PeerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const fetchGroups = async () => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch('/api/peergroups', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setGroups(data);
    } catch (err) {
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleJoinLeave = async (group: PeerGroup) => {
    setJoiningId(group.id || (group as any)._id);
    const token = localStorage.getItem('auth_token');
    const isMember = group.members.includes(profile.uid);
    const action = isMember ? 'leave' : 'join';
    const groupId = group.id || (group as any)._id;

    try {
      await fetch(`/api/peergroups/${groupId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchGroups();
    } catch (err) {
      console.error('Error joining/leaving group:', err);
    } finally {
      setJoiningId(null);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'wind': return <Wind className="w-6 h-6" />;
      case 'shield': return <Shield className="w-6 h-6" />;
      case 'sparkles': return <Sparkles className="w-6 h-6" />;
      default: return <MessageSquare className="w-6 h-6" />;
    }
  };

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-black/20" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Peer Support Groups</h2>
          <p className="text-black/50">Connect with others on similar journeys.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30" />
          <input
            type="text"
            placeholder="Search groups..."
            className="pl-12 pr-6 py-3 bg-white border border-black/10 rounded-2xl focus:ring-2 focus:ring-black outline-none transition-all w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group: any) => {
          const isMember = group.members.includes(profile.uid);
          const groupId = group._id;
          return (
            <motion.div
              key={groupId}
              layout
              className="bg-white p-8 rounded-[32px] border border-black/10 shadow-sm hover:shadow-md transition-all flex flex-col h-full"
            >
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mb-6">
                {getIcon(group.icon)}
              </div>

              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold">{group.name}</h3>
                <p className="text-sm text-black/50 leading-relaxed">{group.description}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-black/5 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-black/30 font-bold text-xs uppercase tracking-widest">
                  <Users className="w-4 h-4" />
                  <span>{group.memberCount} members</span>
                </div>
                <button 
                  onClick={() => handleJoinLeave(group)}
                  disabled={joiningId === groupId}
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    isMember
                      ? 'bg-neutral-100 text-black hover:bg-red-50 hover:text-red-500'
                      : 'bg-black text-white hover:shadow-lg active:scale-95'
                  }`}
                >
                  {joiningId === groupId ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : isMember ? (
                    'Leave Group'
                  ) : (
                    <>
                      <span>Join</span>
                      <ChevronRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-black/10">
          <p className="text-black/30 italic">No groups found matching your search.</p>
        </div>
      )}
    </div>
  );
}
