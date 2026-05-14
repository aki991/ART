export interface ChangelogEntry {
  version: string;
  date: string; // display format: DD.MM.YYYY.
  changes: string[];
}

// Newest release first. Add a new entry on top for each release.
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.0.0",
    date: "14.05.2026.",
    changes: [
      "Inicijalno izdanje aplikacije Aero Ring Tech",
      "Praćenje trka uživo sa real-time grafikonom visine",
      "Programiranje prstenova sa sinhronizovanim statusima detektovanih i programiranih prstenova",
      "Upravljanje listom golubova sa pretragom po broju",
      "Pregled rezultata svih trka sa detaljnim izveštajima",
      "Stranica Postavke sa upravljanjem profilom, klubom i golubarnikom",
    ],
  },
];
