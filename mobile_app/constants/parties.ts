// constants/parties.ts

export type Role =
  | 'PRESIDENTE'
  | 'VICEPRESIDENTE'
  | 'DIPUTADO'
  | 'SENADOR'
  | 'PARLAMENTO_ANDINO';

export interface Party {
  id: string;
  name: string;
  shortName: string;
  description: string;
  slogan?: string;
  logoUrl?: string;
}

export interface GovernmentPlanSection {
  id: string;
  partyId: string;
  sector: string; // Economía, Salud, Educación, Ambiente, etc.
  summary: string;
}

export interface Candidate {
  id: string;
  partyId: string;
  name: string;
  role: Role;
  region?: string; // Nacional / Lima / Norte, etc.
  bio: string; // Hoja de vida resumida
  education?: string;
  experience?: string;
  proposals: string[]; // Propuestas clave (X)
}

export interface CandidateActivity {
  id: string;
  candidateId: string;
  title: string;
  date: string; // ISO
  location?: string;
  description: string;
}

export interface PartyNews {
  id: string;
  partyId?: string; // si es undefined, la noticia es general de elecciones
  title: string;
  source: string;
  summary: string;
  publishedAt: string;
  url?: string;
}

// 🔹 Agrupaciones políticas (RF2.1)
export const PARTIES: Party[] = [
  {
    id: 'alianza-progreso',
    name: 'Alianza por el Progreso Democrático',
    shortName: 'APD',
    description:
      'Agrupación de centro reformista que propone modernizar el Estado y cerrar brechas sociales con enfoque territorial.',
    slogan: 'Progreso con igualdad de oportunidades.',
  },
  {
    id: 'frente-verde',
    name: 'Frente Verde Ciudadano',
    shortName: 'FVC',
    description:
      'Movimiento ciudadano con énfasis en transición energética, protección ambiental y transparencia en la gestión pública.',
    slogan: 'Un futuro sostenible para todos.',
  },
];

// 🔹 Plan de gobierno por sectores (RF2.2.2)
export const GOVERNMENT_PLANS: GovernmentPlanSection[] = [
  // APD
  {
    id: 'apd-economia',
    partyId: 'alianza-progreso',
    sector: 'Economía',
    summary:
      'Impulso a la inversión privada con enfoque regional, simplificación tributaria y apoyo financiero a mypes.',
  },
  {
    id: 'apd-salud',
    partyId: 'alianza-progreso',
    sector: 'Salud',
    summary:
      'Fortalecimiento de la atención primaria, digitalización de historias clínicas y reducción de colas en hospitales.',
  },
  {
    id: 'apd-educacion',
    partyId: 'alianza-progreso',
    sector: 'Educación',
    summary:
      'Programa nacional de refuerzo escolar, capacitación docente continua y conectividad en zonas rurales.',
  },
  // Frente Verde
  {
    id: 'fvc-ambiente',
    partyId: 'frente-verde',
    sector: 'Ambiente',
    summary:
      'Plan de transición energética, protección de cabeceras de cuenca y fiscalización de pasivos ambientales.',
  },
  {
    id: 'fvc-transparencia',
    partyId: 'frente-verde',
    sector: 'Transparencia',
    summary:
      'Plataforma abierta de seguimiento del gasto público y declaraciones juradas en línea para autoridades.',
  },
];

