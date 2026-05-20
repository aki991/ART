import { signOutAction } from "@/app/auth/actions";
import { clearAllStores } from "@/lib/store/clear-all";

/**
 * Jedinstvena logout procedura. Čisti SAV klijentski state PRE poziva
 * server action-a koji uklanja Supabase sesiju. Koristiti na svim mestima
 * gde se korisnik odjavljuje, da se stanje ne prelije na sledeći nalog.
 */
export async function performSignOut(): Promise<void> {
  clearAllStores();
  await signOutAction();
}
