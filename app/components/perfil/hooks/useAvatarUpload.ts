import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../../utils/supabase";

interface AvatarUploadHook {
  uploadAvatar: (userId: string) => Promise<string | null>;
  isUploading: boolean;
  error: string | null;
}

export const useAvatarUpload = (): AvatarUploadHook => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    setIsUploading(true);
    setError(null);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (result.canceled) return null;

      const uri = result.assets[0].uri;
      const fileExtension = uri.split(".").pop();
      const fileName = `avatar_${userId}.${fileExtension}`;
      const fileType = `image/${fileExtension}`;

      const formData = new FormData();
      formData.append("file", {
        uri,
        name: fileName,
        type: fileType,
      } as any);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, formData, {
          contentType: fileType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("usuarios")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      return publicUrl;
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      setError(error.message || "Error al subir el avatar");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadAvatar, isUploading, error };
};
