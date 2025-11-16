// constants/electors.ts

export type PollingPlace = {
  id: string;
  name: string;
  address: string;
  district: string;
  province: string;
  lat: number;
  lon: number;
};

export type TableLocation = {
  mesa: string;
  pollingPlaceId: string;
  aula: string;
  piso: string;     // "1", "2", "3"
  pabellon: string; // "A", "B", etc.
};

export type Elector = {
  id: string; // puede ser DNI o código de elector
  fullName: string;
  mesa: string;
};

export const POLLING_PLACES: PollingPlace[] = [
  {
    id: 'loc1',
    name: 'IE 1234 José María Arguedas',
    address: 'Av. Los Próceres 123',
    district: 'San Juan de Lurigancho',
    province: 'Lima',
    lat: -12.012345,
    lon: -77.001234,
  },
  {
    id: 'loc2',
    name: 'Colegio Nacional Miguel Grau',
    address: 'Jr. La Unión 456',
    district: 'Cercado de Lima',
    province: 'Lima',
    lat: -12.046374,
    lon: -77.042793,
  },
];

export const TABLE_LOCATIONS: TableLocation[] = [
  {
    mesa: '042356',
    pollingPlaceId: 'loc1',
    aula: '203',
    piso: '2',
    pabellon: 'B',
  },
  {
    mesa: '078901',
    pollingPlaceId: 'loc2',
    aula: '105',
    piso: '1',
    pabellon: 'A',
  },
];

export const ELECTORS: Elector[] = [
  {
    id: '12345678', // DNI de ejemplo
    fullName: 'María Torres Huamán',
    mesa: '042356',
  },
  {
    id: '87654321',
    fullName: 'Javier Rojas Pérez',
    mesa: '078901',
  },
];
