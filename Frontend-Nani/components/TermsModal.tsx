import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  TERMS_CLIENTE_HTML,
  TERMS_NINERA_HTML,
} from "../constants/termsContent";

type TermsType = "cliente" | "ninera";

interface TermsModalProps {
  visible: boolean;
  type: TermsType;
  onClose: () => void;
  onAccept: () => void;
}

// ─── Resumen legible dentro del modal (ScrollView nativo) ────────────────────
function ClienteSummary() {
  return (
    <View>
      <SectionTitle>1. Acerca de Nani</SectionTitle>
      <Body>
        Nani es una plataforma hondureña que conecta familias con niñeras
        certificadas. Al registrarte aceptas estos términos de forma vinculante.
      </Body>

      <SectionTitle>2. Política de Cancelación</SectionTitle>
      <TableRow
        label="Más de 3 días antes"
        value="Sin cargo ✓"
        valueColor="#16a34a"
      />
      <TableRow
        label="2 – 3 días antes"
        value="25% del total"
        valueColor="#d97706"
      />
      <TableRow
        label="1 día antes o mismo día"
        value="100% (cobro completo)"
        valueColor="#dc2626"
      />
      <Body style={{ marginTop: 8 }}>
        Las cancelaciones deben realizarse desde la app. En caso de emergencia
        médica documentada, Nani evalúa el caso individualmente.
      </Body>

      <SectionTitle>3. Política de Pagos y Sanciones</SectionTitle>
      <Body>
        Métodos aceptados: tarjeta (débito automático) o efectivo al finalizar.
      </Body>
      <WarningBox>
        <Body style={{ color: "#991b1b", fontWeight: "600" }}>
          Incumplimiento de pago:
        </Body>
        <Body>• 1.er incumplimiento → Advertencia + deuda registrada.</Body>
        <Body>• 2.do incumplimiento → Suspensión 7 días.</Body>
        <Body>• 3.er incumplimiento → BLOQUEO PERMANENTE de la app.</Body>
      </WarningBox>

      <SectionTitle>4. Responsabilidades del Cliente</SectionTitle>
      <Body>
        • Proveer información veraz sobre los niños (alergias, medicamentos).
      </Body>
      <Body>• Estar disponible por teléfono durante el servicio.</Body>
      <Body>
        • Respetar el horario acordado (horas extra se cobran adicional).
      </Body>
      <Body>• No solicitar tareas fuera del cuidado infantil.</Body>

      <SectionTitle>5. Trato a la Niñera</SectionTitle>
      <WarningBox>
        <Body>
          Cualquier maltrato o acoso hacia la niñera resulta en suspensión
          inmediata y permanente de la cuenta, con posible reporte a
          autoridades.
        </Body>
      </WarningBox>

      <SectionTitle>6. Protección de Datos</SectionTitle>
      <Body>
        Tu información es tratada conforme a la Ley de Protección de Datos de
        Honduras. No compartimos datos con terceros fuera del servicio.
      </Body>
    </View>
  );
}

function NineraSummary() {
  return (
    <View>
      <SectionTitle>1. Acerca de Nani</SectionTitle>
      <Body>
        Nani conecta niñeras certificadas con familias en Honduras. La relación
        es de prestadora de servicios independiente, no de empleada.
      </Body>

      <SectionTitle>2. Código de Vestimenta</SectionTitle>
      <HighlightBox>
        <Body style={{ fontWeight: "700", color: "#5b21b6" }}>
          Requerido en todo servicio:
        </Body>
        <Body>• Blusa o camisa de vestir (colores neutros/pasteles).</Body>
        <Body>• Pantalón de vestir o falda a la rodilla.</Body>
        <Body>• Zapatos cerrados cómodos y limpios.</Body>
        <Body>• Cabello recogido y presentación impecable.</Body>
      </HighlightBox>
      <Body style={{ fontWeight: "600" }}>Prohibido:</Body>
      <Body>
        • Shorts, minifaldas, sandalias, ropa deportiva o transparente.
      </Body>
      <WarningBox>
        <Body style={{ color: "#991b1b", fontWeight: "600" }}>
          Sanciones por incumplimiento:
        </Body>
        <Body>• 1.er incidente → Advertencia formal.</Body>
        <Body>• 2.do incidente → Suspensión 7 días.</Body>
        <Body>• 3.er incidente → SUSPENSIÓN PERMANENTE.</Body>
      </WarningBox>

      <SectionTitle>3. Puntualidad</SectionTitle>
      <Body>• Llegar al menos 10 minutos antes del inicio.</Body>
      <Body>• Check-in/check-out con código QR obligatorio.</Body>
      <TableRow
        label="Retraso +30 min sin aviso"
        value="−10% del pago"
        valueColor="#d97706"
      />
      <TableRow
        label="No presentarse (no-show)"
        value="Suspensión 14 días"
        valueColor="#dc2626"
      />

      <SectionTitle>4. Cancelaciones de la Niñera</SectionTitle>
      <TableRow
        label="Más de 3 días antes"
        value="Sin sanción ✓"
        valueColor="#16a34a"
      />
      <TableRow
        label="1 – 3 días antes"
        value="Advertencia formal"
        valueColor="#d97706"
      />
      <TableRow
        label="Mismo día del servicio"
        value="Multa 15% + advertencia"
        valueColor="#dc2626"
      />
      <TableRow
        label="5+ cancelaciones en 90 días"
        value="SUSPENSIÓN PERMANENTE"
        valueColor="#dc2626"
      />

      <SectionTitle>5. Responsabilidades con los Niños</SectionTitle>
      <Body>• Supervisión constante durante todo el servicio.</Body>
      <Body>
        • Seguir instrucciones de alimentación y medicación de los padres.
      </Body>
      <Body>
        • En emergencias: llamar al 911, avisar a los padres y usar el botón de
        emergencia de la app.
      </Body>
      <Body>• No administrar medicamentos no indicados.</Body>

      <SectionTitle>6. Confidencialidad</SectionTitle>
      <WarningBox>
        <Body>
          Compartir información de los clientes en redes sociales u otros medios
          resulta en suspensión permanente inmediata y posibles acciones
          legales.
        </Body>
      </WarningBox>

      <SectionTitle>7. Comisión de Plataforma</SectionTitle>
      <Body>
        Nani cobra una comisión visible en el resumen de cada reserva antes de
        aceptarla. Se descuenta automáticamente del pago.
      </Body>
    </View>
  );
}

