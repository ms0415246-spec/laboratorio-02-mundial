"use strict";

import { fetchFromApi } from "../api/apiClient.js";

/* ======================================================
   CONFIGURACIÓN DEL SERVICIO
====================================================== */

const TEAMS_ENDPOINT = "/get/teams";

/* ======================================================
   OBTENER EQUIPOS
====================================================== */

/**
 * Obtiene la lista de equipos desde la API.
 *
 * @returns {Promise<Array>} Lista de equipos.
 */
export async function getTeams() {
  const response = await fetchFromApi(TEAMS_ENDPOINT);

  if (!response || !Array.isArray(response.teams)) {
    throw new Error(
      "La respuesta de equipos no contiene un arreglo válido."
    );
  }

  return response.teams;
}

/* ======================================================
   ORDENAR EQUIPOS
====================================================== */

/**
 * Ordena una lista de equipos alfabéticamente.
 *
 * @param {Array} teams Lista de equipos.
 * @returns {Array} Copia de la lista ordenada.
 */
export function sortTeamsByName(teams) {
  return [...teams].sort((teamA, teamB) => {
    const nameA = getTeamName(teamA);
    const nameB = getTeamName(teamB);

    return nameA.localeCompare(nameB);
  });
}

/* ======================================================
   BUSCAR EQUIPO POR ID
====================================================== */

/**
 * Busca un equipo mediante su identificador.
 *
 * @param {Array} teams Lista de equipos.
 * @param {string|number} teamId Identificador del equipo.
 * @returns {object|null} Equipo encontrado o null.
 */
export function findTeamById(teams, teamId) {
  return (
    teams.find((team) => {
      return String(team.id) === String(teamId);
    }) ?? null
  );
}

/* ======================================================
   OBTENER NOMBRE DEL EQUIPO
====================================================== */

/**
 * Devuelve el nombre disponible del equipo.
 *
 * @param {object} team Datos del equipo.
 * @returns {string} Nombre del equipo.
 */
export function getTeamName(team) {
  if (!team) {
    return "Equipo desconocido";
  }

  return (
    team.name_en
    ?? team.name
    ?? `Equipo ${team.id ?? "sin identificar"}`
  );
}

/* ======================================================
   OBTENER BANDERA DEL EQUIPO
====================================================== */

/**
 * Devuelve la dirección de la bandera disponible.
 *
 * @param {object} team Datos del equipo.
 * @returns {string} Dirección de la bandera.
 */
export function getTeamFlag(team) {
  if (!team) {
    return "";
  }

  return team.flag ?? team.flag_url ?? "";
}