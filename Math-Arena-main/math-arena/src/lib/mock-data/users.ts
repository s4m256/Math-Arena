import type { RatedUser, RatingPoint } from './types'

function history(values: number[]): RatingPoint[] {
  return values.map((rating, index) => ({
    date: `2026-${String(index + 1).padStart(2, '0')}-01`,
    rating,
  }))
}

export const users: RatedUser[] = [
  {
    id: 'u1',
    username: 'gauss',
    rating: 2540,
    contests: 18,
    maxRating: 2585,
    bio: 'Gosta de teoria dos números e problemas curtos com ideias fortes.',
    joinedAt: '2025-09-12',
    ratingHistory: history([2100, 2180, 2260, 2320, 2410, 2490, 2540]),
  },
  {
    id: 'u2',
    username: 'noether',
    rating: 2360,
    contests: 15,
    maxRating: 2390,
    bio: 'Treina principalmente álgebra e combinatória.',
    joinedAt: '2025-10-04',
    ratingHistory: history([1900, 1980, 2070, 2160, 2240, 2310, 2360]),
  },
  {
    id: 'u3',
    username: 'euler',
    rating: 2210,
    contests: 22,
    maxRating: 2275,
    bio: 'Participante frequente das rodadas de treino.',
    joinedAt: '2025-08-21',
    ratingHistory: history([1750, 1810, 1930, 2010, 2120, 2190, 2210]),
  },
  {
    id: 'u4',
    username: 'hypatia',
    rating: 1985,
    contests: 11,
    maxRating: 2010,
    bio: 'Foco em geometria e escrita clara de soluções.',
    joinedAt: '2026-01-10',
    ratingHistory: history([1500, 1580, 1700, 1810, 1900, 1985]),
  },
  {
    id: 'u5',
    username: 'fermat',
    rating: 1740,
    contests: 9,
    maxRating: 1765,
    bio: 'Resolve mais teoria dos números do que deveria.',
    joinedAt: '2026-02-02',
    ratingHistory: history([1300, 1410, 1510, 1600, 1690, 1740]),
  },
  {
    id: 'u6',
    username: 'sophie',
    rating: 1510,
    contests: 7,
    maxRating: 1530,
    bio: 'Em evolução constante nas rodadas semanais.',
    joinedAt: '2026-02-18',
    ratingHistory: history([980, 1110, 1260, 1380, 1460, 1510]),
  },
  {
    id: 'u7',
    username: 'samuel',
    rating: 1280,
    contests: 4,
    maxRating: 1280,
    bio: 'Novo competidor no MathArena.',
    joinedAt: '2026-04-03',
    ratingHistory: history([900, 1010, 1170, 1280]),
  },
  {
    id: 'u8',
    username: 'newton',
    rating: 910,
    contests: 2,
    maxRating: 910,
    bio: 'Começando a treinar com contests online.',
    joinedAt: '2026-05-01',
    ratingHistory: history([800, 910]),
  },
]

export function getUserById(id: string) {
  return users.find((user) => user.id === id)
}

export function getUserByUsername(username: string) {
  return users.find(
    (user) => user.username.toLowerCase() === username.toLowerCase()
  )
}
