export interface PoliticalParty {
  id: number;
  name: string;
  founder: string;
  foundationYear: number;
  ideology: string;
  politicalPosition: string;
  representation: string;
  description: string;
}

export const politicalParties: PoliticalParty[] = [
  {
    id: 1,
    name: "PARTIDO MORADO",
    founder: "Julio Guzmán",
    foundationYear: 2016,
    ideology: "Liberalism, Centrism",
    politicalPosition: "Center",
    representation: "No representation in Congress",
    description: "The Purple Party is a Peruvian political party founded in 2016 by Julio Guzmán. It is a centrist and liberal party that seeks to promote economic development and social inclusion.",
  },
  {
    id: 2,
    name: "FUERZA POPULAR",
    founder: "Keiko Fujimori",
    foundationYear: 2010,
    ideology: "Fujimorism, Conservatism",
    politicalPosition: "Right-wing",
    representation: "22 seats in Congress",
    description: "Popular Force is a Peruvian political party founded in 2010 by Keiko Fujimori, daughter of former president Alberto Fujimori. It is a right-wing and conservative party that follows the principles of Fujimorism.",
  },
  {
    id: 3,
    name: "PARTIDO SICREO",
    founder: "Unknown",
    foundationYear: 2022,
    ideology: "Unknown",
    politicalPosition: "Unknown",
    representation: "No representation in Congress",
    description: "There is no information available about this political party.",
  },
];
