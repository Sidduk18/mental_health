import React, { useState, useEffect } from 'react';
import { UserProfile, PeerGroup } from '../types';
import { format } from 'date-fns';
import { Users, Search, MessageSquare, ChevronRight, Loader2, Sparkles, Shield, Wind, ArrowLeft, Send, MessageCircle, User, ArrowBigUp, ArrowBigDown } from 'lucide-react';
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

  const handleVote = async (postId: string, type: 'up' | 'down') => {
    const token = localStorage.getItem('auth_token');
    try {
      await fetch(getApiUrl(`/api/peergroups/posts/${postId}/vote`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });
      fetchPosts(activeGroup._id || activeGroup.id);
    } catch (error) {
      console.error('Error voting:', error);
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
          className="flex items-center space-x-2 text-sm font-bold text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Groups</span>
        </button>
        
        <div className="bg-black dark:bg-white text-white dark:text-black p-6 md:p-8 rounded-[32px] flex items-center space-x-4 md:space-x-6">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 dark:bg-black/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            {getIcon(activeGroup.icon)}
          </div>
          <div>
            <h2 className="text-xl md:text-3xl font-black">{activeGroup.name}</h2>
            <p className="text-white/60 dark:text-black/60 text-xs md:text-base">{activeGroup.description}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-black/20 p-4 md:p-6 rounded-[32px] border border-black/10 dark:border-white/10 shadow-sm flex flex-col md:flex-row gap-4">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={`Share something with ${activeGroup.name}...`}
            className="flex-1 bg-neutral-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all resize-none h-24 text-black dark:text-white"
          />
          <button 
            onClick={handleCreatePost}
            disabled={!newPost.trim()}
            className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 md:py-0 rounded-2xl font-bold flex items-center justify-center md:justify-start space-x-2 disabled:opacity-50 hover:shadow-lg transition-all"
          >
            <Send className="w-5 h-5" />
            <span>Post</span>
          </button>
        </div>

        <div className="space-y-4">
          {loadingPosts ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-black/20" /></div>
          ) : posts.length > 0 ? (
            posts.map(post => {
              const hasUpvoted = post.upvotes?.includes(profile.uid);
              const hasDownvoted = post.downvotes?.includes(profile.uid);

              return (
              <div key={post._id} className="bg-white dark:bg-black/20 p-4 md:p-6 rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm flex space-x-4">
                {/* Voting Sidebar (Reddit style) */}
                <div className="flex flex-col items-center space-y-1">
                  <button
                    onClick={() => handleVote(post._id, 'up')}
                    className={cn("p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors", hasUpvoted && "text-orange-600")}
                  >
                    <ArrowBigUp className={cn("w-6 h-6", hasUpvoted && "fill-current")} />
                  </button>
                  <span className="text-xs font-black">{post.score || 0}</span>
                  <button
                    onClick={() => handleVote(post._id, 'down')}
                    className={cn("p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors", hasDownvoted && "text-indigo-600")}
                  >
                    <ArrowBigDown className={cn("w-6 h-6", hasDownvoted && "fill-current")} />
                  </button>
                </div>

                <div className="flex-1 space-y-4">
                  {/* Main Post Content */}
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-neutral-100 dark:bg-white/10 rounded-full flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-black/40 dark:text-white/40" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-bold text-sm text-black dark:text-white">{post.authorName}</h4>
                        <p className="text-[10px] text-black/40 dark:text-white/40 font-bold uppercase tracking-widest">
                          {format(new Date(post.timestamp), 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <p className="text-black/80 dark:text-white/80 leading-relaxed whitespace-pre-wrap text-sm md:text-base">{post.content}</p>

                      <button
                        onClick={() => setReplyingTo(replyingTo === post._id ? null : post._id)}
                        className="text-xs font-bold text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white flex items-center space-x-1 pt-2 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments?.length || 0} Comments</span>
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="pl-6 md:pl-13 space-y-3 pt-2 border-t border-black/5 dark:border-white/5 mt-4">
                  {post.comments?.map((comment: any, idx: number) => (
                    <div key={idx} className="flex items-start space-x-3 bg-neutral-50 dark:bg-white/5 p-3 md:p-4 rounded-2xl">
                       <div className="w-8 h-8 bg-white dark:bg-black/20 rounded-full flex items-center justify-center shrink-0 border border-black/5 dark:border-white/5">
                        <User className="w-4 h-4 text-black/30 dark:text-white/30" />
                      </div>
                      <div>
                        <div className="flex items-baseline space-x-2">
                          <h5 className="font-bold text-xs text-black dark:text-white">{comment.authorName}</h5>
                          <span className="text-[9px] text-black/30 dark:text-white/30 font-bold uppercase">
                            {format(new Date(comment.timestamp), 'MMM d')}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-black/70 dark:text-white/70 mt-1">{comment.content}</p>
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
              </div>
            )})
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
    <div className="space-y-6 md:space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-black dark:text-white">Peer Support Groups</h2>
          <p className="text-black/50 dark:text-white/50">Connect with others on similar journeys.</p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30 dark:text-white/30" />
          <input
            type="text"
            placeholder="Search groups..."
            className="pl-12 pr-6 py-3 bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all w-full md:w-64 text-black dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredGroups.map((group: any) => {
          const isMember = group.members.includes(profile.uid);
          const groupId = group._id || group.id;
          return (
            <motion.div
              key={groupId}
              onClick={() => handleOpenGroup(group)}
              layout
              className={`p-6 md:p-8 rounded-[32px] border border-black/10 dark:border-white/10 shadow-sm transition-all flex flex-col h-full ${
                isMember ? 'bg-white dark:bg-black/20 cursor-pointer hover:shadow-lg hover:border-black/30' : 'bg-neutral-50/50 dark:bg-white/5'
              }`}
            >
              <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center mb-6">
                {getIcon(group.icon)}
              </div>

              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold text-black dark:text-white">{group.name}</h3>
                <p className="text-sm text-black/50 dark:text-white/50 leading-relaxed">{group.description}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-black/30 dark:text-white/30 font-bold text-xs uppercase tracking-widest">
                  <Users className="w-4 h-4" />
                  <span>{group.memberCount} members</span>
                </div>
                <button 
                  onClick={(e) => handleJoinLeave(e, group)}
                  disabled={joiningId === groupId}
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    isMember
                      ? 'bg-neutral-100 dark:bg-white/10 text-black dark:text-white hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
                      : 'bg-black dark:bg-white text-white dark:text-black hover:shadow-lg active:scale-95'
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
