import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

type AddEventParams = {
  title: string;
  notes: string;
  startDate: Date;
  endDate: Date;
};

// ----------- WEB: abrir Google Calendar -----------
function addEventWeb({ title, notes, startDate, endDate }: AddEventParams) {
  // Formato para Google Calendar: YYYYMMDDTHHmmssZ
  const format = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const start = format(startDate);
  const end = format(endDate);

  const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&details=${encodeURIComponent(notes)}&dates=${start}/${end}&ctz=America/Lima`;

  // Abrir nueva pestaña con Google Calendar (solo web)
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
}

// ----------- NATIVO: usar un calendario existente -----------
async function addEventNative({
  title,
  notes,
  startDate,
  endDate,
}: AddEventParams) {
  const { status } = await Calendar.requestCalendarPermissionsAsync();

  if (status !== 'granted') {
    alert('No se concedieron permisos para acceder al calendario del dispositivo.');
    return false;
  }

  // Obtener todos los calendarios de eventos
  const calendars = await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT
  );

  // Buscar uno que permita modificaciones
  const targetCalendar = calendars.find(
    (cal) => cal.allowsModifications
  );

  if (!targetCalendar) {
    alert('No se encontró un calendario disponible para crear eventos.');
    return false;
  }

  const calendarId = targetCalendar.id; // ✅ aquí sí tenemos un id string válido

  await Calendar.createEventAsync(calendarId, {
    title,
    notes,
    startDate,
    endDate,
    timeZone: 'America/Lima',
  });

  alert('Evento agregado a tu calendario del dispositivo ✅');
  return true;
}

// ----------- FUNCIÓN UNIFICADA -----------
export async function addEventToCalendar(params: AddEventParams) {
  if (Platform.OS === 'web') {
    addEventWeb(params); // WEB → Google Calendar
    return true;
  }

  // ANDROID / iOS → calendario nativo
  return addEventNative(params);
}
