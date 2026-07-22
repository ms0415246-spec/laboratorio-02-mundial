"use strict";

import { fetchFromApi } from "../api/apiClient.js";

/* ======================================================
   CONFIGURACIÓN DEL SERVICIO
====================================================== */

const GAMES_ENDPOINT = "/get/games";

/* ======================================================
   OBTENER PARTIDOS
====================================================== */

/**
 * Obtiene la lista de partidos desde la API.
 *
 * @returns {Promise<Array>} Lista de partidos.
 */
export async function getGames() {
  const response = await fetchFromApi(GAMES_ENDPOINT);

  if (!response || !Array.isArray(response.games)) {
    throw new Error(
      "La respuesta de partidos no contiene un arreglo válido."
    );
  }

  return response.games;
}

/* ======================================================
   ORDENAR PARTIDOS POR FECHA
====================================================== */

/**
 * Ordena los partidos cronológicamente mediante local_date.
 *
 * @param {Array} games Lista de partidos.
 * @returns {Array} Copia de la lista ordenada por fecha.
 */
export function sortGamesByDate(games) {
  return [...games].sort((gameA, gameB) => {
    const dateA = getGameTimestamp(gameA);
    const dateB = getGameTimestamp(gameB);

    return dateA - dateB;
  });
}

/* ======================================================
   FILTRAR PARTIDOS DE UN EQUIPO
====================================================== */

/**
 * Obtiene los partidos donde un equipo participa como
 * local o visitante.
 *
 * @param {Array} games Lista de partidos.
 * @param {string|number} teamId Identificador del equipo.
 * @returns {Array} Partidos del equipo ordenados por fecha.
 */
export function getGamesByTeam(games, teamId) {
  const teamGames = games.filter((game) => {
    const isHomeTeam =
      String(game.home_team_id) === String(teamId);

    const isAwayTeam =
      String(game.away_team_id) === String(teamId);

    return isHomeTeam || isAwayTeam;
  });

  return sortGamesByDate(teamGames);
}

/* ======================================================
   OBTENER PARTIDOS FINALIZADOS
====================================================== */

/**
 * Filtra únicamente los partidos finalizados.
 *
 * @param {Array} games Lista de partidos.
 * @returns {Array} Partidos finalizados.
 */
export function getFinishedGames(games) {
  return games.filter((game) => game.finished === true);
}

/* ======================================================
   CALCULAR DIFERENCIA DE GOLES
====================================================== */

/**
 * Calcula la diferencia absoluta de goles de un partido.
 *
 * @param {object} game Datos del partido.
 * @returns {number} Diferencia de goles.
 */
export function calculateGoalDifference(game) {
  const homeScore = Number(game.home_score ?? 0);
  const awayScore = Number(game.away_score ?? 0);

  return Math.abs(homeScore - awayScore);
}

/* ======================================================
   OBTENER GOLEADAS
====================================================== */

/**
 * Filtra partidos finalizados con diferencia de tres
 * o más goles y los ordena de mayor a menor diferencia.
 *
 * @param {Array} games Lista de partidos.
 * @param {number} minimumDifference Diferencia mínima.
 * @returns {Array} Lista de goleadas.
 */
export function getBlowoutGames(
  games,
  minimumDifference = 3
) {
  return getFinishedGames(games)
    .filter((game) => {
      return (
        calculateGoalDifference(game)
        >= minimumDifference
      );
    })
    .sort((gameA, gameB) => {
      return (
        calculateGoalDifference(gameB)
        - calculateGoalDifference(gameA)
      );
    });
}

/* ======================================================
   OBTENER PARTIDOS EMPATADOS
====================================================== */

/**
 * Filtra partidos finalizados cuyo marcador terminó empatado.
 *
 * @param {Array} games Lista de partidos.
 * @returns {Array} Partidos empatados.
 */
export function getDrawGames(games) {
  return getFinishedGames(games).filter((game) => {
    const homeScore = Number(game.home_score);
    const awayScore = Number(game.away_score);

    return homeScore === awayScore;
  });
}

/* ======================================================
   AGRUPAR EMPATES POR GRUPO
====================================================== */

/**
 * Agrupa los partidos empatados según su grupo.
 *
 * @param {Array} games Lista de partidos.
 * @returns {object} Empates agrupados por letra.
 */
export function groupDrawsByGroup(games) {
  const drawGames = getDrawGames(games);

  return drawGames.reduce((groups, game) => {
    const groupName = game.group ?? "Sin grupo";

    if (!groups[groupName]) {
      groups[groupName] = [];
    }

    groups[groupName].push(game);

    return groups;
  }, {});
}

/* ======================================================
   BUSCAR EL PRÓXIMO PARTIDO DE UN EQUIPO
====================================================== */

/**
 * Busca el próximo partido no finalizado de un equipo.
 *
 * @param {Array} games Lista de partidos.
 * @param {string|number} teamId Identificador del equipo.
 * @returns {object|null} Próximo partido o null.
 */
export function getNextGameByTeam(games, teamId) {
  const pendingGames = games.filter((game) => {
    const isHomeTeam =
      String(game.home_team_id) === String(teamId);

    const isAwayTeam =
      String(game.away_team_id) === String(teamId);

    return (
      game.finished === false
      && (isHomeTeam || isAwayTeam)
    );
  });

  return sortGamesByDate(pendingGames)[0] ?? null;
}

/* ======================================================
   OBTENER RIVAL DE UN EQUIPO
====================================================== */

/**
 * Obtiene el identificador del rival en un partido.
 *
 * @param {object} game Datos del partido.
 * @param {string|number} teamId Identificador del equipo.
 * @returns {string|number|null} Identificador del rival.
 */
export function getOpponentTeamId(game, teamId) {
  if (!game) {
    return null;
  }

  if (
    String(game.home_team_id)
    === String(teamId)
  ) {
    return game.away_team_id ?? null;
  }

  if (
    String(game.away_team_id)
    === String(teamId)
  ) {
    return game.home_team_id ?? null;
  }

  return null;
}

/* ======================================================
   CONTAR PARTIDOS POR ESTADIO
====================================================== */

/**
 * Cuenta cuántos partidos están asociados a un estadio.
 *
 * @param {Array} games Lista de partidos.
 * @param {string|number} stadiumId Identificador del estadio.
 * @returns {number} Cantidad de partidos.
 */
export function countGamesByStadium(
  games,
  stadiumId
) {
  return games.filter((game) => {
    return (
      String(game.stadium_id)
      === String(stadiumId)
    );
  }).length;
}

/* ======================================================
   CONVERTIR FECHA A MARCA DE TIEMPO
====================================================== */

/**
 * Convierte local_date en una marca de tiempo numérica.
 *
 * @param {object} game Datos del partido.
 * @returns {number} Marca de tiempo.
 */
function getGameTimestamp(game) {
  const timestamp = new Date(
    game.local_date ?? ""
  ).getTime();

  return Number.isNaN(timestamp)
    ? Number.MAX_SAFE_INTEGER
    : timestamp;
}