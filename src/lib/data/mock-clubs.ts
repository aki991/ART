import type { Club, ClubMember, JoinRequest } from "@/lib/settings/types";

// Frontend-only prototype: this stands in for backend club data.
// The signed-in user is hardcoded (no auth yet) — see SidebarFooter ("Andreja").
export const CURRENT_USER_ID = "current-user";

export const MOCK_CLUBS: Club[] = [
  {
    id: "club-vp",
    name: "GK Velika Plana",
    city: "Velika Plana",
    description:
      "Golubarski klub osnovan 1998. Okuplja odgajivače sportskih golubova sa područja Velike Plane i okoline.",
    logo: null,
    adminUserId: "user-101",
    createdAt: "2018-04-10",
  },
  {
    id: "club-bg",
    name: "GK Beograd Centar",
    city: "Beograd",
    description: "Najveći klub u regionu sa dugom tradicijom takmičenja.",
    logo: null,
    adminUserId: "user-102",
    createdAt: "2015-09-01",
  },
  {
    id: "club-ns",
    name: "GK Novi Sad",
    city: "Novi Sad",
    description: "Klub vojvođanskih golubara, fokus na trke dugih relacija.",
    logo: null,
    adminUserId: "user-103",
    createdAt: "2017-02-22",
  },
  {
    id: "club-ni",
    name: "GK Niš Jug",
    city: "Niš",
    description: "Mladi klub sa juga Srbije, aktivan od 2020.",
    logo: null,
    adminUserId: "user-104",
    createdAt: "2020-06-15",
  },
  {
    id: "club-kg",
    name: "GK Šumadija Kragujevac",
    city: "Kragujevac",
    description: "Klub iz srca Šumadije, organizator regionalnih takmičenja.",
    logo: null,
    adminUserId: "user-105",
    createdAt: "2016-11-30",
  },
  {
    id: "club-su",
    name: "GK Subotica Sever",
    city: "Subotica",
    description: "Severni klub, saradnja sa mađarskim odgajivačima.",
    logo: null,
    adminUserId: "user-106",
    createdAt: "2019-03-08",
  },
];

// Members per club — used when the current user joins a club so its roster has content.
export const MOCK_CLUB_MEMBERS: Record<string, ClubMember[]> = {
  "club-vp": [
    {
      userId: "user-101",
      firstName: "Milan",
      lastName: "Jovanović",
      username: "milan_j",
      avatar: null,
      joinedAt: "2018-04-10",
      role: "admin",
    },
    {
      userId: "user-201",
      firstName: "Petar",
      lastName: "Nikolić",
      username: "pera_ns",
      avatar: null,
      joinedAt: "2019-05-20",
      role: "member",
    },
    {
      userId: "user-202",
      firstName: "Goran",
      lastName: "Stanković",
      username: "goran_s",
      avatar: null,
      joinedAt: "2021-08-14",
      role: "member",
    },
  ],
  "club-bg": [
    {
      userId: "user-102",
      firstName: "Dragan",
      lastName: "Petrović",
      username: "dragan_p",
      avatar: null,
      joinedAt: "2015-09-01",
      role: "admin",
    },
    {
      userId: "user-203",
      firstName: "Nemanja",
      lastName: "Ilić",
      username: "nemanja_i",
      avatar: null,
      joinedAt: "2016-03-11",
      role: "member",
    },
  ],
  "club-ns": [
    {
      userId: "user-103",
      firstName: "Stefan",
      lastName: "Marić",
      username: "stefan_m",
      avatar: null,
      joinedAt: "2017-02-22",
      role: "admin",
    },
  ],
  "club-ni": [
    {
      userId: "user-104",
      firstName: "Aleksandar",
      lastName: "Đorđević",
      username: "aca_ni",
      avatar: null,
      joinedAt: "2020-06-15",
      role: "admin",
    },
  ],
  "club-kg": [
    {
      userId: "user-105",
      firstName: "Bojan",
      lastName: "Lukić",
      username: "bojan_kg",
      avatar: null,
      joinedAt: "2016-11-30",
      role: "admin",
    },
  ],
  "club-su": [
    {
      userId: "user-106",
      firstName: "Zoltan",
      lastName: "Sabo",
      username: "zoltan_s",
      avatar: null,
      joinedAt: "2019-03-08",
      role: "admin",
    },
  ],
};

// Member counts shown in the club browser (state A).
export function getMockMemberCount(clubId: string): number {
  return MOCK_CLUB_MEMBERS[clubId]?.length ?? 1;
}

// When the current user creates a club (state D), seed a couple of pending requests
// and extra members so the admin sections are demonstrable in the prototype.
export function seedCreatedClubJoinRequests(clubId: string): JoinRequest[] {
  return [
    {
      id: crypto.randomUUID(),
      clubId,
      userId: "user-301",
      firstName: "Marko",
      lastName: "Tomić",
      username: "marko_t",
      avatar: null,
      requestedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      clubId,
      userId: "user-302",
      firstName: "Ivan",
      lastName: "Radović",
      username: "ivan_r",
      avatar: null,
      requestedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];
}

export function seedCreatedClubMembers(): ClubMember[] {
  return [
    {
      userId: "user-303",
      firstName: "Vladimir",
      lastName: "Kostić",
      username: "vlada_k",
      avatar: null,
      joinedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      role: "member",
    },
  ];
}
