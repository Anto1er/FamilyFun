import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useFamilyStore } from '@/stores/familyStore';
import { useMissionsStore } from '@/stores/missionsStore';
import { useGiftsStore } from '@/stores/giftsStore';

export function useRealtime() {
  const profile = useAuthStore((s) => s.profile);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const fetchMembers = useFamilyStore((s) => s.fetchMembers);
  const fetchMissions = useMissionsStore((s) => s.fetchMissions);
  const fetchSubmissions = useMissionsStore((s) => s.fetchSubmissions);
  const fetchGifts = useGiftsStore((s) => s.fetchGifts);

  const familyId = profile?.family_id;

  useEffect(() => {
    if (!familyId) return;

    const channel = supabase
      .channel(`family:${familyId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'missions', filter: `family_id=eq.${familyId}` },
        () => { fetchMissions(familyId); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mission_submissions', filter: `family_id=eq.${familyId}` },
        () => {
          fetchSubmissions(familyId);
          // Also refresh members to get updated points after approval trigger
          fetchMembers(familyId);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gifts', filter: `family_id=eq.${familyId}` },
        () => { fetchGifts(familyId); }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `family_id=eq.${familyId}` },
        () => {
          fetchProfile();
          fetchMembers(familyId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [familyId]);
}