// 🔹 Candidatos (planchas + congresistas + parlamento andino) (RF2.2.1, 2.2.3, 2.2.4, VI, VII, X)
export const CANDIDATES: Candidate[] = [
  // APD – Placha presidencial
  {
    id: 'apd-presi',
    partyId: 'alianza-progreso',
    name: 'María Torres',
    role: 'PRESIDENTE',
    region: 'Nacional',
    bio:
      'Abogada y ex congresista con experiencia en reformas institucionales y descentralización.',
    education: 'Abogada por la Universidad Nacional, con maestría en Políticas Públicas.',
    experience:
      'Ex congresista de la República y ex viceministra de gobernanza territorial.',
    proposals: [
      'Reforma del sistema político con bicameralidad funcional.',
      'Programa de empleo joven con enfoque regional.',
      'Digitalización de servicios del Estado al 100 %.',
    ],
  },
  {
    id: 'apd-vice',
    partyId: 'alianza-progreso',
    name: 'Carlos Huamán',
    role: 'VICEPRESIDENTE',
    region: 'Nacional',
    bio:
      'Economista con experiencia en gestión pública y programas sociales focalizados.',
    education: 'Economista por la Universidad de Lima.',
    experience:
      'Ha sido director de programas sociales y consultor en organismos internacionales.',
    proposals: [
      'Fondo de apoyo a mypes con créditos blandos.',
      'Fortalecimiento de programas de alimentación escolar.',
    ],
  },
  // APD – Cámara de Diputados
  {
    id: 'apd-diputado-lima',
    partyId: 'alianza-progreso',
    name: 'Lucía Fernández',
    role: 'DIPUTADO',
    region: 'Lima',
    bio:
      'Ingeniera industrial enfocada en competitividad y mejora regulatoria.',
    education: 'Ingeniera industrial por la PUCP.',
    experience:
      'Experiencia en gestión de calidad y simplificación administrativa.',
    proposals: [
      'Simplificar trámites para la formalización de empresas.',
      'Ley de compras públicas para mypes regionales.',
    ],
  },
  // APD – Cámara de Senadores
  {
    id: 'apd-senador-norte',
    partyId: 'alianza-progreso',
    name: 'Juan Pérez',
    role: 'SENADOR',
    region: 'Macroregión Norte',
    bio:
      'Abogado especializado en derecho constitucional y descentralización.',
    education: 'Abogado por la Universidad Nacional de Trujillo.',
    experience:
      'Asesor legislativo y docente universitario en derecho público.',
    proposals: [
      'Fortalecer la representación regional en el Senado.',
      'Impulsar proyectos de infraestructura vial en el norte del país.',
    ],
  },
  // FVC – Placha presidencial
  {
    id: 'fvc-presi',
    partyId: 'frente-verde',
    name: 'Javier Rojas',
    role: 'PRESIDENTE',
    region: 'Nacional',
    bio:
      'Ambientalista y ex alcalde, promotor de proyectos de transporte sostenible.',
    education: 'Administrador con estudios en gestión ambiental.',
    experience:
      'Ex alcalde distrital y consultor en movilidad sostenible.',
    proposals: [
      'Plan nacional de transporte público eléctrico.',
      'Protección de áreas naturales y turismo sostenible.',
    ],
  },
  // FVC – Parlamento Andino
  {
    id: 'fvc-parlamento-andino',
    partyId: 'frente-verde',
    name: 'Ana Salazar',
    role: 'PARLAMENTO_ANDINO',
    region: 'Nacional',
    bio:
      'Internacionalista con experiencia en integración regional y políticas ambientales.',
    education: 'Relaciones Internacionales, especialización en integración andina.',
    experience:
      'Funcionaria en organismos regionales y coordinadora de proyectos ambientales.',
    proposals: [
      'Agenda andina para protección de glaciares.',
      'Acuerdos regionales para energías renovables.',
    ],
  },
];

// 🔹 Actividades de candidatos (RF2.3.3, VIII)
export const CANDIDATE_ACTIVITIES: CandidateActivity[] = [
  {
    id: 'act-apd-presi-1',
    candidateId: 'apd-presi',
    title: 'Mitin central en Lima',
    date: '2025-11-20T19:00:00Z',
    location: 'Plaza San Martín, Lima',
    description:
      'Presentación del plan de reactivación económica y empleo joven.',
  },
  {
    id: 'act-apd-presi-2',
    candidateId: 'apd-presi',
    title: 'Debate sobre reforma política',
    date: '2025-12-05T20:00:00Z',
    location: 'Canal Nacional',
    description:
      'Participación en debate televisado sobre reforma política y sistema de justicia.',
  },
  {
    id: 'act-fvc-presi-1',
    candidateId: 'fvc-presi',
    title: 'Foro sobre transición energética',
    date: '2025-11-25T18:30:00Z',
    location: 'Arequipa',
    description:
      'Exposición de la propuesta de transporte público eléctrico y energías renovables.',
  },
];

// 🔹 Noticias (RF2.4, IX) – algunas generales y otras por partido
export const PARTY_NEWS: PartyNews[] = [
  {
    id: 'noticia-general-1',
    title: 'JNE convoca oficialmente a Elecciones Generales 2026',
    source: 'JNE Noticias',
    summary:
      'El Jurado Nacional de Elecciones publica el cronograma oficial de las Elecciones Generales 2026.',
    publishedAt: '2025-09-15T10:00:00Z',
    url: 'https://ejemplo.com/convocatoria-elecciones-2026',
  },
  {
    id: 'noticia-apd-1',
    partyId: 'alianza-progreso',
    title: 'APD presenta plan de reactivación para mypes',
    source: 'Diario Económico',
    summary:
      'La candidata María Torres presentó un paquete de medidas orientadas a créditos, capacitación y digitalización de mypes.',
    publishedAt: '2025-10-20T10:00:00Z',
    url: 'https://ejemplo.com/noticia-apd-1',
  },
  {
    id: 'noticia-fvc-1',
    partyId: 'frente-verde',
    title: 'Frente Verde propone transición energética al 2035',
    source: 'Noticias Verdes',
    summary:
      'El movimiento plantea una hoja de ruta para reemplazar combustibles fósiles por energías renovables.',
    publishedAt: '2025-10-22T09:30:00Z',
    url: 'https://ejemplo.com/noticia-fvc-1',
  },
];
