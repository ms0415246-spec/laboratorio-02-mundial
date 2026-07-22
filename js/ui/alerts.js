"use strict";

/* ======================================================
   TIPOS DE ALERTA
====================================================== */

const ALERT_TYPES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
  OFFLINE: "offline"
};

/* ======================================================
   CONFIGURACIÓN VISUAL
====================================================== */

const ALERT_CONFIG = {
  info: {
    icon: "ℹ️",
    title: "Información"
  },

  success: {
    icon: "✅",
    title: "Proceso completado"
  },

  warning: {
    icon: "⚠️",
    title: "Advertencia"
  },

  error: {
    icon: "❌",
    title: "Ocurrió un error"
  },

  offline: {
    icon: "📦",
    title: "Datos almacenados"
  }
};

/* ======================================================
   MOSTRAR ALERTA
====================================================== */

/**
 * Muestra un mensaje visual dentro del contenedor indicado.
 *
 * @param {HTMLElement} container Contenedor de la alerta.
 * @param {object} options Configuración del mensaje.
 * @param {string} options.message Texto principal.
 * @param {string} [options.type="info"] Tipo de alerta.
 * @param {string} [options.title] Título personalizado.
 * @param {boolean} [options.dismissible=false] Permite cerrar la alerta.
 * @param {number|null} [options.autoHide=null] Tiempo en milisegundos.
 */
export function showAlert(
  container,
  {
    message,
    type = ALERT_TYPES.INFO,
    title,
    dismissible = false,
    autoHide = null
  }
) {
  if (!(container instanceof HTMLElement)) {
    return;
  }

  const selectedConfig =
    ALERT_CONFIG[type] ?? ALERT_CONFIG.info;

  const alertElement = document.createElement("div");

  alertElement.className = [
    "app-alert",
    `app-alert--${type}`
  ].join(" ");

  alertElement.setAttribute("role", "status");
  alertElement.setAttribute("aria-live", "polite");

  alertElement.innerHTML = `
    <span
      class="app-alert__icon"
      aria-hidden="true"
    >
      ${selectedConfig.icon}
    </span>

    <div class="app-alert__content">
      <strong class="app-alert__title">
        ${title ?? selectedConfig.title}
      </strong>

      <p class="app-alert__message">
        ${message}
      </p>
    </div>

    ${
      dismissible
        ? `
          <button
            class="app-alert__close"
            type="button"
            aria-label="Cerrar mensaje"
          >
            ×
          </button>
        `
        : ""
    }
  `;

  container.innerHTML = "";
  container.appendChild(alertElement);

  if (dismissible) {
    const closeButton = alertElement.querySelector(
      ".app-alert__close"
    );

    closeButton.addEventListener("click", () => {
      clearAlert(container);
    });
  }

  if (
    Number.isFinite(autoHide)
    && autoHide > 0
  ) {
    window.setTimeout(() => {
      if (container.contains(alertElement)) {
        clearAlert(container);
      }
    }, autoHide);
  }
}

/* ======================================================
   ALERTA DE INFORMACIÓN
====================================================== */

/**
 * Muestra una alerta informativa.
 *
 * @param {HTMLElement} container Contenedor de la alerta.
 * @param {string} message Mensaje.
 */
export function showInfoAlert(container, message) {
  showAlert(container, {
    message,
    type: ALERT_TYPES.INFO
  });
}

/* ======================================================
   ALERTA DE ÉXITO
====================================================== */

/**
 * Muestra una alerta de éxito.
 *
 * @param {HTMLElement} container Contenedor de la alerta.
 * @param {string} message Mensaje.
 */
export function showSuccessAlert(container, message) {
  showAlert(container, {
    message,
    type: ALERT_TYPES.SUCCESS,
    autoHide: 4500
  });
}

/* ======================================================
   ALERTA DE ADVERTENCIA
====================================================== */

/**
 * Muestra una alerta de advertencia.
 *
 * @param {HTMLElement} container Contenedor de la alerta.
 * @param {string} message Mensaje.
 */
export function showWarningAlert(
  container,
  message
) {
  showAlert(container, {
    message,
    type: ALERT_TYPES.WARNING,
    dismissible: true
  });
}

/* ======================================================
   ALERTA DE ERROR
====================================================== */

/**
 * Muestra una alerta de error.
 *
 * @param {HTMLElement} container Contenedor de la alerta.
 * @param {string} message Mensaje.
 */
export function showErrorAlert(container, message) {
  showAlert(container, {
    message,
    type: ALERT_TYPES.ERROR,
    dismissible: true
  });
}

/* ======================================================
   ALERTA DE DATOS OFFLINE
====================================================== */

/**
 * Informa que se están mostrando datos almacenados.
 *
 * @param {HTMLElement} container Contenedor de la alerta.
 * @param {string} message Mensaje.
 */
export function showOfflineAlert(
  container,
  message
) {
  showAlert(container, {
    message,
    type: ALERT_TYPES.OFFLINE,
    title: "Mostrando datos no actualizados",
    dismissible: true
  });
}

/* ======================================================
   ALERTA DE REINTENTO
====================================================== */

/**
 * Muestra un mensaje de reintento con cuenta regresiva.
 *
 * @param {HTMLElement} container Contenedor de la alerta.
 * @param {number} seconds Segundos restantes.
 * @param {number} status Código HTTP.
 */
export function showRetryAlert(
  container,
  seconds,
  status
) {
  const errorName =
    status === 429
      ? "límite de solicitudes"
      : "error del servidor";

  showAlert(container, {
    type: ALERT_TYPES.WARNING,
    title: "Reintentando solicitud",
    message:
      `Se detectó un ${errorName}. `
      + `El siguiente intento se realizará en `
      + `${seconds} segundo${seconds === 1 ? "" : "s"}.`
  });
}

/* ======================================================
   LIMPIAR ALERTA
====================================================== */

/**
 * Elimina el contenido del contenedor de alertas.
 *
 * @param {HTMLElement} container Contenedor.
 */
export function clearAlert(container) {
  if (!(container instanceof HTMLElement)) {
    return;
  }

  container.innerHTML = "";
}

/* ======================================================
   EXPORTAR TIPOS
====================================================== */

export { ALERT_TYPES };