import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { RaceStatus, RaceVisibility } from "@/lib/types/race";

// Helvetica (ugrađen u @react-pdf) nema č/ć/đ — imena letova, golubara i
// klubova bi se polomila. Roboto pokriva ceo srpski latinični set.
Font.register({
  family: "Roboto",
  fonts: [
    { src: "/fonts/Roboto-Regular.ttf", fontWeight: "normal" },
    { src: "/fonts/Roboto-Bold.ttf", fontWeight: "bold" },
  ],
});
// Bez ovoga @react-pdf primenjuje englesku hifenaciju na srpske reči.
Font.registerHyphenationCallback((word) => [word]);

export interface RacePdfPigeon {
  ring_number: string;
  color_name: string;
  dot_color: string;
  total_time: string;
  above_time: string;
  max_altitude: number | null;
  reached_vis: boolean;
  valid_flight: boolean;
}

export interface RacePdfData {
  race: {
    name: string;
    started_at: string;
    duration_seconds: number | null;
    max_altitude: number | null;
    avg_altitude: number | null;
    visibility: RaceVisibility;
    status: RaceStatus;
  };
  golubar: { name: string };
  drustvo: { name: string; logo_url: string | null } | null;
  pigeons: RacePdfPigeon[];
  aggregate: { sum_time: string; avg_time: string } | null;
  chartImageDataUrl: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 64,
    fontSize: 11,
    fontFamily: "Roboto",
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 16,
    objectFit: "contain",
  },
  drustvoInfo: {
    flex: 1,
  },
  drustvoName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  appBranding: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#0284c7",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  infoBox: {
    width: "33.33%",
    marginBottom: 10,
    paddingRight: 12,
  },
  infoLabel: {
    fontSize: 8,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 11,
    color: "#1a1a1a",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 12,
    color: "#1a1a1a",
  },
  chartImage: {
    width: "100%",
    height: 210,
    marginBottom: 16,
    objectFit: "contain",
  },
  chartEmpty: {
    fontSize: 10,
    color: "#9ca3af",
    textAlign: "center",
    paddingVertical: 28,
    marginBottom: 16,
  },
  table: {
    width: "100%",
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  tableFooter: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderTopWidth: 1.5,
    borderTopColor: "#9ca3af",
    backgroundColor: "#f9fafb",
  },
  tableCell: {
    fontSize: 9,
    color: "#1a1a1a",
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#6b7280",
  },
  footerCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  colGolub: { width: "22%" },
  colBoja: { width: "12%" },
  colTotal: { width: "13%" },
  colAbove: { width: "19%" },
  colMax: { width: "12%" },
  colVis: { width: "10%" },
  colValid: { width: "12%" },
  golubCell: {
    flexDirection: "row",
    alignItems: "center",
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  valYes: { color: "#16a34a", fontWeight: "bold" },
  valNo: { color: "#dc2626", fontWeight: "bold" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 9,
    color: "#9ca3af",
    textAlign: "center",
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
  },
});

const VISIBILITY_LABELS: Record<RaceVisibility, string> = {
  private: "Privatno",
  club: "Društvo",
  public: "Javno",
};

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${secs}s`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAltitude(value: number | null): string {
  return value !== null ? `${value}m` : "—";
}

export function RacePdfDocument({
  race,
  golubar,
  drustvo,
  pigeons,
  aggregate,
  chartImageDataUrl,
}: RacePdfData) {
  return (
    <Document title={`Let — ${race.name}`} author={golubar.name}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {drustvo?.logo_url && (
            <Image src={drustvo.logo_url} style={styles.logo} />
          )}
          <View style={styles.drustvoInfo}>
            <Text style={styles.drustvoName}>
              {drustvo?.name || "Aero Ring Tech"}
            </Text>
            <Text style={styles.appBranding}>
              Izveštaj generisan preko Aero Ring Tech aplikacije
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{race.name}</Text>

        <View style={styles.infoGrid}>
          <InfoBox label="Golubar" value={golubar.name} />
          <InfoBox label="Datum i vreme" value={formatDate(race.started_at)} />
          <InfoBox label="Trajanje" value={formatDuration(race.duration_seconds)} />
          <InfoBox label="Vidljivost" value={VISIBILITY_LABELS[race.visibility]} />
          <InfoBox label="Max visina" value={formatAltitude(race.max_altitude)} />
          <InfoBox
            label="Prosečna visina"
            value={formatAltitude(race.avg_altitude)}
          />
        </View>

        <Text style={styles.sectionTitle}>Visina kroz vreme</Text>
        {chartImageDataUrl ? (
          <Image src={chartImageDataUrl} style={styles.chartImage} />
        ) : (
          <Text style={styles.chartEmpty}>
            Nema snimljenih merenja za ovaj let.
          </Text>
        )}

        <Text style={styles.sectionTitle}>Izveštaj po golubu</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colGolub]}>Golub</Text>
            <Text style={[styles.tableHeaderCell, styles.colBoja]}>Boja</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>
              Ukupno vreme
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colAbove]}>
              Vreme iznad 800m
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colMax]}>
              Max visina
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colVis]}>
              Postigao VIS
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colValid]}>
              Validan let
            </Text>
          </View>

          {pigeons.map((pigeon, index) => (
            <View key={index} style={styles.tableRow} wrap={false}>
              <View style={[styles.colGolub, styles.golubCell]}>
                <View
                  style={[styles.colorDot, { backgroundColor: pigeon.dot_color }]}
                />
                <Text style={styles.tableCell}>{pigeon.ring_number}</Text>
              </View>
              <Text style={[styles.tableCell, styles.colBoja]}>
                {pigeon.color_name}
              </Text>
              <Text style={[styles.tableCell, styles.colTotal]}>
                {pigeon.total_time}
              </Text>
              <Text style={[styles.tableCell, styles.colAbove]}>
                {pigeon.above_time}
              </Text>
              <Text style={[styles.tableCell, styles.colMax]}>
                {formatAltitude(pigeon.max_altitude)}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.colVis,
                  pigeon.reached_vis ? styles.valYes : styles.valNo,
                ]}
              >
                {pigeon.reached_vis ? "Da" : "Ne"}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  styles.colValid,
                  pigeon.valid_flight ? styles.valYes : styles.valNo,
                ]}
              >
                {pigeon.valid_flight ? "Da" : "Ne"}
              </Text>
            </View>
          ))}

          {aggregate && (
            <View style={styles.tableFooter} wrap={false}>
              <View style={styles.colGolub}>
                <Text style={styles.footerCell}>Σ  Zbirno</Text>
                <Text style={[styles.footerCell, { marginTop: 3 }]}>
                  ø  Prosečno
                </Text>
              </View>
              <Text style={styles.colBoja} />
              <View style={styles.colTotal}>
                <Text style={styles.footerCell}>{aggregate.sum_time}</Text>
                <Text style={[styles.footerCell, { marginTop: 3 }]}>
                  {aggregate.avg_time}
                </Text>
              </View>
              <View style={{ width: "53%" }} />
            </View>
          )}
        </View>

        <Text style={styles.footer} fixed>
          Generisan: {formatDate(new Date().toISOString())} • Aero Ring Tech ©{" "}
          {new Date().getFullYear()}
        </Text>
      </Page>
    </Document>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}
