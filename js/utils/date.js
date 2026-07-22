"use strict";

/* ======================================================
   CONVERTIR FECHA
====================================================== */

/**
 * Convierte un valor recibido de la API en un objeto Date.
 *
 * @param {string|number|Date} value Fecha original.
 * @returns {Date|null} Fecha válida o null.
 */
export function parseDate(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date
    ? new Date(value.getTime())
    : new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

/* ======================================================
   FORMATEAR FECHA Y HORA
====================================================== */

/**
 * Convierte una fecha a un formato legible en español.
 *
 * @param {string|number|Date} value Fecha original.
 * @returns {string} Fecha y hora formateadas.
 */
export function formatDateTime(value) {
  const date = parseDate(value);

  if (!date) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "long",
    timeStyle: "short"
  }).format(date);
}

/* ======================================================
   FORMATEAR SOLO FECHA
====================================================== */

/**
 * Devuelve únicamente la parte de la fecha.
 *
 * @param {string|number|Date} value Fecha original.
 * @returns {string} Fecha formateada.
 */
export function formatDate(value) {
  const date = parseDate(value);

  if (!date) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "long"
  }).format(date);
}

/* ======================================================
   FORMATEAR SOLO HORA
====================================================== */

/**
 * Devuelve únicamente la hora.
 *
 * @param {string|number|Date} value Fecha original.
 * @returns {string} Hora formateada.
 */
export function formatTime(value) {
  const date = parseDate(value);

  if (!date) {
    return "Hora no disponible";
  }

  return new Intl.DateTimeFormat("es-CR", {
    timeStyle: "short"
  }).format(date);
}

/* ======================================================
   OBTENER MARCA DE TIEMPO
====================================================== */

/**
 * Convierte una fecha en milisegundos para poder ordenarla.
 *
 * @param {string|number|Date} value Fecha original.
 * @param {number} fallback Valor usado cuando la fecha es inválida.
 * @returns {number} Marca de tiempo.
 */
export function getTimestamp(
  value,
  fallback = Number.MAX_SAFE_INTEGER
) {
  const date = parseDate(value);

  return date
    ? date.getTime()
    : fallback;
}

/* ======================================================
   COMPARAR FECHAS
====================================================== */

/**
 * Compara dos valores de fecha de menor a mayor.
 *
 * @param {string|number|Date} valueA Primera fecha.
 * @param {string|number|Date} valueB Segunda fecha.
 * @returns {number} Resultado compatible con Array.sort().
 */
export function compareDates(valueA, valueB) {
  return (
    getTimestamp(valueA)
    - getTimestamp(valueB)
  );
}

/* ======================================================
   VERIFICAR FECHA FUTURA
====================================================== */

/**
 * Comprueba si una fecha ocurre después del momento actual.
 *
 * @param {string|number|Date} value Fecha original.
 * @returns {boolean} true cuando la fecha es futura.
 */
export function isFutureDate(value) {
  const date = parseDate(value);

  return date
    ? date.getTime() > Date.now()
    : false;
}