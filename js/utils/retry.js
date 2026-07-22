"use strict";

/* ======================================================
   CONFIGURACIÓN DE REINTENTOS
====================================================== */

const DEFAULT_MAX_ATTEMPTS = 4;
const DEFAULT_BASE_DELAY = 1000;

/* ======================================================
   ESPERA
====================================================== */

/**
 * Detiene la ejecución durante una cantidad de milisegundos.
 *
 * @param {number} milliseconds Tiempo de espera.
 * @returns {Promise<void>}
 */
export function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

/* ======================================================
   CALCULAR RETRASO
====================================================== */

/**
 * Calcula el tiempo de espera usando backoff exponencial.
 *
 * Intento 0: 1 segundo.
 * Intento 1: 2 segundos.
 * Intento 2: 4 segundos.
 * Intento 3: 8 segundos.
 *
 * @param {number} attempt Número del intento.
 * @param {number} baseDelay Tiempo inicial.
 * @returns {number} Tiempo de espera en milisegundos.
 */
export function calculateBackoffDelay(
  attempt,
  baseDelay = DEFAULT_BASE_DELAY
) {
  return baseDelay * (2 ** attempt);
}

/* ======================================================
   VERIFICAR ERROR REINTENTABLE
====================================================== */

/**
 * Determina si una solicitud debe volver a intentarse.
 *
 * @param {Error} error Error recibido.
 * @returns {boolean}
 */
export function isRetryableError(error) {
  return (
    error?.status === 429
    || error?.status === 500
    || error?.status === 502
    || error?.status === 503
  );
}

/* ======================================================
   EJECUTAR CON REINTENTOS
====================================================== */

/**
 * Ejecuta una operación y la reintenta con backoff exponencial.
 *
 * @param {Function} operation Función asíncrona.
 * @param {object} options Configuración.
 * @param {number} [options.maxAttempts=4] Cantidad máxima.
 * @param {number} [options.baseDelay=1000] Espera inicial.
 * @param {Function|null} [options.onRetry=null] Evento de reintento.
 * @returns {Promise<*>} Resultado de la operación.
 */
export async function executeWithRetry(
  operation,
  {
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    baseDelay = DEFAULT_BASE_DELAY,
    onRetry = null
  } = {}
) {
  let lastError = null;

  for (
    let attempt = 0;
    attempt < maxAttempts;
    attempt += 1
  ) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      const isLastAttempt =
        attempt === maxAttempts - 1;

      if (
        !isRetryableError(error)
        || isLastAttempt
      ) {
        throw error;
      }

      const delay = calculateBackoffDelay(
        attempt,
        baseDelay
      );

      if (typeof onRetry === "function") {
        await onRetry({
          attempt: attempt + 1,
          delay,
          status: error.status
        });
      }

      await wait(delay);
    }
  }

  throw lastError;
}

/* ======================================================
   CUENTA REGRESIVA
====================================================== */

/**
 * Ejecuta una cuenta regresiva en segundos.
 *
 * @param {number} milliseconds Tiempo total.
 * @param {Function} onTick Función ejecutada por segundo.
 */
export async function runCountdown(
  milliseconds,
  onTick
) {
  const totalSeconds = Math.ceil(
    milliseconds / 1000
  );

  for (
    let seconds = totalSeconds;
    seconds > 0;
    seconds -= 1
  ) {
    if (typeof onTick === "function") {
      onTick(seconds);
    }

    await wait(1000);
  }
}