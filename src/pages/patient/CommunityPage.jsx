// src/pages/patient/CommunityPage.jsx
// Full-featured social community page — Posts, Likes, Comments, Edit/Delete, Images, DMs, User Profiles

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Users, Send, User, Loader2, RefreshCw, MessageSquarePlus, AlertCircle,
  Stethoscope, Heart, MessageCircle, MoreHorizontal, Pencil, Trash2,
  X, Image, AtSign, MessageSquare, ChevronLeft, Check, CheckCheck, Phone
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const timeAgo = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const past = new Date(dateString.replace(' ', 'T'));
  const diffMs = now - past;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return past.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
};

const highlightMentions = (text) =>
  text.split(/(@\w+)/g).map((part, i) =>
    part.startsWith('@')
      ? <span key={i} className="font-semibold text-blue-600">{part}</span>
      : part
  );

// ─── Sub-components ───────────────────────────────────────────────────────────

const Avatar = ({ name, image, role, size = 'md', onClick }) => {
  const isDoctor = role === 'DOCTOR';
  const sz = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' }[size];
  const ic = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-6 w-6' }[size];
  const cls = `${sz} rounded-full shrink-0 ring-2 ring-white shadow-sm flex items-center justify-center ${onClick ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`;

  if (image) return (
    <img src={image} alt={name} onClick={onClick}
      className={`${sz} rounded-full object-cover ring-2 ring-white shadow-sm shrink-0 ${onClick ? 'cursor-pointer hover:opacity-90' : ''}`} />
  );
  return (
    <div className={`${cls} ${isDoctor ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`} onClick={onClick}>
      {isDoctor ? <Stethoscope className={ic} /> : <User className={ic} />}
    </div>
  );
};

