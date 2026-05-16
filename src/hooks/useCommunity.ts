import { useState, useEffect } from 'react';
import {
  collection, addDoc, onSnapshot, query, orderBy,
  updateDoc, doc, arrayUnion, arrayRemove, deleteDoc,
  limit, increment,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  imageUrl: string;
  caption: string;
  species: string;
  likes: string[];       // array of uid
  commentCount: number;
  createdAt: number;
}

export interface PostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  text: string;
  createdAt: number;
}

export function useCommunity() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'community'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as CommunityPost)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const addPost = async (data: { imageUrl: string; caption: string; species: string }) => {
    if (!user) return;
    await addDoc(collection(db, 'community'), {
      authorId: user.uid,
      authorName: user.displayName ?? 'Người dùng',
      authorPhoto: user.photoURL ?? '',
      imageUrl: data.imageUrl,
      caption: data.caption,
      species: data.species,
      likes: [],
      commentCount: 0,
      createdAt: Date.now(),
    });
  };

  const toggleLike = async (postId: string, liked: boolean) => {
    if (!user) return;
    await updateDoc(doc(db, 'community', postId), {
      likes: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
    });
  };

  const deletePost = async (postId: string) => {
    await deleteDoc(doc(db, 'community', postId));
  };

  return { posts, loading, addPost, toggleLike, deletePost };
}

export function useComments(postId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<PostComment[]>([]);

  useEffect(() => {
    if (!postId) return;
    const q = query(
      collection(db, 'community', postId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    return onSnapshot(q, snap => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() } as PostComment)));
    });
  }, [postId]);

  const addComment = async (text: string) => {
    if (!user || !text.trim()) return;
    await addDoc(collection(db, 'community', postId, 'comments'), {
      authorId: user.uid,
      authorName: user.displayName ?? 'Người dùng',
      authorPhoto: user.photoURL ?? '',
      text: text.trim(),
      createdAt: Date.now(),
    });
    await updateDoc(doc(db, 'community', postId), { commentCount: increment(1) });
  };

  return { comments, addComment };
}
