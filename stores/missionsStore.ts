import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Mission, MissionSubmission } from '@/types';

interface MissionsState {
  missions: Mission[];
  submissions: MissionSubmission[];
  loading: boolean;

  fetchMissions: (familyId: string) => Promise<void>;
  createMission: (mission: Omit<Mission, 'id' | 'created_at' | 'updated_at' | 'status'>) => Promise<void>;
  updateMission: (missionId: string, updates: Partial<Pick<Mission, 'title' | 'description' | 'points_reward' | 'recurrence'>>) => Promise<void>;
  archiveMission: (missionId: string) => Promise<void>;
  fetchSubmissions: (familyId: string) => Promise<void>;
  submitMission: (missionId: string, childId: string, familyId: string, note?: string) => Promise<void>;
  validateSubmission: (submissionId: string, status: 'approved' | 'rejected', validatedBy: string) => Promise<void>;
}

export const useMissionsStore = create<MissionsState>((set, get) => ({
  missions: [],
  submissions: [],
  loading: false,

  fetchMissions: async (familyId: string) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('family_id', familyId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ missions: (data as Mission[]) ?? [] });
    } finally {
      set({ loading: false });
    }
  },

  createMission: async (mission) => {
    const { error } = await (supabase.from('missions') as any).insert(mission);
    if (error) throw error;
    await get().fetchMissions(mission.family_id);
  },

  updateMission: async (missionId, updates) => {
    const { error } = await (supabase.from('missions') as any)
      .update(updates)
      .eq('id', missionId);
    if (error) throw error;

    set((state) => ({
      missions: state.missions.map((m) =>
        m.id === missionId ? { ...m, ...updates } : m
      ),
    }));
  },

  archiveMission: async (missionId: string) => {
    const { error } = await (supabase
      .from('missions') as any)
      .update({ status: 'archived' })
      .eq('id', missionId);
    if (error) throw error;

    set((state) => ({
      missions: state.missions.filter((m) => m.id !== missionId),
    }));
  },

  fetchSubmissions: async (familyId: string) => {
    const { data, error } = await supabase
      .from('mission_submissions')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    set({ submissions: (data as MissionSubmission[]) ?? [] });
  },

  submitMission: async (missionId, childId, familyId, note) => {
    const { error } = await (supabase.from('mission_submissions') as any).insert({
      mission_id: missionId,
      child_id: childId,
      family_id: familyId,
      note: note ?? null,
    });
    if (error) throw error;
    await get().fetchSubmissions(familyId);
  },

  validateSubmission: async (submissionId, status, validatedBy) => {
    const { error } = await (supabase
      .from('mission_submissions') as any)
      .update({
        status,
        validated_by: validatedBy,
        validated_at: new Date().toISOString(),
      })
      .eq('id', submissionId);
    if (error) throw error;

    // Refresh submissions list after validation
    const submission = get().submissions.find((s) => s.id === submissionId);
    if (submission?.family_id) {
      await get().fetchSubmissions(submission.family_id);
    }
  },
}));
