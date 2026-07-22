"use strict";

import { fetchFromApi } from "../api/apiClient.js";

/* ======================================================
   CONFIGURACIÓN DEL SERVICIO
====================================================== */

const STADIUMS_ENDPOINT = "/get/stadiums";

/* ======================================================
   OBTENER ESTADIOS
====================================================== */

/**
 * Obtiene la lista de estadios desde la API.
 *
 * @returns {Promise<Array>} Lista de estadios.
 */
export async function getStadiums() {
  const response = await fetchFromApi(STADIUMS_ENDPOINT);

  if (!response || !Array.isArray(response.stadiums)) {
    throw new Error(
      "La respuesta de estadios no contiene un arreglo válido."
    );
  }

  return response.stadiums;
}

/* ======================================================
   BUSCAR ESTADIO POR ID
====================================================== */

/**
 * Busca un estadio mediante su identificador.
 *
 * @param {Array} stadiums Lista de estadios.
 * @param {string|number} stadiumId Identificador del estadio.
 * @returns {object|null} Estadio encontrado o null.
 */
export function findStadiumById(
  stadiums,
  stadiumId
) {
  return (
    stadiums.find((stadium) => {
      return (
        String(stadium.id)
        === String(stadiumId)
      );
    }) ?? null
  );
}

/* ======================================================
   OBTENER NOMBRE DEL ESTADIO
====================================================== */

/**
 * Devuelve el nombre disponible del estadio.
 *
 * @param {object} stadium Datos del estadio.
 * @returns {string} Nombre del estadio.
 */
export function getStadiumName(stadium) {
  if (!stadium) {
    return "Estadio no disponible";
  }

  return (
    stadium.name_en
    ?? stadium.name
    ?? `Estadio ${stadium.id ?? "sin identificar"}`
  );
}

/* ======================================================
   OBTENER CIUDAD DEL ESTADIO
====================================================== */

/**
 * Devuelve la ciudad disponible del estadio.
 *
 * @param {object} stadium Datos del estadio.
 * @returns {string} Ciudad del estadio.
 */
export function getStadiumCity(stadium) {
  if (!stadium) {
    return "Ciudad no disponible";
  }

  return (
    stadium.city_en
    ?? stadium.city
    ?? "Ciudad no disponible"
  );
}

/* ======================================================
   OBTENER PAÍS DEL ESTADIO
====================================================== */

/**
 * Devuelve el país disponible del estadio.
 *
 * @param {object} stadium Datos del estadio.
 * @returns {string} País del estadio.
 */
export function getStadiumCountry(stadium) {
  if (!stadium) {
    return "País no disponible";
  }

  return (
    stadium.country_en
    ?? stadium.country
    ?? "País no disponible"
  );
}

/* ======================================================
   OBTENER CAPACIDAD DEL ESTADIO
====================================================== */

/**
 * Devuelve la capacidad numérica del estadio.
 *
 * @param {object} stadium Datos del estadio.
 * @returns {number} Capacidad del estadio.
 */
export function getStadiumCapacity(stadium) {
  if (!stadium) {
    return 0;
  }

  const capacity = Number(stadium.capacity ?? 0);

  return Number.isNaN(capacity)
    ? 0
    : capacity;
}

/* ======================================================
   FORMATEAR CAPACIDAD
====================================================== */

/**
 * Formatea la capacidad para mostrar separadores de miles.
 *
 * @param {object} stadium Datos del estadio.
 * @returns {string} Capacidad formateada.
 */
export function formatStadiumCapacity(stadium) {
  const capacity = getStadiumCapacity(stadium);

  if (capacity === 0) {
    return "Capacidad no disponible";
  }

  return new Intl.NumberFormat("es-CR").format(capacity);
}

/* ======================================================
   OBTENER CIUDADES DISTINTAS
====================================================== */

/**
 * Obtiene una lista sin ciudades repetidas a partir
 * de una colección de estadios.
 *
 * @param {Array} stadiums Lista de estadios.
 * @returns {Array<string>} Ciudades distintas ordenadas.
 */
export function getDistinctStadiumCities(stadiums) {
  const cities = stadiums
    .map((stadium) => getStadiumCity(stadium))
    .filter((city) => {
      return city !== "Ciudad no disponible";
    });

  return [...new Set(cities)].sort((cityA, cityB) => {
    return cityA.localeCompare(cityB);
  });
}

/* ======================================================
   CALCULAR ASISTENCIA POTENCIAL
====================================================== */

/**
 * Calcula la asistencia potencial de un estadio.
 *
 * @param {object} stadium Datos del estadio.
 * @param {number} gamesCount Cantidad de partidos.
 * @returns {number} Asistencia potencial.
 */
export function calculatePotentialAttendance(
  stadium,
  gamesCount
) {
  const capacity = getStadiumCapacity(stadium);
  const totalGames = Number(gamesCount ?? 0);

  return capacity * totalGames;
}

/* ======================================================
   CREAR ANALÍTICA DE ESTADIOS
====================================================== */

/**
 * Combina los estadios con la cantidad de partidos
 * y calcula la asistencia potencial de cada uno.
 *
 * @param {Array} stadiums Lista de estadios.
 * @param {Array} games Lista de partidos.
 * @returns {Array} Estadios con datos analíticos.
 */
export function createStadiumAnalytics(
  stadiums,
  games
) {
  return stadiums
    .map((stadium) => {
      const gamesCount = games.filter((game) => {
        return (
          String(game.stadium_id)
          === String(stadium.id)
        );
      }).length;

      const potentialAttendance =
        calculatePotentialAttendance(
          stadium,
          gamesCount
        );

      return {
        ...stadium,
        gamesCount,
        potentialAttendance
      };
    })
    .sort((stadiumA, stadiumB) => {
      return (
        stadiumB.potentialAttendance
        - stadiumA.potentialAttendance
      );
    });
}