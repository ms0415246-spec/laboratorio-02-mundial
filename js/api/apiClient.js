"use strict";

import {
  executeWithRetry
} from "../utils/retry.js";

/* ======================================================
   CONFIGURACIÓN DE LA API
====================================================== */

const BASE_URL = "https://worldcup26.ir";

/* Tiempo máximo de espera por petición: 15 segundos */
const REQUEST_TIMEOUT = 15000;

/* ======================================================
   MANEJADOR VISUAL DE REINTENTOS
====================================================== */

let retryHandler = null;

/**
 * Registra la función que informará los reintentos
 * en la interfaz.
 *
 * @param {Function} handler Función de notificación.
 */
export function configureRetryHandler(handler) {
  retryHandler =
    typeof handler === "function"
      ? handler
      : null;
}

/* ======================================================
   ERROR PERSONALIZADO DE LA API
====================================================== */

/**
 * Representa un error producido durante una petición HTTP.
 */
export class ApiError extends Error {
  /**
   * @param {string} message Mensaje descriptivo del error.
   * @param {number} status Código de estado HTTP.
   * @param {string} endpoint Endpoint que produjo el error.
   */
  constructor(message, status, endpoint) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.endpoint = endpoint;
  }
}

/* ======================================================
   SOLICITUD GENERAL A LA API
====================================================== */

/**
 *  Realiza una petición individual a un endpoint
 *  y devuelve la respuesta en formato JSON.
 * @param {string} endpoint Ruta del endpoint, por ejemplo: /get/teams.
 * @returns {Promise<object>} Datos obtenidos de la API.
 * @throws {ApiError} Cuando ocurre un error HTTP, de red o de formato.
 */
async function performRequest(endpoint) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new ApiError(
        createHttpErrorMessage(response.status),
        response.status,
        endpoint
      );
    }

    const data = await response.json();

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === "AbortError") {
      throw new ApiError(
        "La petición superó el tiempo máximo de espera.",
        408,
        endpoint
      );
    }

    throw new ApiError(
      "No fue posible conectar con la API.",
      0,
      endpoint
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

/* ======================================================
   SOLICITUD CON REINTENTOS
====================================================== */

/**
 * Consulta un endpoint y aplica backoff exponencial
 * cuando recibe errores reintentables.
 *
 * @param {string} endpoint Endpoint solicitado.
 * @returns {Promise<object>} Respuesta de la API.
 */
export async function fetchFromApi(endpoint) {
  return executeWithRetry(
    () => performRequest(endpoint),
    {
      maxAttempts: 4,
      baseDelay: 1000,

      onRetry: async ({
        attempt,
        delay,
        status
      }) => {
        console.warn(
          `Reintento ${attempt} para ${endpoint} `
          + `en ${delay / 1000} segundos. `
          + `Estado HTTP: ${status}.`
        );

        if (retryHandler) {
          await retryHandler({
            endpoint,
            attempt,
            delay,
            status
          });
        }
      }
    }
  );
}

/* ======================================================
   MENSAJES SEGÚN EL ESTADO HTTP
====================================================== */

/**
 * Devuelve un mensaje comprensible según el código HTTP.
 *
 * @param {number} status Código de estado HTTP.
 * @returns {string} Mensaje descriptivo.
 */
function createHttpErrorMessage(status) {
  const errorMessages = {
    400: "La solicitud enviada no es válida.",
    404: "El recurso solicitado no fue encontrado.",
    408: "La petición tardó demasiado tiempo.",
    429: "Se alcanzó el límite de solicitudes de la API.",
    500: "La API presentó un error interno.",
    502: "La API recibió una respuesta inválida.",
    503: "La API no está disponible temporalmente."
  };

  return (
    errorMessages[status]
    ?? `La API respondió con el estado HTTP ${status}.`
  );
}

/* ======================================================
   INFORMACIÓN DE CONFIGURACIÓN
====================================================== */

/**
 * Devuelve la dirección principal de la API.
 *
 * @returns {string} URL base.
 */
export function getBaseUrl() {
  return BASE_URL;
}