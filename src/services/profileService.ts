import { api } from '@/lib/api';

// Resposta de GET/PUT /profile.
// heightCm/weightKg = null: o usuário ainda não cadastrou os dados.
export interface Profile {
  heightCm: number | null;
  weightKg: number | null;
  updatedAt: string | null;
}

// O usuário é identificado pelo token (interceptor em lib/api.ts).
export async function getProfile() {
  const response = await api.get<Profile>('/profile');
  return response.data;
}

export async function updateProfile(data: { heightCm: number; weightKg: number }) {
  const response = await api.put<Profile>('/profile', data);
  return response.data;
}
