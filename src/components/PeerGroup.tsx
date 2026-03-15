import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, PeerPost } from '../types';
import { MessageSquare, Heart, Share2, Send, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export default function PeerGroup({ profile }: { profile: UserProfile }) {
  const [posts, setPosts] = useState<PeerPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'peer_posts'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PeerPost)));
    });
    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'peer_posts'), {
        userId: profile.uid,
        userName: profile.anonymous ? 'Anonymous' : (profile.displayName || 'User'),
        content: newPost,
        likes: [],
        comments: [],
        timestamp: Timestamp.now(),
        anonymous: profile.anonymous
      });
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    const postRef = doc(db, 'peer_posts', postId);
    await updateDoc(postRef, {
      likes: isLiked ? arrayRemove(profile.uid) : arrayUnion(profile.uid)
    });
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim()) return;
    const postRef = doc(db, 'peer_posts', postId);
    await updateDoc(postRef, {
      comments: arrayUnion({
        userId: profile.uid,
        userName: profile.anonymous ? 'Anonymous' : (profile.displayName || 'User'),
        content: commentText,
        timestamp: Timestamp.now()
      })
    });
    setCommentText('');
    setCommentingOn(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <header>
        <h2 className="text-3xl font-black tracking-tight">Peer Support Group</h2>
        <p className="text-black/50">Connect with others in a safe, anonymous-friendly space.</p>
      </header>

      {/* Create Post */}
      <section className="bg-white p-6 rounded-[32px] border border-black/10 shadow-sm">
        <form onSubmit={handleCreatePost} className="space-y-4">
          <textarea
            placeholder="What's on your mind? Share with the community..."
            className="w-full p-4 bg-neutral-50 border border-black/5 rounded-2xl focus:ring-2 focus:ring-black outline-none min-h-[120px] resize-none"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-xs font-bold text-black/40">
              <User className="w-4 h-4" />
              <span>Posting as {profile.anonymous ? 'Anonymous' : (profile.displayName || 'User')}</span>
            </div>
            <button
              type="submit"
              disabled={!newPost.trim() || isSubmitting}
              className="bg-black text-white px-6 py-2 rounded-xl font-bold flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Post</span>
            </button>
          </div>
        </form>
      </section>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => {
          const isLiked = post.likes.includes(profile.uid);
          return (
            <motion.article 
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-[32px] border border-black/10 shadow-sm space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-black/20" />
                  </div>
                  <div>
                    <h4 className="font-bold">{post.userName}</h4>
                    <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">
                      {post.timestamp ? format(post.timestamp.toDate(), 'MMM d, h:mm a') : 'Just now'}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-lg leading-relaxed">{post.content}</p>

              <div className="flex items-center space-x-6 pt-4 border-t border-black/5">
                <button 
                  onClick={() => handleLike(post.id, isLiked)}
                  className={`flex items-center space-x-2 transition-colors ${isLiked ? 'text-rose-500' : 'text-black/40 hover:text-black'}`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-bold">{post.likes.length}</span>
                </button>
                <button 
                  onClick={() => setCommentingOn(commentingOn === post.id ? null : post.id)}
                  className="flex items-center space-x-2 text-black/40 hover:text-black transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-sm font-bold">{post.comments.length}</span>
                </button>
                <button className="flex items-center space-x-2 text-black/40 hover:text-black transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Comments Section */}
              <AnimatePresence>
                {commentingOn === post.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pt-4 space-y-4"
                  >
                    <div className="space-y-3">
                      {post.comments.map((comment, i) => (
                        <div key={i} className="bg-neutral-50 p-4 rounded-2xl space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold">{comment.userName}</span>
                            <span className="text-[10px] font-bold text-black/20">
                              {comment.timestamp ? format(comment.timestamp.toDate(), 'h:mm a') : 'Just now'}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="flex-1 bg-neutral-50 border border-black/5 rounded-xl px-4 py-2 text-sm outline-none focus:border-black"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      />
                      <button 
                        onClick={() => handleAddComment(post.id)}
                        className="bg-black text-white p-2 rounded-xl"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
