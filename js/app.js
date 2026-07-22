"use strict";

import { getTeams } from "./services/teamsService.js";

import {
  populateTeamsSelector,
  showTeamsLoadingState,
  showTeamsErrorState,
  getSelectedTeamId
} from "./ui/selectors.js";

/* ======================================================
   ESTADO DE LA APLICACIÓN
====================================================== */

const state = {
  teams: [],
  selectedTeamId: null
};

/* ======================================================
   SELECTORES DEL DOM
====================================================== */

const navigationButtons = document.querySelectorAll(
  ".navigation__button"
);

const screenSections = document.querySelectorAll(
  "[data-screen-section]"
);

const openScreenButtons = document.querySelectorAll(
  "[data-open-screen]"
);

const menuButton = document.getElementById("menuButton");
const mainNavigation = document.getElementById("mainNavigation");
const teamSelect = document.getElementById("teamSelect");
const apiStatus = document.getElementById("apiStatus");

/* ======================================================
   MOSTRAR UNA PANTALLA
====================================================== */

/**
 * Muestra la pantalla seleccionada y oculta las demás.
 *
 * @param {string} screenName Nombre de la pantalla que se mostrará.
 */
function showScreen(screenName) {
  screenSections.forEach((screen) => {
    const currentScreenName = screen.dataset.screenSection;
    const isSelectedScreen = currentScreenName === screenName;

    screen.classList.toggle("active", isSelectedScreen);
  });

  updateActiveNavigationButton(screenName);
  closeMobileMenu();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* ======================================================
   ACTUALIZAR BOTÓN ACTIVO DEL MENÚ
====================================================== */

/**
 * Marca como activo el botón correspondiente a la pantalla visible.
 *
 * @param {string} screenName Nombre de la pantalla activa.
 */
function updateActiveNavigationButton(screenName) {
  navigationButtons.forEach((button) => {
    const buttonScreenName = button.dataset.screen;
    const isActiveButton = buttonScreenName === screenName;

    button.classList.toggle("active", isActiveButton);
  });
}

/* ======================================================
   MENÚ MÓVIL
====================================================== */

/**
 * Abre o cierra el menú de navegación en pantallas pequeñas.
 */
function toggleMobileMenu() {
  const isMenuOpen = mainNavigation.classList.toggle("open");

  menuButton.setAttribute(
    "aria-expanded",
    String(isMenuOpen)
  );

  menuButton.setAttribute(
    "aria-label",
    isMenuOpen
      ? "Cerrar menú de navegación"
      : "Abrir menú de navegación"
  );
}

/**
 * Cierra el menú móvil después de seleccionar una pantalla.
 */
function closeMobileMenu() {
  mainNavigation.classList.remove("open");

  menuButton.setAttribute(
    "aria-expanded",
    "false"
  );

  menuButton.setAttribute(
    "aria-label",
    "Abrir menú de navegación"
  );
}

/* ======================================================
   EVENTOS DEL MENÚ PRINCIPAL
====================================================== */

/**
 * Agrega el evento de navegación a cada botón del encabezado.
 */
function configureNavigationButtons() {
  navigationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const screenName = button.dataset.screen;

      showScreen(screenName);
    });
  });
}

/* ======================================================
   EVENTOS DE LAS TARJETAS DE INICIO
====================================================== */

/**
 * Agrega navegación a los botones de las tarjetas de inicio.
 */
function configureOpenScreenButtons() {
  openScreenButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const screenName = button.dataset.openScreen;

      showScreen(screenName);
    });
  });
}

/* ======================================================
   EVENTO DEL BOTÓN MÓVIL
====================================================== */

/**
 * Configura el botón que abre y cierra el menú móvil.
 */
function configureMobileMenu() {
  menuButton.addEventListener(
    "click",
    toggleMobileMenu
  );
}

/* ======================================================
   CERRAR MENÚ AL CAMBIAR EL TAMAÑO DE LA VENTANA
====================================================== */

/**
 * Evita que el menú móvil permanezca abierto cuando
 * la ventana vuelve al tamaño de escritorio.
 */
function configureWindowResize() {
  window.addEventListener("resize", () => {
    const desktopWidth = 700;

    if (window.innerWidth > desktopWidth) {
      closeMobileMenu();
    }
  });
}

/* ======================================================
   CARGAR EQUIPOS
====================================================== */

/**
 * Consulta los equipos y llena el selector.
 */
async function loadTeams() {
  showTeamsLoadingState(teamSelect);

  updateApiStatus(
    "Cargando equipos desde la API..."
  );

  try {
    const teams = await getTeams();

    state.teams = teams;

    populateTeamsSelector(
      teamSelect,
      state.teams
    );

    updateApiStatus(
      `${state.teams.length} equipos cargados correctamente.`
    );
  } catch (error) {
    console.error(
      "Error al cargar los equipos:",
      error
    );

    showTeamsErrorState(teamSelect);

    updateApiStatus(
      "No fue posible cargar los equipos."
    );
  }
}

/* ======================================================
   EVENTO DEL SELECTOR DE EQUIPOS
====================================================== */

/**
 * Guarda el identificador del equipo seleccionado.
 */
function configureTeamSelector() {
  teamSelect.addEventListener("change", () => {
    const selectedTeamId =
      getSelectedTeamId(teamSelect);

    state.selectedTeamId = selectedTeamId;

    if (!selectedTeamId) {
      console.log("No hay un equipo seleccionado.");
      return;
    }

    console.log(
      "Equipo seleccionado:",
      selectedTeamId
    );
  });
}

/* ======================================================
   ESTADO GENERAL DE LA API
====================================================== */

/**
 * Actualiza el mensaje del panel de estado.
 *
 * @param {string} message Mensaje que se mostrará.
 */
function updateApiStatus(message) {
  apiStatus.textContent = message;
}

/* ======================================================
   INICIALIZACIÓN
====================================================== */

/**
 * Inicia las funciones básicas de la aplicación.
 */
async function init() {
  configureNavigationButtons();
  configureOpenScreenButtons();
  configureMobileMenu();
  configureWindowResize();
  configureTeamSelector();

  showScreen("inicio");

  await loadTeams();
}

/* Punto de entrada de la aplicación */
init();