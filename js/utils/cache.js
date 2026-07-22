"use strict";

/* ======================================================
   CONFIGURACIÓN DEL CACHÉ
====================================================== */

const CACHE_PREFIX = "worldcup26_";

/* Tiempo máximo recomendado para considerar recientes
   los datos almacenados: 24 horas */
const DEFAULT_MAX_AGE = 24 * 60 * 60 * 1000;

/* ======================================================
   CREAR CLAVE DE ALMACENAMIENTO
====================================================== */

/**
 * Construye la clave utilizada en localStorage.
 *
 * @param {string} key Nombre del recurso.
 * @returns {string} Clave completa.
 */
function createCacheKey(key) {
  return `${CACHE_PREFIX}${key}`;
}

/* ======================================================
   GUARDAR DATOS
====================================================== */

/**
 * Guarda datos en localStorage junto con la fecha.
 *
 * @param {string} key Nombre del recurso.
 * @param {*} data Datos que se almacenarán.
 * @returns {boolean} true si se guardaron correctamente.
 */
export function saveCache(key, data) {
  try {
    const cacheEntry = {
      data,
      savedAt: Date.now()
    };

    localStorage.setItem(
      createCacheKey(key),
      JSON.stringify(cacheEntry)
    );

    return true;
  } catch (error) {
    console.error(
      `No fue posible guardar el caché de ${key}:`,
      error
    );

    return false;
  }
}

/* ======================================================
   OBTENER DATOS
====================================================== */

/**
 * Recupera los datos almacenados de un recurso.
 *
 * @param {string} key Nombre del recurso.
 * @returns {*|null} Datos almacenados o null.
 */
export function getCache(key) {
  try {
    const storedValue = localStorage.getItem(
      createCacheKey(key)
    );

    if (!storedValue) {
      return null;
    }

    const cacheEntry = JSON.parse(storedValue);

    if (
      !cacheEntry
      || !Object.hasOwn(cacheEntry, "data")
    ) {
      removeCache(key);
      return null;
    }

    return cacheEntry.data;
  } catch (error) {
    console.error(
      `No fue posible leer el caché de ${key}:`,
      error
    );

    removeCache(key);

    return null;
  }
}

/* ======================================================
   OBTENER ENTRADA COMPLETA
====================================================== */

/**
 * Recupera los datos y la fecha de almacenamiento.
 *
 * @param {string} key Nombre del recurso.
 * @returns {object|null} Entrada de caché.
 */
export function getCacheEntry(key) {
  try {
    const storedValue = localStorage.getItem(
      createCacheKey(key)
    );

    if (!storedValue) {
      return null;
    }

    const cacheEntry = JSON.parse(storedValue);

    if (
      !cacheEntry
      || !Object.hasOwn(cacheEntry, "data")
      || !Number.isFinite(cacheEntry.savedAt)
    ) {
      removeCache(key);
      return null;
    }

    return cacheEntry;
  } catch (error) {
    console.error(
      `No fue posible leer la entrada de caché de ${key}:`,
      error
    );

    removeCache(key);

    return null;
  }
}

/* ======================================================
   VERIFICAR SI EXISTE CACHÉ
====================================================== */

/**
 * Comprueba si existe información almacenada.
 *
 * @param {string} key Nombre del recurso.
 * @returns {boolean} true si existe.
 */
export function hasCache(key) {
  return localStorage.getItem(
    createCacheKey(key)
  ) !== null;
}

/* ======================================================
   VERIFICAR ANTIGÜEDAD
====================================================== */

/**
 * Comprueba si los datos almacenados siguen dentro
 * del tiempo máximo permitido.
 *
 * @param {string} key Nombre del recurso.
 * @param {number} maxAge Tiempo máximo en milisegundos.
 * @returns {boolean} true si el caché es reciente.
 */
export function isCacheFresh(
  key,
  maxAge = DEFAULT_MAX_AGE
) {
  const cacheEntry = getCacheEntry(key);

  if (!cacheEntry) {
    return false;
  }

  const cacheAge =
    Date.now() - cacheEntry.savedAt;

  return cacheAge <= maxAge;
}

/* ======================================================
   OBTENER EDAD DEL CACHÉ
====================================================== */

/**
 * Devuelve cuánto tiempo ha pasado desde que se guardaron
 * los datos.
 *
 * @param {string} key Nombre del recurso.
 * @returns {number|null} Edad en milisegundos.
 */
export function getCacheAge(key) {
  const cacheEntry = getCacheEntry(key);

  if (!cacheEntry) {
    return null;
  }

  return Date.now() - cacheEntry.savedAt;
}

/* ======================================================
   ELIMINAR UN RECURSO
====================================================== */

/**
 * Elimina un recurso almacenado.
 *
 * @param {string} key Nombre del recurso.
 */
export function removeCache(key) {
  localStorage.removeItem(
    createCacheKey(key)
  );
}

/* ======================================================
   LIMPIAR TODO EL CACHÉ DE LA APLICACIÓN
====================================================== */

/**
 * Elimina únicamente las claves pertenecientes
 * a esta aplicación.
 */
export function clearAppCache() {
  const keysToRemove = [];

  for (
    let index = 0;
    index < localStorage.length;
    index += 1
  ) {
    const key = localStorage.key(index);

    if (key?.startsWith(CACHE_PREFIX)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });
}

/* ======================================================
   CLAVES DISPONIBLES
====================================================== */

export const CACHE_KEYS = {
  TEAMS: "teams",
  GAMES: "games",
  STADIUMS: "stadiums",
  GROUPS: "groups"
};