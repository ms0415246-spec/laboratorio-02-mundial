"use strict";

import { getTeams } from "./services/teamsService.js";

import {
  getGames,
  getGamesByTeam
} from "./services/gamesService.js";

import {
  getStadiums
} from "./services/stadiumsService.js";

import {
  populateTeamsSelector,
  showTeamsLoadingState,
  showTeamsErrorState,
  getSelectedTeamId
} from "./ui/selectors.js";

import {
  renderMatchCards,
  showCardsLoadingState,
  showEmptyCardsState
} from "./ui/cards.js";

import {
  showSuccessAlert,
  showWarningAlert,
  showErrorAlert,
  showOfflineAlert,
  showRetryAlert,
  clearAlert
} from "./ui/alerts.js";

import {
  saveCache,
  getCache,
  CACHE_KEYS
} from "./utils/cache.js";

import {
  configureRetryHandler
} from "./api/apiClient.js";

import {
  runCountdown
} from "./utils/retry.js";

/* ======================================================
   ESTADO DE LA APLICACIÓN
====================================================== */

const state = {
  teams: [],
  games: [],
  stadiums: [],
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
const championRouteResults = document.getElementById(
  "championRouteResults"
);
const alertsContainer = document.getElementById(
  "alertsContainer"
);

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
   INFORMAR REINTENTOS
====================================================== */

/**
 * Muestra una cuenta regresiva antes del siguiente
 * intento automático.
 *
 * @param {object} retryData Datos del reintento.
 */
async function handleApiRetry({
  endpoint,
  attempt,
  delay,
  status
}) {
  await runCountdown(
    delay,
    (seconds) => {
      showRetryAlert(
        alertsContainer,
        seconds,
        status
      );
    }
  );

  console.log(
  `Ejecutando intento ${attempt} `
  + `para ${endpoint}.`
);
}

/* ======================================================
   CARGAR EQUIPOS
====================================================== */

/**
 * Consulta los equipos y llena el selector.
 */
async function loadTeams() {
  showTeamsLoadingState(teamSelect);

  try {
    const teams = await getTeams();

    state.teams = teams;

    saveCache(
      CACHE_KEYS.TEAMS,
      state.teams
    );

    populateTeamsSelector(
      teamSelect,
      state.teams
    );
  } catch (error) {
    console.error(
      "Error al cargar los equipos:",
      error
    );

    const cachedTeams = getCache(
      CACHE_KEYS.TEAMS
    );

    if (
      Array.isArray(cachedTeams)
      && cachedTeams.length > 0
    ) {
      state.teams = cachedTeams;

      populateTeamsSelector(
        teamSelect,
        state.teams
      );

      showOfflineAlert(
        alertsContainer,
        "No fue posible actualizar los equipos. Se está utilizando la última copia almacenada."
      );

      return;
    }

    state.teams = [];

    showTeamsErrorState(teamSelect);

    showErrorAlert(
      alertsContainer,
      "No fue posible cargar los equipos y no existe una copia almacenada."
    );
  }
}

/* ======================================================
   CARGAR PARTIDOS
====================================================== */

/**
 * Consulta y guarda los partidos disponibles.
 */
async function loadGames() {
  try {
    const games = await getGames();

    state.games = games;

    saveCache(
      CACHE_KEYS.GAMES,
      state.games
    );

    console.log(
      `${state.games.length} partidos cargados.`
    );
  } catch (error) {
    console.error(
      "Error al cargar los partidos:",
      error
    );

    const cachedGames = getCache(
      CACHE_KEYS.GAMES
    );

    if (
      Array.isArray(cachedGames)
      && cachedGames.length > 0
    ) {
      state.games = cachedGames;

      showOfflineAlert(
        alertsContainer,
        "No fue posible actualizar los partidos. Se está utilizando la última copia almacenada."
      );

      return;
    }

    state.games = [];

    showErrorAlert(
      alertsContainer,
      "No fue posible cargar los partidos y no existe una copia almacenada."
    );
  }
}

/* ======================================================
   CARGAR ESTADIOS
====================================================== */

/**
 * Consulta y guarda los estadios disponibles.
 */
async function loadStadiums() {
  try {
    const stadiums = await getStadiums();

    state.stadiums = stadiums;

    saveCache(
      CACHE_KEYS.STADIUMS,
      state.stadiums
    );

    console.log(
      `${state.stadiums.length} estadios cargados.`
    );
  } catch (error) {
    console.error(
      "Error al cargar los estadios:",
      error
    );

    const cachedStadiums = getCache(
      CACHE_KEYS.STADIUMS
    );

    if (
      Array.isArray(cachedStadiums)
      && cachedStadiums.length > 0
    ) {
      state.stadiums = cachedStadiums;

      showOfflineAlert(
        alertsContainer,
        "No fue posible actualizar los estadios. Se está utilizando la última copia almacenada."
      );

      return;
    }

    state.stadiums = [];

    showWarningAlert(
      alertsContainer,
      "Los estadios no están disponibles y no existe una copia almacenada. Los partidos se mostrarán con información incompleta."
    );
  }
}

/* ======================================================
   CARGAR DATOS INICIALES
====================================================== */

/**
 * Carga equipos, partidos y estadios.
 *
 * Cada recurso se administra por separado para que el fallo
 * de uno no elimine los datos obtenidos de los demás.
 */
async function loadInitialData() {
  clearAlert(alertsContainer);

  updateApiStatus(
    "Cargando información del Mundial 2026..."
  );

  await Promise.all([
    loadTeams(),
    loadGames(),
    loadStadiums()
  ]);

  updateApiStatus(
    createLoadedDataMessage()
  );

  if (
    state.teams.length > 0
    && state.games.length > 0
    && state.stadiums.length > 0
  ) {
    showSuccessAlert(
      alertsContainer,
      "La información principal del Mundial 2026 se cargó correctamente."
    );
  }
}

/**
 * Construye el resumen de los datos cargados.
 *
 * @returns {string} Mensaje de estado.
 */
function createLoadedDataMessage() {
  return (
    `${state.teams.length} equipos, `
    + `${state.games.length} partidos y `
    + `${state.stadiums.length} estadios cargados.`
  );
}

/* ======================================================
   MOSTRAR ITINERARIO DEL EQUIPO
====================================================== */

/**
 * Filtra y muestra los partidos del equipo seleccionado.
 *
 * @param {string|number} teamId Identificador del equipo.
 */
function renderChampionRoute(teamId) {
  if (state.games.length === 0) {
    showEmptyCardsState(
      championRouteResults,
      "Partidos no disponibles",
      "No fue posible obtener los partidos desde la API."
    );

    return;
  }

  const teamGames = getGamesByTeam(
    state.games,
    teamId
  );

  renderMatchCards(
    championRouteResults,
    teamGames,
    state.teams,
    state.stadiums,
    teamId
  );
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
      showEmptyCardsState(
        championRouteResults,
        "Itinerario pendiente",
        "Selecciona un equipo para mostrar sus partidos."
      );

      return;
    }

    console.log(
      "Equipo seleccionado:",
      selectedTeamId
    );

    showCardsLoadingState(
      championRouteResults,
      3
    );

    window.setTimeout(() => {
      renderChampionRoute(selectedTeamId);
    }, 300);
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

  configureRetryHandler(handleApiRetry);

  showScreen("inicio");

  await loadInitialData();
}

/* Punto de entrada de la aplicación */
init();