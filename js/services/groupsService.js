"use strict";

import { fetchFromApi } from "../api/apiClient.js";

/* ======================================================
   CONFIGURACIÓN DEL SERVICIO
====================================================== */

const GROUPS_ENDPOINT = "/get/groups";

/* ======================================================
   OBTENER GRUPOS
====================================================== */

/**
 * Obtiene la lista de grupos desde la API.
 *
 * @returns {Promise<Array>} Lista de grupos.
 */
export async function getGroups() {
  const response = await fetchFromApi(GROUPS_ENDPOINT);

  if (!response || !Array.isArray(response.groups)) {
    throw new Error(
      "La respuesta de grupos no contiene un arreglo válido."
    );
  }

  return response.groups;
}

/* ======================================================
   OBTENER EQUIPOS DE UN GRUPO
====================================================== */

/**
 * Extrae los equipos contenidos dentro de un grupo.
 *
 * @param {object} group Datos del grupo.
 * @returns {Array} Equipos del grupo.
 */
export function getTeamsFromGroup(group) {
  if (!group) {
    return [];
  }

  if (Array.isArray(group.teams)) {
    return group.teams;
  }

  if (Array.isArray(group.standings)) {
    return group.standings;
  }

  return [];
}

/* ======================================================
   EXTRAER TODOS LOS REGISTROS DE EQUIPOS
====================================================== */

/**
 * Recorre todos los grupos y genera una lista plana con
 * la información disponible de cada equipo.
 *
 * @param {Array} groups Lista de grupos.
 * @returns {Array} Registros de equipos.
 */
export function flattenGroupTeams(groups) {
  if (!Array.isArray(groups)) {
    return [];
  }

  return groups.flatMap((group) => {
    const groupTeams = getTeamsFromGroup(group);

    return groupTeams.map((teamRecord) => ({
      ...teamRecord,
      groupName:
        group.name
        ?? group.group
        ?? group.letter
        ?? "Sin grupo"
    }));
  });
}

/* ======================================================
   OBTENER ID DEL EQUIPO
====================================================== */

/**
 * Obtiene el identificador del equipo desde un registro
 * perteneciente a un grupo.
 *
 * @param {object} teamRecord Registro del equipo.
 * @returns {string|number|null} Identificador del equipo.
 */
export function getGroupTeamId(teamRecord) {
  if (!teamRecord) {
    return null;
  }

  return (
    teamRecord.team_id
    ?? teamRecord.id
    ?? teamRecord.team?.id
    ?? null
  );
}

/* ======================================================
   OBTENER GOLES RECIBIDOS
====================================================== */

/**
 * Obtiene la cantidad de goles recibidos por un equipo.
 *
 * @param {object} teamRecord Registro del equipo.
 * @returns {number} Goles recibidos.
 */
export function getGoalsAgainst(teamRecord) {
  if (!teamRecord) {
    return 0;
  }

  const value =
    teamRecord.goals_against
    ?? teamRecord.goal_against
    ?? teamRecord.ga
    ?? teamRecord.goalsAgainst
    ?? 0;

  const goalsAgainst = Number(value);

  return Number.isNaN(goalsAgainst)
    ? 0
    : goalsAgainst;
}

/* ======================================================
   CREAR RANKING DEFENSIVO
====================================================== */

/**
 * Ordena los equipos por menor cantidad de goles recibidos
 * y devuelve los primeros resultados.
 *
 * @param {Array} groups Lista de grupos.
 * @param {number} limit Cantidad máxima de equipos.
 * @returns {Array} Ranking defensivo.
 */
export function createDefensiveRanking(
  groups,
  limit = 5
) {
  return flattenGroupTeams(groups)
    .filter((teamRecord) => {
      return getGroupTeamId(teamRecord) !== null;
    })
    .sort((teamA, teamB) => {
      const goalsA = getGoalsAgainst(teamA);
      const goalsB = getGoalsAgainst(teamB);

      if (goalsA !== goalsB) {
        return goalsA - goalsB;
      }

      const nameA = String(
        teamA.name
        ?? teamA.team_name
        ?? teamA.team?.name
        ?? ""
      );

      const nameB = String(
        teamB.name
        ?? teamB.team_name
        ?? teamB.team?.name
        ?? ""
      );

      return nameA.localeCompare(nameB);
    })
    .slice(0, limit);
}