const RoleBadge = ({ role }) => (
  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
    role === 'DOCTOR' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
  }`}>{role === 'DOCTOR' ? '👨‍⚕️ Doctor' : '🧑 Patient'}</span>
);

// ─── User Profile Modal ───────────────────────────────────────────────────────

const UserProfileModal = ({ userId, onClose, onStartChat }) => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axiosInstance.get(`/api/community/users/${userId}/profile/`);
        setProfile(data);
      } catch { /* ignore */ }
      finally { setIsLoading(false); }
    };
    fetchProfile();
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>

        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-6 animate-pulse">
            <div className="h-20 w-20 rounded-full bg-gray-200"></div>
            <div className="h-4 w-32 rounded bg-gray-200"></div>
            <div className="h-3 w-24 rounded bg-gray-200"></div>
          </div>
        ) : profile ? (
          <div className="flex flex-col items-center text-center">
            <Avatar name={profile.username} image={profile.profile_picture} role={profile.role} size="lg" />
            <h2 className="mt-3 text-xl font-bold text-gray-900">{profile.username}</h2>
            <RoleBadge role={profile.role} />

            <div className="mt-4 w-full space-y-2 text-sm text-left bg-gray-50 rounded-xl p-4">
              {profile.role === 'DOCTOR' && (
                <>
                  {profile.specialization && (
                    <div className="flex gap-2"><span className="text-gray-500 w-28 shrink-0">Specialization:</span><span className="font-medium text-gray-900">{profile.specialization}</span></div>
                  )}
                  {profile.license_number && (
                    <div className="flex gap-2"><span className="text-gray-500 w-28 shrink-0">License:</span><span className="font-medium text-gray-900">{profile.license_number}</span></div>
                  )}
                </>
              )}
              {profile.role === 'PATIENT' && profile.chronic_disease && (
                <div className="flex gap-2"><span className="text-gray-500 w-28 shrink-0">Condition:</span><span className="font-medium text-gray-900">{profile.chronic_disease}</span></div>
              )}
              {profile.phone_number && (
                <div className="flex gap-2 items-center"><Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" /><span className="font-medium text-gray-900">{profile.phone_number}</span></div>
              )}
              <div className="flex gap-2"><span className="text-gray-500 w-28 shrink-0">Posts:</span><span className="font-medium text-gray-900">{profile.posts_count}</span></div>
            </div>

            <button
              onClick={() => { onStartChat(profile); onClose(); }}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-500 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Send Message
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-6">Could not load profile.</p>
        )}
      </div>
    </div>
  );
};

// ─── Direct Message Chat Panel ────────────────────────────────────────────────

const ChatPanel = ({ partner, currentUserId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const loadMessages = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(`/api/community/messages/${partner.id}/`);
      setMessages(data.messages || []);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  }, [partner.id]);

  useEffect(() => {
    loadMessages();
    // Poll every 5 seconds for new messages
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const content = text.trim();
    if (!content || isSending) return;
    setIsSending(true);
    const optimistic = { id: Date.now(), sender_id: currentUserId, sender_name: 'You', content, is_mine: true, is_read: false, created_at: new Date().toISOString().replace('T', ' ').substring(0, 16) };
    setMessages(prev => [...prev, optimistic]);
    setText('');
    try {
      const { data } = await axiosInstance.post(`/api/community/messages/${partner.id}/`, { content });
      setMessages(prev => prev.map(m => m.id === optimistic.id ? data.message : m));
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed bottom-0 right-4 z-50 w-80 sm:w-96 bg-white rounded-t-2xl shadow-2xl border border-gray-200 flex flex-col" style={{ height: '480px' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-blue-600 rounded-t-2xl shrink-0">
        <Avatar name={partner.username} image={partner.profile_picture} role={partner.role} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm truncate">{partner.username}</p>
          <p className="text-xs text-blue-200">{partner.role === 'DOCTOR' ? 'Doctor' : 'Patient'}</p>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white p-1"><X className="h-5 w-5" /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50">
        {isLoading && <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>}
        {!isLoading && messages.length === 0 && (
          <p className="text-center text-xs text-gray-400 mt-8">No messages yet. Say hi! 👋</p>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
              msg.is_mine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
            }`}>
              <p className="leading-relaxed">{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.is_mine ? 'text-blue-200' : 'text-gray-400'}`}>
                {timeAgo(msg.created_at)}
                {msg.is_mine && <span className="ml-1">{msg.is_read ? <CheckCheck className="inline h-3 w-3" /> : <Check className="inline h-3 w-3" />}</span>}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 shrink-0">
        <input ref={inputRef} type="text" value={text} onChange={e => setText(e.target.value)}
          placeholder="Type a message..." autoFocus
          className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition"
        />
        <button type="submit" disabled={!text.trim() || isSending}
          className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-500 transition">
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
};

// ─── Comment Item ─────────────────────────────────────────────────────────────

const CommentItem = ({ comment, onAvatarClick }) => (
  <div className="flex gap-3 py-2.5 border-b border-gray-50 last:border-0">
    <Avatar name={comment.author_name} image={comment.author_image} role={comment.author_role} size="sm"
      onClick={() => onAvatarClick(comment.author_id)} />
    <div className="flex-1 min-w-0">
      <div className="bg-gray-100 rounded-2xl rounded-tl-none px-3.5 py-2.5">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <button onClick={() => onAvatarClick(comment.author_id)} className="text-xs font-bold text-gray-900 hover:underline">
            {comment.author_name}
          </button>
          <RoleBadge role={comment.author_role} />
        </div>
        <p className="text-sm text-gray-700 leading-relaxed break-words">{highlightMentions(comment.content)}</p>
      </div>
      <span className="ml-3 text-xs text-gray-400 mt-1 block">{timeAgo(comment.created_at)}</span>
    </div>
  </div>
);

// ─── Comments Section ─────────────────────────────────────────────────────────

const CommentsSection = ({ postId, onAvatarClick }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const { data } = await axiosInstance.get(`/api/community/posts/${postId}/comments/`);
        setComments(data.comments || []);
      } catch { /* ignore */ }
      finally { setIsLoading(false); }
    };
    load();
    inputRef.current?.focus();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { data } = await axiosInstance.post(`/api/community/posts/${postId}/comments/`, { content });
      setComments(prev => [...prev, data.comment]);
      setText('');
      inputRef.current?.focus();
    } catch { /* ignore */ }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
      {isLoading && <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>}
      {!isLoading && comments.length > 0 && (
        <div className="px-5 pt-3 pb-1">
          {comments.map(c => <CommentItem key={c.id} comment={c} onAvatarClick={onAvatarClick} />)}
        </div>
      )}
      {!isLoading && comments.length === 0 && (
        <p className="text-center text-xs text-gray-400 py-4">No comments yet. Be the first!</p>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3">
        <Avatar name={user?.username} image={null} role={user?.role} size="sm" />
        <div className="flex-1 flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition">
          <input ref={inputRef} type="text" value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
            placeholder={`Comment as ${user?.username}... (@mention to tag)`}
            className="flex-1 py-2.5 text-sm bg-transparent text-gray-900 placeholder-gray-400 outline-none" />
          <button type="submit" disabled={!text.trim() || isSubmitting}
            className="p-1 text-blue-600 hover:text-blue-700 disabled:opacity-30 transition">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </div>
  );
};

// ─── Image Gallery ────────────────────────────────────────────────────────────

const ImageGallery = ({ images }) => {
  const [lightboxImg, setLightboxImg] = useState(null);
  if (!images || images.length === 0) return null;

  const gridClass = images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : images.length === 3 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <>
      <div className={`grid ${gridClass} gap-1.5 mt-3 rounded-xl overflow-hidden`}>
        {images.slice(0, 4).map((url, idx) => (
          <div key={idx} className="relative cursor-pointer" onClick={() => setLightboxImg(url)}>
            <img src={url} alt={`Post image ${idx + 1}`}
              className="w-full object-cover aspect-square hover:opacity-95 transition-opacity" />
            {idx === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">
                +{images.length - 4}
              </div>
            )}
          </div>
        ))}
      </div>
      {lightboxImg && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="Full view" className="max-h-screen max-w-screen-lg object-contain" />
          <button className="absolute top-4 right-4 text-white hover:text-gray-300" onClick={() => setLightboxImg(null)}>
            <X className="h-8 w-8" />
          </button>
        </div>
      )}
    </>
  );
};

// ─── Post Card ────────────────────────────────────────────────────────────────

const PostCard = ({ post, onAvatarClick, onPostUpdate, onPostDelete }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.liked_by_me);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    setLiked(prev => !prev);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    try {
      const { data } = await axiosInstance.post(`/api/community/posts/${post.id}/like/`);
      setLiked(data.liked);
      setLikesCount(data.likes_count);
    } catch {
      setLiked(prev => !prev);
      setLikesCount(prev => liked ? prev + 1 : prev - 1);
    } finally { setIsLiking(false); }
  };

  const handleSaveEdit = async () => {
    const content = editContent.trim();
    if (!content) return;
    setIsSavingEdit(true);
    try {
      const { data } = await axiosInstance.patch(`/api/community/posts/${post.id}/`, { content });
      onPostUpdate(data.post);
      setIsEditing(false);
    } catch { /* ignore */ }
    finally { setIsSavingEdit(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/api/community/posts/${post.id}/`);
      onPostDelete(post.id);
    } catch { setIsDeleting(false); }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header — always LTR to prevent name/avatar flip in RTL */}
      <div className="flex items-start gap-3 p-4 sm:p-5" dir="ltr">
        <Avatar name={post.author_name} image={post.author_image} role={post.author_role} size="md"
          onClick={() => onAvatarClick(post.author_id)} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => onAvatarClick(post.author_id)} className="font-bold text-gray-900 dark:text-white text-sm hover:underline">
              {post.author_name}
            </button>
            <RoleBadge role={post.author_role} />
          </div>
          <span className="text-xs text-gray-400 dark:text-slate-500">
            {timeAgo(post.created_at)}
            {post.updated_at !== post.created_at && <span className="ml-1 italic">· edited</span>}
          </span>
        </div>
        {/* Three-dot menu for own posts */}
        {post.is_mine && (
          <div className="relative shrink-0" ref={menuRef}>
            <button onClick={() => setShowMenu(p => !p)}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 transition">
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 w-36 bg-white dark:bg-slate-700 rounded-xl border border-gray-200 dark:border-slate-600 shadow-lg z-10 py-1">
                <button onClick={() => { setIsEditing(true); setShowMenu(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600">
                  <Pencil className="h-4 w-4 text-blue-500" /> Edit Post
                </button>
                <button onClick={() => { setShowMenu(false); handleDelete(); }} disabled={isDeleting}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <Trash2 className="h-4 w-4" /> {isDeleting ? 'Deleting...' : 'Delete Post'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4 sm:px-5 pb-2">
        {isEditing ? (
          <div className="space-y-2">
            <textarea rows={3} value={editContent} onChange={e => setEditContent(e.target.value)}
              className="w-full resize-none rounded-xl border border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 dark:text-white px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 outline-none" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setIsEditing(false); setEditContent(post.content); }}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={handleSaveEdit} disabled={isSavingEdit || !editContent.trim()}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 flex items-center gap-1">
                {isSavingEdit && <Loader2 className="h-3 w-3 animate-spin" />} Save
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
            {highlightMentions(post.content)}
          </p>
        )}
        <ImageGallery images={post.images} />
      </div>

      {/* Stats Bar — forced LTR to prevent flip */}
      {(likesCount > 0 || post.comments_count > 0) && (
        <div className="flex items-center gap-3 px-5 pb-2 text-xs text-gray-400 dark:text-slate-500" dir="ltr">
          {likesCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="bg-blue-500 rounded-full p-0.5"><Heart className="h-2.5 w-2.5 text-white fill-white" /></span>
              <span>{likesCount}</span>
            </span>
          )}
          {post.comments_count > 0 && (
            <button className="ms-auto hover:underline" onClick={() => setShowComments(p => !p)}>
              {post.comments_count} comment{post.comments_count !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* Action Buttons — forced LTR */}
      <div className="flex border-t border-gray-100 dark:border-slate-700 divide-x divide-gray-100 dark:divide-slate-700" dir="ltr">
        <button onClick={handleLike}
          className={`flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors rounded-bl-2xl ${
            liked ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100' : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700'
          }`}>
          <Heart className={`h-4 w-4 ${liked ? 'fill-blue-600' : ''}`} />
          Like
        </button>
        <button onClick={() => setShowComments(p => !p)}
          className="flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors rounded-br-2xl">
          <MessageCircle className="h-4 w-4" />
          Comment
        </button>
      </div>

      {showComments && <CommentsSection postId={post.id} onAvatarClick={onAvatarClick} />}
    </div>
  );
};

// ─── Create Post Card ─────────────────────────────────────────────────────────

const CreatePostCard = ({ user, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedImages, setSelectedImages] = useState([]); // [{file, preview}]
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files).slice(0, 6); // max 6 images
    const newImages = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
    setSelectedImages(prev => [...prev, ...newImages].slice(0, 6));
    e.target.value = '';
  };

  const removeImage = (idx) => setSelectedImages(prev => prev.filter((_, i) => i !== idx));

  const handleMention = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const newVal = content.slice(0, pos) + '@' + content.slice(pos);
    setContent(newVal);
    setTimeout(() => ta.setSelectionRange(pos + 1, pos + 1), 0);
    ta.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('content', trimmed);
      selectedImages.forEach(img => formData.append('images', img.file));

      const { data } = await axiosInstance.post('/api/community/posts/', formData);

      onPostCreated(data.post);
      setContent('');
      setSelectedImages([]);
      textareaRef.current?.focus();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to publish.');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-4 sm:p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar name={user?.username} image={null} role={user?.role} size="lg" />
        <div className="flex-1">
          <textarea ref={textareaRef} rows={3} value={content} onChange={e => setContent(e.target.value)}
            placeholder={`What's on your mind, ${user?.username}? Share your experience...`}
            className="w-full resize-none rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-blue-500/20 transition" />

          {selectedImages.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={img.preview} alt="" className="h-20 w-20 rounded-lg object-cover border border-gray-200" />
                  <button onClick={() => removeImage(idx)}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && <p className="mt-2 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {error}</p>}

          <div className="mt-3 flex items-center justify-between" dir="ltr">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                <Image className="h-4 w-4 text-green-500" /> Photo
              </button>
              <button type="button" onClick={handleMention}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition">
                <AtSign className="h-4 w-4 text-blue-500" /> Mention
              </button>
            </div>
            <button onClick={handleSubmit} disabled={!content.trim() || isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Post
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
        </div>
      </div>
    </div>
  );
};

// ─── Main Community Page ──────────────────────────────────────────────────────

const CommunityPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Profile modal state
  const [profileModal, setProfileModal] = useState(null); // user_id

  // Chat panel state
  const [chatPartner, setChatPartner] = useState(null); // partner object

  const fetchPosts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get('/api/community/posts/');
      setPosts(data.posts || []);
    } catch { setError('Could not load posts.'); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handlePostCreated = (newPost) => setPosts(prev => [newPost, ...prev]);
  const handlePostUpdate  = (updated) => setPosts(prev => prev.map(p => p.id === updated.id ? updated : p));
  const handlePostDelete  = (id)      => setPosts(prev => prev.filter(p => p.id !== id));

  const handleAvatarClick = (userId) => {
    if (userId === user?.id) return; // Don't show modal for self
    setProfileModal(userId);
  };

  const handleStartChat = (partner) => {
    setChatPartner(partner);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 space-y-5">
      {/* Header */}
      <div>
        <div className="inline-flex items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40 p-3 mb-3 text-blue-600">
          <Users className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Community</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Connect, share experiences, and support each other.</p>
      </div>

      <CreatePostCard user={user} onPostCreated={handlePostCreated} />

      {/* Feed */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse space-y-4">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-32 rounded bg-gray-200"></div>
                  <div className="h-3 w-20 rounded bg-gray-200"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-gray-200"></div>
                <div className="h-3 w-4/5 rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
          <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
          <p className="text-sm font-medium text-red-700">{error}</p>
          <button onClick={fetchPosts} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-red-600 ring-1 ring-red-200 hover:bg-red-50">
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>
        </div>
      )}

      {!isLoading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100 text-gray-400 mb-4">
            <MessageSquarePlus className="h-8 w-8" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No posts yet</h3>
          <p className="mt-1 text-sm text-gray-500 max-w-xs">Be the first to share your experience!</p>
        </div>
      )}

      {!isLoading && !error && posts.map(post => (
        <PostCard key={post.id} post={post}
          onAvatarClick={handleAvatarClick}
          onPostUpdate={handlePostUpdate}
          onPostDelete={handlePostDelete}
        />
      ))}

      {/* Modals */}
      {profileModal && (
        <UserProfileModal
          userId={profileModal}
          onClose={() => setProfileModal(null)}
          onStartChat={handleStartChat}
        />
      )}

      {chatPartner && (
        <ChatPanel
          partner={chatPartner}
          currentUserId={user?.id}
          onClose={() => setChatPartner(null)}
        />
      )}
    </div>
  );
};

export default CommunityPage;
