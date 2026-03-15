import React, { useState, useEffect } from 'react';
import { UserProfile, PeerGroup } from '../types';
import { format } from 'date-fns';
import { Users, Search, MessageSquare, ChevronRight, Loader2, Sparkles, Shield, Wind, ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import getApiUrl from '../lib/api';

export default function PeerGroupComponent({ profile }: { profile: UserProfile }) {
  const [groups, setGroups] = useState<PeerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [joiningId, setJoiningId] = useState<string | null>(null);
  
  // State for posts & comments
  const [activeGroup, setActiveGroup] = useState<any | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const fetchGroups = async () => {
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(getApiUrl('/api/peergroups'), {
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

  const fetchPosts = async (groupId: string) => {
    setLoadingPosts(true);
    const token = localStorage.getItem('auth_token');
    try {
      const response = await fetch(getApiUrl(`/api/peergroups/${groupId}/posts`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleJoinLeave = async (e: React.MouseEvent, group: PeerGroup) => {
    e.stopPropagation();
    const groupId = group.id || (group as any)._id;
    setJoiningId(groupId);
    const token = localStorage.getItem('auth_token');
    const isMember = group.members.includes(profile.uid);
    const action = isMember ? 'leave' : 'join';

    try {
      await fetch(getApiUrl(`/api/peergroups/${groupId}/${action}`), {
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

  const handleOpenGroup = (group: any) => {
    if (!group.members.includes(profile.uid)) return;
    setActiveGroup(group);
    fetchPosts(group._id || group.id);
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !activeGroup) return;
    const token = localStorage.getItem('auth_token');
    const groupId = activeGroup._id || activeGroup.id;
    try {
      await fetch(getApiUrl(`/api/peergroups/${groupId}/posts`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newPost })
      });
      setNewPost('');
      fetchPosts(groupId);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim()) return;
    const token = localStorage.getItem('auth_token');
    try {
      await fetch(getApiUrl(`/api/peergroups/posts/${postId}/comments`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentText })
      });
      setCommentText('');
      setReplyingTo(null);
      fetchPosts(activeGroup._id || activeGroup.id);
    } catch (error) {
      console.error('Error adding comment:', error);
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

  // --- GROUP FEED VIEW ---
  if (activeGroup) {
    return (
      <div className="space-y-6 pb-20">
        <button 
          onClick={() => { setActiveGroup(null); setReplyingTo(null); }}
          className="flex items-center space-x-2 text-sm font-bold text-black/50 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Groups</span>
        </button>
        
        <div className="bg-black text-white p-8 rounded-[32px] flex items-center space-x-6">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            {getIcon(activeGroup.icon)}
          </div>
          <div>
            <h2 className="text-3xl font-black">{activeGroup.name}</h2>
            <p className="text-white/60">{activeGroup.description}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] border border-black/10 shadow-sm flex space-x-4">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={`Share something with ${activeGroup.name}...`}
            className="flex-1 bg-neutral-50 border border-black/5 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-black transition-all resize-none h-24"
          />
          <button 
            onClick={handleCreatePost}
            disabled={!newPost.trim()}
            className="bg-black text-white px-6 rounded-2xl font-bold flex items-center space-x-2 disabled:opacity-50 hover:shadow-lg transition-all"
          >
            <Send className="w-5 h-5" />
            <span className="hidden md:inline">Post</span>
          </button>
        </div>

        <div className="space-y-4">
          {loadingPosts ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-black/20" /></div>
          ) : posts.length > 0 ? (
            posts.map(post => (
              <div key={post._id} className="bg-white p-6 rounded-[24px] border border-black/5 shadow-sm space-y-4">
                {/* Main Post Content */}
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-black/40" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div>
                      <h4 className="font-bold text-sm">{post.authorName}</h4>
                      <p className="text-[10px] text-black/40 font-bold uppercase tracking-widest">
                        {format(new Date(post.timestamp), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <p className="text-black/80 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    
                    <button 
                      onClick={() => setReplyingTo(replyingTo === post._id ? null : post._id)}
                      className="text-xs font-bold text-black/50 hover:text-black flex items-center space-x-1 pt-2 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments?.length || 0} Comments</span>
                    </button>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="pl-13 space-y-3 pt-2">
                  {post.comments?.map((comment: any, idx: number) => (
                    <div key={idx} className="flex items-start space-x-3 bg-neutral-50 p-4 rounded-2xl">
                       <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0 border border-black/5">
                        <User className="w-4 h-4 text-black/30" />
                      </div>
                      <div>
                        <div className="flex items-baseline space-x-2">
                          <h5 className="font-bold text-xs">{comment.authorName}</h5>
                          <span className="text-[9px] text-black/30 font-bold uppercase">
                            {format(new Date(comment.timestamp), 'MMM d')}
                          </span>
                        </div>
                        <p className="text-sm text-black/70 mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  {/* Add Comment Input */}
                  <AnimatePresence>
                    {replyingTo === post._id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex space-x-2 pt-2"
                      >
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write a comment..."
                          className="flex-1 bg-neutral-50 border border-black/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-black transition-colors"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(post._id);
                          }}
                        />
                        <button 
                          onClick={() => handleAddComment(post._id)}
                          disabled={!commentText.trim()}
                          className="bg-black text-white px-4 rounded-xl disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-black/40 italic">
              Be the first to post in this group!
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- GROUPS LIST VIEW ---
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
          const groupId = group._id || group.id;
          return (
            <motion.div
              key={groupId}
              onClick={() => handleOpenGroup(group)}
              layout
              className={`p-8 rounded-[32px] border border-black/10 shadow-sm transition-all flex flex-col h-full ${
                isMember ? 'bg-white cursor-pointer hover:shadow-lg hover:border-black/30' : 'bg-neutral-50/50'
              }`}
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
                  onClick={(e) => handleJoinLeave(e, group)}
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
                    'Leave'
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
