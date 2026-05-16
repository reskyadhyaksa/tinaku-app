export type RiskStatus = 'KRR' | 'KRT' | 'KRST';

export interface Bumil {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number]; // [latitude, longitude]
  riskStatus: RiskStatus;
  hpl: string; // YYYY-MM-DD
  missedCheckup: boolean;
  age: number;
}

export const mockBumilData: Bumil[] = [
  {
    id: '1',
    name: 'Siti Aminah',
    address: 'Jl. Merdeka No. 12, Kel. Suka Maju',
    coordinates: [-6.200000, 106.816666], // Central Jakarta area mock
    riskStatus: 'KRR',
    hpl: '2026-08-15',
    missedCheckup: false,
    age: 28,
  },
  {
    id: '2',
    name: 'Budi Wahyuni',
    address: 'Jl. Kebon Jeruk No. 5, Kel. Suka Maju',
    coordinates: [-6.210000, 106.820000],
    riskStatus: 'KRT',
    hpl: '2026-06-01',
    missedCheckup: false,
    age: 35,
  },
  {
    id: '3',
    name: 'Dewi Lestari',
    address: 'Jl. Sudirman No. 45, Kel. Suka Maju',
    coordinates: [-6.195000, 106.825000],
    riskStatus: 'KRST',
    hpl: '2026-05-20', // Close to current date (May 16)
    missedCheckup: true,
    age: 40,
  },
  {
    id: '4',
    name: 'Ayu Wandira',
    address: 'Jl. Gatot Subroto No. 10, Kel. Suka Maju',
    coordinates: [-6.205000, 106.810000],
    riskStatus: 'KRR',
    hpl: '2026-09-10',
    missedCheckup: false,
    age: 24,
  },
  {
    id: '5',
    name: 'Rina Nose',
    address: 'Jl. Thamrin No. 88, Kel. Suka Maju',
    coordinates: [-6.215000, 106.830000],
    riskStatus: 'KRT',
    hpl: '2026-05-25', // Close to current date
    missedCheckup: true,
    age: 32,
  },
  {
    id: '6',
    name: 'Putri Titian',
    address: 'Jl. Ahmad Yani No. 1, Kel. Suka Maju',
    coordinates: [-6.190000, 106.815000],
    riskStatus: 'KRST',
    hpl: '2026-07-05',
    missedCheckup: false,
    age: 38,
  },
];
