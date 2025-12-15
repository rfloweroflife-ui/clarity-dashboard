import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useEmailDigest() {
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();

  const sendDigestNow = async () => {
    if (!user?.email) {
      toast.error('No email address found');
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-task-digest', {
        body: {
          userId: user.id,
          email: user.email,
          userName: user.user_metadata?.full_name,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Daily digest sent to your email!');
      } else if (data?.message) {
        toast.info(data.message);
      }
    } catch (error: any) {
      console.error('Error sending digest:', error);
      toast.error('Failed to send digest email');
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendDigestNow,
    isSending,
  };
}
