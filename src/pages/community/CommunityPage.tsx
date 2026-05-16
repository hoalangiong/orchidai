import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useCommunity, useComments, CommunityPost } from '../../hooks/useCommunity';
import { useAuth } from '../../contexts/AuthContext';

function getOrchidSpecies(t: any): string[] {
  return [
    t('community.species.phalaenopsis'),
    t('community.species.dendrobium'),
    t('community.species.cattleya'),
    t('community.species.oncidium'),
    t('community.species.vanda'),
    t('community.species.mokara'),
    t('community.species.cymbidium'),
    t('community.species.rhynchostylis'),
    t('community.species.other'),
  ];
}

function timeAgo(ts: number, t: any): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return t('community.timeAgo.justNow');
  if (diff < 3600) return t('community.timeAgo.minutesAgo', { count: Math.floor(diff / 60) });
  if (diff < 86400) return t('community.timeAgo.hoursAgo', { count: Math.floor(diff / 3600) });
  return t('community.timeAgo.daysAgo', { count: Math.floor(diff / 86400) });
}

const AVATAR_SIZE: Record<number, string> = {
  7:  'w-7 h-7',
  8:  'w-8 h-8',
  9:  'w-9 h-9',
  10: 'w-10 h-10',
};

function Avatar({ src, name, size = 8 }: { src: string; name: string; size?: number }) {
  const sz = AVATAR_SIZE[size] ?? 'w-8 h-8';
  const cls = `${sz} rounded-full object-cover bg-green-100 shrink-0`;
  if (src) return <img src={src} alt={name} className={cls} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />;
  return (
    <div className={`${sz} rounded-full bg-green-100 text-green-600 font-bold text-sm flex items-center justify-center shrink-0`}>
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

function CommentSection({ postId, commentCount }: { postId: string; commentCount: number }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { comments, addComment } = useComments(postId);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    await addComment(text);
    setText('');
    setSending(false);
  };

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-gray-400 text-sm"
      >
        <span>💬</span>
        <span>{commentCount > 0 ? commentCount : ''} {t('community.comments')}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          {comments.map(c => (
            <div key={c.id} className="flex items-start gap-2">
              <Avatar src={c.authorPhoto} name={c.authorName} size={7} />
              <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-xs font-semibold text-gray-700">{c.authorName}</p>
                <p className="text-sm text-gray-800 mt-0.5">{c.text}</p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(c.createdAt, t)}</p>
              </div>
            </div>
          ))}

          {user && (
            <div className="flex items-center gap-2">
              <Avatar src={user.photoURL ?? ''} name={user.displayName ?? ''} size={7} />
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={t('community.commentPlaceholder')}
                className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-sm outline-none border border-gray-100 focus:border-green-300"
              />
              <button
                onClick={handleSend}
                disabled={sending || !text.trim()}
                className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center disabled:opacity-40 shrink-0"
              >
                ➤
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PostCard({ post, currentUid, onDelete, onToggleLike, t }: {
  post: CommunityPost;
  currentUid: string;
  onDelete: () => void;
  onToggleLike: (postId: string, liked: boolean) => void;
  t: any;
}) {
  const liked = post.likes.includes(currentUid);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar src={post.authorPhoto} name={post.authorName} size={9} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{post.authorName}</p>
          <p className="text-xs text-gray-400">{timeAgo(post.createdAt, t)}</p>
        </div>
        {post.species?.trim() && (
          <span className="shrink-0 text-xs bg-green-50 text-green-600 font-medium px-2.5 py-1 rounded-full">
            {post.species.split(' ')[0]}
          </span>
        )}
        {currentUid === post.authorId && (
          <button onClick={onDelete} className="shrink-0 text-gray-300 hover:text-red-400 text-lg leading-none ml-1">
            ✕
          </button>
        )}
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="w-full aspect-square bg-gray-100">
          <img src={post.imageUrl} alt="post" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Caption + actions */}
      <div className="px-4 py-3 space-y-2">
        {post.caption && (
          <p className="text-sm text-gray-800">{post.caption}</p>
        )}
        <div className="flex items-center gap-4 pt-1">
          <button
            onClick={() => onToggleLike(post.id, liked)}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${liked ? 'text-red-500' : 'text-gray-400'}`}
          >
            <span className={`text-lg transition-transform ${liked ? 'scale-125' : ''}`}>
              {liked ? '❤️' : '🤍'}
            </span>
            <span>{post.likes.length > 0 ? post.likes.length : ''} {t('community.likes')}</span>
          </button>
          <CommentSection postId={post.id} commentCount={post.commentCount} />
        </div>
      </div>
    </div>
  );
}

function NewPostForm({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { addPost } = useCommunity();
  const [imagePreview, setImagePreview] = useState('');
  const [caption, setCaption] = useState('');
  const [species, setSpecies] = useState('');
  const [posting, setPosting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const ORCHID_SPECIES = getOrchidSpecies(t);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Resize to max 800px before storing as base64
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const maxSize = 800;
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL('image/jpeg', 0.75);
      setImagePreview(data);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handlePost = async () => {
    if (posting || (!imagePreview && !caption.trim())) return;
    setPosting(true);
    try {
      await addPost({ imageUrl: imagePreview, caption: caption.trim(), species });
      onClose();
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3 border border-green-100">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900">{t('community.shareTitle')}</h2>
        <button onClick={onClose} className="text-gray-400 text-lg">✕</button>
      </div>

      {/* Image picker */}
      <div
        onClick={() => fileRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors overflow-hidden
          ${imagePreview ? 'border-green-300' : 'border-gray-200 bg-gray-50 h-44'}`}
      >
        {imagePreview
          ? <img src={imagePreview} alt="preview" className="w-full max-h-64 object-cover rounded-2xl" />
          : (
            <div className="flex flex-col items-center gap-1 py-10">
              <span className="text-4xl">📷</span>
              <p className="text-sm text-gray-400">{t('community.selectPhoto')}</p>
            </div>
          )
        }
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
      </div>

      {/* Species */}
      <select value={species} onChange={e => setSpecies(e.target.value)} className="input">
        <option value="">{t('community.speciesOptional')}</option>
        {ORCHID_SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      {/* Caption */}
      <textarea
        value={caption}
        onChange={e => setCaption(e.target.value)}
        placeholder={t('community.captionPlaceholder')}
        rows={3}
        className="input resize-none"
      />

      <button
        onClick={handlePost}
        disabled={posting || (!imagePreview && !caption.trim())}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold disabled:opacity-50"
      >
        {posting ? t('community.posting') : t('community.postButton')}
      </button>
    </div>
  );
}

export default function CommunityPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { posts, loading, deletePost, toggleLike } = useCommunity();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('community.title')}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{t('community.subtitle')}</p>
        </div>
        {user && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm"
          >
            {t('community.shareButton')}
          </button>
        )}
      </div>

      {showForm && <NewPostForm onClose={() => setShowForm(false)} />}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="text-5xl mb-3">🌸</span>
          <p className="text-gray-500 font-medium">{t('community.noPosts')}</p>
          <p className="text-gray-400 text-sm mt-1">{t('community.beFirst')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUid={user?.uid ?? ''}
              onDelete={() => deletePost(post.id)}
              onToggleLike={toggleLike}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}
