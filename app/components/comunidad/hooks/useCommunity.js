import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
export const useCommunity = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          user:usuarios(*),
          likes:post_likes(user_id)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const postsWithLikes = data.map((post) => ({
        ...post,
        likes: post.likes.map((like) => like.user_id),
      }));

      setPosts(postsWithLikes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          *,
          user:usuarios(*)
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addPost = async (content, userId) => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .insert([{ content, user_id: userId }])
        .select();

      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  };

  const addComment = async (postId, content, userId) => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([{ post_id: postId, content, user_id: userId }])
        .select();

      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  };

  const likePost = async (postId, userId) => {
    try {
      const { data: existingLike, error: likeError } = await supabase
        .from("post_likes")
        .select()
        .eq("post_id", postId)
        .eq("user_id", userId)
        .single();

      if (likeError && likeError.code !== "PGRST116") throw likeError;

      if (existingLike) {
        const { error: deleteError } = await supabase
          .from("post_likes")
          .delete()
          .eq("id", existingLike.id);

        if (deleteError) throw deleteError;
      } else {
        const { error: insertError } = await supabase
          .from("post_likes")
          .insert([{ post_id: postId, user_id: userId }]);

        if (insertError) throw insertError;
      }
    } catch (err) {
      throw err;
    }
  };

  const fetchCommentCounts = async () => {
    try {
      const { data, error } = await supabase.from("comments").select("post_id");

      if (error) throw error;

      const counts = {};
      data.forEach((comment) => {
        if (counts[comment.post_id]) {
          counts[comment.post_id]++;
        } else {
          counts[comment.post_id] = 1;
        }
      });

      return counts;
    } catch (err) {
      console.error("Error al obtener conteo de comentarios:", err);
      return {};
    }
  };
  return {
    posts,
    comments,
    loading,
    error,
    fetchPosts,
    fetchComments,
    fetchCommentCounts,
    addPost,
    addComment,
    likePost,
  };
};
