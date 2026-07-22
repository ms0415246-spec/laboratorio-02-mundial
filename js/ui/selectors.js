"use strict";

import {
  getTeamName,
  sortTeamsByName
} from "../services/teamsService.js";

/* ======================================================
   LLENAR SELECTOR DE EQUIPOS
====================================================== */

/**
 * Llena un elemento select con la lista de equipos.
 *
 * @param {HTMLSelectElement} selectElement Selector que se llenará.
 * @param {Array} teams Lista de equipos.
 */
export function populateTeamsSelector(
  selectElement,
  teams
) {
  if (!(selectElement instanceof HTMLSelectElement)) {
    throw new Error(
      "El elemento recibido no es un selector válido."
    );
  }

  const sortedTeams = sortTeamsByName(teams);

  selectElement.innerHTML = "";

  const defaultOption = document.createElement("option");

  defaultOption.value = "";
  defaultOption.textContent =
    `— Selecciona un equipo (${sortedTeams.length}) —`;

  selectElement.appendChild(defaultOption);

  sortedTeams.forEach((team) => {
    const option = document.createElement("option");

    option.value = String(team.id);
    option.textContent = getTeamName(team);

    selectElement.appendChild(option);
  });

  selectElement.disabled = false;
}

/* ======================================================
   MOSTRAR ESTADO DE CARGA
====================================================== */

/**
 * Muestra un mensaje temporal mientras se cargan los equipos.
 *
 * @param {HTMLSelectElement} selectElement Selector de equipos.
 */
export function showTeamsLoadingState(selectElement) {
  if (!(selectElement instanceof HTMLSelectElement)) {
    return;
  }

  selectElement.disabled = true;

  selectElement.innerHTML = `
    <option value="">
      — Cargando equipos… —
    </option>
  `;
}

/* ======================================================
   MOSTRAR ERROR EN EL SELECTOR
====================================================== */

/**
 * Muestra un mensaje cuando no fue posible cargar los equipos.
 *
 * @param {HTMLSelectElement} selectElement Selector de equipos.
 */
export function showTeamsErrorState(selectElement) {
  if (!(selectElement instanceof HTMLSelectElement)) {
    return;
  }

  selectElement.disabled = true;

  selectElement.innerHTML = `
    <option value="">
      — No fue posible cargar los equipos —
    </option>
  `;
}

/* ======================================================
   OBTENER EQUIPO SELECCIONADO
====================================================== */

/**
 * Devuelve el identificador actualmente seleccionado.
 *
 * @param {HTMLSelectElement} selectElement Selector de equipos.
 * @returns {string|null} Identificador o null.
 */
export function getSelectedTeamId(selectElement) {
  if (!(selectElement instanceof HTMLSelectElement)) {
    return null;
  }

  return selectElement.value || null;
}

/* ======================================================
   REINICIAR SELECTOR
====================================================== */

/**
 * Regresa el selector a la primera opción.
 *
 * @param {HTMLSelectElement} selectElement Selector de equipos.
 */
export function resetTeamsSelector(selectElement) {
  if (!(selectElement instanceof HTMLSelectElement)) {
    return;
  }

  selectElement.selectedIndex = 0;
}