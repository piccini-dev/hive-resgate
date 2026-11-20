// Adaptador dos contratos puros para o REST/RPC já usado na Hive.
// A autorização efetiva permanece sob as políticas RLS e o RPC existentes.
import { db, getCurrentUserId } from '@/lib/db';
import { identityApi } from '@/lib/identityApi';
import { createBrandApi, type BrandApi } from '@/lib/identity/brand-context';

export const brandApi: BrandApi = createBrandApi(
  db,
  getCurrentUserId,
  () => identityApi.resetCache(),
);
