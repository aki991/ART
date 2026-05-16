export interface Pigeon {
  id: string;
  owner_id: string;
  ring_country: string;
  ring_number: string;
  ring_segment_3: string;
  ring_segment_4: string;
  ring_year: string;
  full_ring_number: string;
  color: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface PigeonInput {
  ringCountry: string;
  ringNumber: string;
  ringSegment3: string;
  ringSegment4: string;
  ringYear: string;
  color: string;
  name?: string;
}

export interface PigeonPatch {
  ringCountry?: string;
  ringNumber?: string;
  ringSegment3?: string;
  ringSegment4?: string;
  ringYear?: string;
  color?: string;
  name?: string | null;
}