// ─── Sub-componentes de utilidad ─────────────────────────────────────────────
const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Text style={st.sectionTitle}>{children}</Text>
);

const Body = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) => <Text style={[st.body, style]}>{children}</Text>;

const TableRow = ({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) => (
  <View style={st.tableRow}>
    <Text style={st.tableLabel}>{label}</Text>
    <Text style={[st.tableValue, valueColor ? { color: valueColor } : {}]}>
      {value}
    </Text>
  </View>
);

const WarningBox = ({ children }: { children: React.ReactNode }) => (
  <View style={st.warningBox}>{children}</View>
);

const HighlightBox = ({ children }: { children: React.ReactNode }) => (
  <View style={st.highlightBox}>{children}</View>
);

// ─── Componente principal ────────────────────────────────────────────────────
export default function TermsModal({
  visible,
  type,
  onClose,
  onAccept,
}: TermsModalProps) {
  const [downloading, setDownloading] = useState(false);

  const title =
    type === "cliente"
      ? "Términos y Condiciones — Clientes"
      : "Términos y Condiciones — Niñeras";

  const htmlContent =
    type === "cliente" ? TERMS_CLIENTE_HTML : TERMS_NINERA_HTML;

  const fileName =
    type === "cliente"
      ? "Nani_Terminos_Clientes.pdf"
      : "Nani_Terminos_Nineras.pdf";

  const handleDownload = async () => {
    try {
      setDownloading(true);

      if (Platform.OS === "web") {
        // En web: abrir en nueva pestaña para imprimir / guardar como PDF
        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName.replace(".pdf", ".html");
        a.click();
        URL.revokeObjectURL(url);
        return;
      }

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Guardar o compartir PDF",
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert("PDF generado", `El archivo fue guardado en: ${uri}`, [
          { text: "OK" },
        ]);
      }
    } catch (err) {
      Alert.alert("Error", "No se pudo generar el PDF. Intenta de nuevo.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={st.container}>
        {/* Header */}
        <View style={st.header}>
          <TouchableOpacity style={st.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={st.headerTitle}>Términos y Condiciones</Text>
            <Text style={st.headerSub}>
              {type === "cliente" ? "Para Clientes" : "Para Niñeras"}
            </Text>
          </View>
          <TouchableOpacity
            style={[st.downloadBtn, downloading && { opacity: 0.6 }]}
            onPress={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#886BC1" />
            ) : (
              <>
                <Ionicons name="download-outline" size={18} color="#886BC1" />
                <Text style={st.downloadBtnText}>PDF</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Contenido */}
        <ScrollView
          style={st.scroll}
          contentContainerStyle={st.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={st.versionBadge}>
            <Ionicons name="document-text-outline" size={14} color="#886BC1" />
            <Text style={st.versionText}>
              Versión 1.0 · Vigente desde enero 2025 · Honduras
            </Text>
          </View>

          {type === "cliente" ? <ClienteSummary /> : <NineraSummary />}

          <View style={st.footerNote}>
            <Ionicons
              name="information-circle-outline"
              size={15}
              color="#888"
            />
            <Text style={st.footerNoteText}>
              Soporte: soporte@nani.hn · WhatsApp: +504 9999-0000
            </Text>
          </View>
        </ScrollView>

        {/* Botones de acción */}
        <View style={st.actions}>
          <TouchableOpacity style={st.cancelAction} onPress={onClose}>
            <Text style={st.cancelActionText}>Cerrar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.acceptAction} onPress={onAccept}>
            <Ionicons name="checkmark-circle-outline" size={18} color="white" />
            <Text style={st.acceptActionText}>He leído y acepto</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },

  header: {
    backgroundColor: "#886BC1",
    paddingTop: 55,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontWeight: "800",
    fontSize: 16,
  },
  headerSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 1,
  },
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  downloadBtnText: {
    color: "#886BC1",
    fontWeight: "700",
    fontSize: 13,
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 30 },

  versionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F3EEFF",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  versionText: {
    color: "#886BC1",
    fontSize: 12,
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#886BC1",
    marginTop: 22,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#FF768A",
    paddingLeft: 8,
    textTransform: "uppercase",
  },
  body: {
    fontSize: 13,
    color: "#374151",
    lineHeight: 20,
    marginBottom: 5,
  },

  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  tableLabel: {
    fontSize: 12,
    color: "#374151",
    flex: 1,
    paddingRight: 8,
  },
  tableValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    textAlign: "right",
  },

  warningBox: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1.5,
    borderColor: "#FECACA",
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
  },
  highlightBox: {
    backgroundColor: "#F5F0FF",
    borderWidth: 1.5,
    borderColor: "#C4B5FD",
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
  },

  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 28,
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
  },
  footerNoteText: {
    fontSize: 12,
    color: "#888",
  },

  actions: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    paddingBottom: 30,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  cancelAction: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  cancelActionText: {
    color: "#4B5563",
    fontWeight: "600",
  },
  acceptAction: {
    flex: 2,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#886BC1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  acceptActionText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
});
