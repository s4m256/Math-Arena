import type { Problem } from './types'

export const problems: Problem[] = [
  {
    id: 'geo-1-a',
    contestId: 'geometry-round-1',
    index: 'A',
    title: 'Angulos em uma configuracao ciclica',
    statement:
      'Seja ABC um triangulo acutangulo e seja Gamma seu circuncirculo. Pontos D e E estao nos lados AB e AC. Prove uma condicao necessaria e suficiente para que B, C, D e E sejam conciclicos.',
    points: 7,
    submissions: 29,
  },
  {
    id: 'geo-1-b',
    contestId: 'geometry-round-1',
    index: 'B',
    title: 'Medianas e cevianas',
    statement:
      'Em um triangulo ABC, cevianas partem de A e B e se intersectam em P. Determine uma relacao entre areas que caracterize quando CP e mediana.',
    points: 7,
    submissions: 24,
  },
  {
    id: 'geo-1-c',
    contestId: 'geometry-round-1',
    index: 'C',
    title: 'Inversao e tangencias',
    statement:
      'Duas circunferencias sao tangentes externamente. Uma reta comum toca ambas em pontos distintos. Prove uma identidade envolvendo os raios e a distancia entre os pontos de tangencia.',
    points: 7,
    submissions: 17,
  },
  {
    id: 'geo-1-d',
    contestId: 'geometry-round-1',
    index: 'D',
    title: 'Colinearidade em quadrilatero completo',
    statement:
      'Considere um quadrilatero completo. Prove que tres pontos definidos por intersecoes de polares sao colineares.',
    points: 7,
    submissions: 9,
  },
  {
    id: 'sel-2026-a',
    contestId: 'mock-selection-2026',
    index: 'A',
    title: 'Soma com restricao quadratica',
    statement:
      'Se a, b e c sao reais positivos com a+b+c=1, prove uma desigualdade otima envolvendo a^2+b^2+c^2.',
    points: 10,
    submissions: 0,
  },
  {
    id: 'sel-2026-b',
    contestId: 'mock-selection-2026',
    index: 'B',
    title: 'Coloracao sem monocromaticos',
    statement:
      'Determine o maior n para o qual e possivel colorir certos subconjuntos sem criar uma configuracao monocromatica proibida.',
    points: 10,
    submissions: 0,
  },
  {
    id: 'nt-sprint-a',
    contestId: 'number-theory-sprint',
    index: 'A',
    title: 'Congruencia quadratica',
    statement: 'Encontre todos os inteiros n tais que n^2+n+1 e divisivel por 7.',
    points: 7,
    submissions: 51,
    solved: true,
  },
  {
    id: 'mock-obm-1-a',
    contestId: 'mock-obm-1',
    index: 'A',
    title: 'Desigualdade elementar',
    statement:
      'Se a, b, c sao reais positivos com a+b+c=1, prove que a^2+b^2+c^2 >= 1/3.',
    points: 7,
    submissions: 12,
  },
  {
    id: 'geometry-night-a',
    contestId: 'geometry-night',
    index: 'A',
    title: 'Concorrencia de medianas',
    statement:
      'Em um triangulo ABC, prove que as medianas se intersectam em um unico ponto.',
    points: 7,
    submissions: 15,
    solved: true,
  },
]

export function getProblemsByContest(contestId: string) {
  return problems.filter((problem) => problem.contestId === contestId)
}
