import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase"; 

export const useChatAssistant = (
  initialMessage = "Hola, soy tu asistente psicológico. ¿Cómo te sientes hoy?"
) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMessages = async () => {
    try {
      setIsLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No hay un usuario autenticado");
      }

      const { data, error } = await supabase
        .from("chat_assistant")
        .select("*")
        .eq("user_id", user.id)
        .order("timestamp", { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedMessages = data.map((msg) => ({
          text: msg.text,
          fromUser: msg.from_user,
          timestamp: new Date(msg.timestamp),
          metadata: msg.metadata,
          isError: false,
        }));

        setMessages(formattedMessages);
      } else {
        const initialMsg = {
          text: initialMessage,
          fromUser: false,
          timestamp: new Date(),
          isError: false,
        };

        setMessages([initialMsg]);

        await saveMessage(initialMsg);
      }
    } catch (err) {
      console.error("Error al cargar mensajes:", err);
      setError(err);

      setMessages([
        {
          text: initialMessage,
          fromUser: false,
          timestamp: new Date(),
          isError: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMessage = async (message) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No hay un usuario autenticado");
      }

      const { error } = await supabase.from("chat_assistant").insert({
        user_id: user.id,
        text: message.text,
        from_user: message.fromUser,
        timestamp: message.timestamp.toISOString(),
        metadata: message.metadata || null,
      });

      if (error) throw error;
    } catch (err) {
      console.error("Error al guardar mensaje:", err);
      setError(err);
    }
  };

  const addMessage = async (message) => {
    try {
      setMessages((prevMessages) => [...prevMessages, message]);
      await saveMessage(message);
    } catch (err) {
      console.error("Error al añadir mensaje:", err);
      setError(err);
    }
  };

  const clearMessages = async () => {
    try {
      setIsLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No hay un usuario autenticado");
      }

      const { error } = await supabase
        .from("chat_assistant")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      const initialMsg = {
        text: initialMessage,
        fromUser: false,
        timestamp: new Date(),
        isError: false,
      };

      setMessages([initialMsg]);

      await saveMessage(initialMsg);
    } catch (err) {
      console.error("Error al borrar mensajes:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  return {
    messages,
    isLoading,
    error,
    addMessage,
    clearMessages,
    setMessages,
  };
};
