// constants/events.ts

export type EventType = 'ELECCION' | 'PROCESO' | 'MIEMBRO_MESA';
export type EventTarget = 'ELECTOR' | 'MIEMBRO_MESA' | 'GENERAL';

export interface ElectoralEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  date: string; // ISO string: '2026-04-10T09:00:00Z'
  target: EventTarget;
  // Opcional: para RF1.1.1 (nacional/regional)
  level?: 'NACIONAL' | 'REGIONAL' | 'LOCAL';
}

// 🔹 Datos de prueba para la hackatón (luego se reemplazan por API)
export const EVENTS: ElectoralEvent[] = [
  {
    id: '1',
    title: 'Elecciones Generales 2026',
    description: 'Jornada de votación a nivel nacional.',
    type: 'ELECCION',
    date: '2026-04-12T08:00:00Z',
    target: 'GENERAL',
    level: 'NACIONAL',
  },
  {
    id: '2',
    title: 'Inicio de campaña electoral',
    description: 'Inicio oficial de la campaña para elecciones generales.',
    type: 'PROCESO',
    date: '2026-01-15T00:00:00Z',
    target: 'GENERAL',
  },
  {
    id: '3',
    title: 'Capacitación para miembros de mesa',
    description: 'Primera jornada de capacitación obligatoria.',
    type: 'MIEMBRO_MESA',
    date: '2026-03-01T09:00:00Z',
    target: 'MIEMBRO_MESA',
  },
  {
    id: '4',
    title: 'Cierre de inscripción de candidatos',
    description: 'Fecha límite para la inscripción de listas de candidatos.',
    type: 'PROCESO',
    date: '2025-12-01T23:59:59Z',
    target: 'GENERAL',
  },
  {
    id: '5',
    title: 'Fecha límite para excusa de miembros de mesa',
    description:
      'Último día para presentar excusas para ser miembro de mesa ante el organismo electoral.',
    type: 'MIEMBRO_MESA',
    date: '2026-02-10T23:59:59Z',
    target: 'MIEMBRO_MESA',
  },
];