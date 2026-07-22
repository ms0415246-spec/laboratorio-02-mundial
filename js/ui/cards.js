"use strict";

import {
  findTeamById,
  getTeamName
} from "../services/teamsService.js";

import {
  findStadiumById,
  getStadiumName,
  getStadiumCity,
  getStadiumCountry,
  formatStadiumCapacity
} from "../services/stadiumsService.js";

/* ======================================================
   MOSTRAR ESTADO VACÍO
====================================================== */

/**
 * Muestra un mensaje cuando no hay partidos disponibles.
 *
 * @param {HTMLElement} container Contenedor de resultados.
 * @param {string} title Título del mensaje.
 * @param {string} message Descripción del mensaje.
 */
export function showEmptyCardsState(
  container,
  title,
  message
) {
  if (!(container instanceof HTMLElement)) {
    return;
  }

  container.innerHTML = `
    <div class="empty-state">
      <span aria-hidden="true">🗺️</span>
      <h3>${title}</h3>
      <p>${message}</p>
    </div>
  `;
}

/* ======================================================
   MOSTRAR ESTADO DE CARGA
====================================================== */

/**
 * Muestra tarjetas temporales mientras se cargan los partidos.
 *
 * @param {HTMLElement} container Contenedor de resultados.
 * @param {number} amount Cantidad de tarjetas temporales.
 */
export function showCardsLoadingState(
  container,
  amount = 3
) {
  if (!(container instanceof HTMLElement)) {
    return;
  }

  container.innerHTML = "";

  for (let index = 0; index < amount; index += 1) {
    const skeletonCard = document.createElement("article");

    skeletonCard.className = "match-card match-card--loading";

    skeletonCard.innerHTML = `
      <div class="match-card__stripe"></div>

      <div class="match-card__content">
        <div class="skeleton skeleton--small"></div>
        <div class="skeleton skeleton--large"></div>
        <div class="skeleton skeleton--medium"></div>
        <div class="skeleton skeleton--medium"></div>
      </div>
    `;

    container.appendChild(skeletonCard);
  }
}

/* ======================================================
   RENDERIZAR TARJETAS DE PARTIDOS
====================================================== */

/**
 * Renderiza una tarjeta por cada partido.
 *
 * @param {HTMLElement} container Contenedor de resultados.
 * @param {Array} games Lista de partidos.
 * @param {Array} teams Lista de equipos.
 * @param {Array} stadiums Lista de estadios.
 * @param {string|number} selectedTeamId Equipo seleccionado.
 */
export function renderMatchCards(
  container,
  games,
  teams,
  stadiums,
  selectedTeamId
) {
  if (!(container instanceof HTMLElement)) {
    return;
  }

  container.innerHTML = "";

  if (!Array.isArray(games) || games.length === 0) {
    showEmptyCardsState(
      container,
      "No hay partidos disponibles",
      "No se encontraron partidos para el equipo seleccionado."
    );

    return;
  }

  games.forEach((game) => {
    const card = createMatchCard(
      game,
      teams,
      stadiums,
      selectedTeamId
    );

    container.appendChild(card);
  });
}

/* ======================================================
   CREAR TARJETA DE PARTIDO
====================================================== */

/**
 * Construye una tarjeta individual.
 *
 * @param {object} game Datos del partido.
 * @param {Array} teams Lista de equipos.
 * @param {Array} stadiums Lista de estadios.
 * @param {string|number} selectedTeamId Equipo seleccionado.
 * @returns {HTMLElement} Tarjeta construida.
 */
function createMatchCard(
  game,
  teams,
  stadiums,
  selectedTeamId
) {
  const homeTeam = findTeamById(
    teams,
    game.home_team_id
  );

  const awayTeam = findTeamById(
    teams,
    game.away_team_id
  );

  const stadium = findStadiumById(
    stadiums,
    game.stadium_id
  );

  const isSelectedTeamHome =
    String(game.home_team_id)
    === String(selectedTeamId);

  const selectedTeamRole = isSelectedTeamHome
    ? "Local"
    : "Visitante";

  const formattedDate = formatMatchDate(
    game.local_date
  );

  const card = document.createElement("article");

  card.className = [
    "match-card",
    isSelectedTeamHome
      ? "match-card--home"
      : "match-card--away"
  ].join(" ");

  card.innerHTML = `
    <div class="match-card__stripe"></div>

    <div class="match-card__content">
      <div class="match-card__header">
        <div>
          <p class="match-card__round">
            ${game.stage ?? game.round ?? "Partido"}
          </p>

          <h3 class="match-card__teams">
            ${getTeamName(homeTeam)}
            <span>vs</span>
            ${getTeamName(awayTeam)}
          </h3>
        </div>

        <span class="match-card__role">
          ${selectedTeamRole}
        </span>
      </div>

      <div class="match-card__details">
        <div class="match-card__row">
          <span aria-hidden="true">📅</span>

          <div>
            <small>Fecha y hora</small>
            <p>${formattedDate}</p>
          </div>
        </div>

        <div class="match-card__row">
          <span aria-hidden="true">🏟️</span>

          <div>
            <small>Estadio</small>
            <p>${getStadiumName(stadium)}</p>
            <span>
              ${getStadiumCity(stadium)},
              ${getStadiumCountry(stadium)}
            </span>
          </div>
        </div>

        <div class="match-card__row">
          <span aria-hidden="true">👥</span>

          <div>
            <small>Capacidad</small>
            <p>${formatStadiumCapacity(stadium)}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  return card;
}

/* ======================================================
   FORMATEAR FECHA DEL PARTIDO
====================================================== */

/**
 * Convierte la fecha de la API a un formato legible.
 *
 * @param {string} localDate Fecha original.
 * @returns {string} Fecha formateada.
 */
function formatMatchDate(localDate) {
  if (!localDate) {
    return "Fecha no disponible";
  }

  const date = new Date(localDate);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-CR", {
    dateStyle: "long",
    timeStyle: "short"
  }).format(date);
}

/* ======================================================
   RENDERIZAR TARJETAS DE GOLEADAS
====================================================== */

/**
 * Muestra las tarjetas de partidos terminados con una
 * diferencia igual o superior a tres goles.
 *
 * @param {HTMLElement} container Contenedor de resultados.
 * @param {Array} games Lista de goleadas.
 * @param {Array} teams Lista de equipos.
 */
export function renderBlowoutCards(
  container,
  games,
  teams
) {
  if (!(container instanceof HTMLElement)) {
    return;
  }

  container.innerHTML = "";

  if (!Array.isArray(games) || games.length === 0) {
    showEmptyCardsState(
      container,
      "No se encontraron goleadas",
      "No hay partidos finalizados con una diferencia de tres o más goles."
    );

    return;
  }

  games.forEach((game) => {
    const card = createBlowoutCard(
      game,
      teams
    );

    container.appendChild(card);
  });
}

/* ======================================================
   CREAR TARJETA DE GOLEADA
====================================================== */

/**
 * Construye una tarjeta individual para una goleada.
 *
 * @param {object} game Datos del partido.
 * @param {Array} teams Lista de equipos.
 * @returns {HTMLElement} Tarjeta construida.
 */
function createBlowoutCard(game, teams) {
  const homeTeam = findTeamById(
    teams,
    game.home_team_id
  );

  const awayTeam = findTeamById(
    teams,
    game.away_team_id
  );

  const homeScore = Number(
    game.home_score ?? 0
  );

  const awayScore = Number(
    game.away_score ?? 0
  );

  const goalDifference = Math.abs(
    homeScore - awayScore
  );

  const winnerTeam =
    homeScore > awayScore
      ? homeTeam
      : awayTeam;

  const formattedDate = formatMatchDate(
    game.local_date
  );

  const card = document.createElement("article");

  card.className = "blowout-card";

  card.innerHTML = `
    <div class="blowout-card__stripe"></div>

    <div class="blowout-card__content">
      <div class="blowout-card__header">
        <div>
          <p class="blowout-card__round">
            ${game.stage ?? game.round ?? "Partido finalizado"}
          </p>

          <h3 class="blowout-card__title">
            ${getTeamName(homeTeam)}
            <span>vs</span>
            ${getTeamName(awayTeam)}
          </h3>
        </div>

        <span class="blowout-card__difference">
          +${goalDifference}
        </span>
      </div>

      <div class="blowout-card__score">
        <div class="blowout-card__team">
          <span>${getTeamName(homeTeam)}</span>
          <strong>${homeScore}</strong>
        </div>

        <span class="blowout-card__separator">–</span>

        <div class="blowout-card__team">
          <strong>${awayScore}</strong>
          <span>${getTeamName(awayTeam)}</span>
        </div>
      </div>

      <div class="blowout-card__details">
        <div>
          <small>Ganador</small>
          <p>${getTeamName(winnerTeam)}</p>
        </div>

        <div>
          <small>Diferencia</small>
          <p>
            ${goalDifference}
            ${goalDifference === 1 ? "gol" : "goles"}
          </p>
        </div>

        <div>
          <small>Fecha</small>
          <p>${formattedDate}</p>
        </div>
      </div>
    </div>
  `;

  return card;
}

/* ======================================================
   RENDERIZAR RANKING DEFENSIVO
====================================================== */

/**
 * Muestra el ranking de los equipos con menos goles recibidos.
 *
 * @param {HTMLElement} container Contenedor del ranking.
 * @param {Array} ranking Registros defensivos.
 * @param {Array} teams Lista de equipos.
 * @param {Array} games Lista de partidos.
 */
export function renderWallRanking(
  container,
  ranking,
  teams,
  games
) {
  if (!(container instanceof HTMLElement)) {
    return;
  }

  container.innerHTML = "";

  if (!Array.isArray(ranking) || ranking.length === 0) {
    showEmptyCardsState(
      container,
      "Ranking no disponible",
      "No fue posible generar el ranking defensivo."
    );

    return;
  }

  ranking.forEach((teamRecord, index) => {
    const card = createWallRankingCard(
      teamRecord,
      index,
      teams,
      games
    );

    container.appendChild(card);
  });
}

/* ======================================================
   CREAR TARJETA DEL MURO
====================================================== */

/**
 * Construye una fila del ranking defensivo.
 *
 * @param {object} teamRecord Registro del grupo.
 * @param {number} index Posición del ranking.
 * @param {Array} teams Lista de equipos.
 * @param {Array} games Lista de partidos.
 * @returns {HTMLElement} Tarjeta construida.
 */
function createWallRankingCard(
  teamRecord,
  index,
  teams,
  games
) {
  const teamId =
    teamRecord.team_id
    ?? teamRecord.id
    ?? teamRecord.team?.id
    ?? null;

  const team = findTeamById(
    teams,
    teamId
  );

  const goalsAgainst = Number(
    teamRecord.goals_against
    ?? teamRecord.goal_against
    ?? teamRecord.ga
    ?? teamRecord.goalsAgainst
    ?? 0
  );

  const nextGame = findNextPendingGame(
    games,
    teamId
  );

  const opponentId = getOpponentId(
    nextGame,
    teamId
  );

  const opponent = findTeamById(
    teams,
    opponentId
  );

  const card = document.createElement("article");

  card.className = "wall-card";

  card.innerHTML = `
    <div class="wall-card__position">
      ${index + 1}
    </div>

    <div class="wall-card__team">
      <h3>${getTeamName(team)}</h3>

      <p>
        Grupo ${teamRecord.groupName ?? "—"}
      </p>
    </div>

    <div class="wall-card__stat">
      <small>Goles recibidos</small>
      <strong>${goalsAgainst}</strong>
    </div>

    <div class="wall-card__opponent">
      <small>Próximo rival</small>
      <p>
        ${
          nextGame
            ? getTeamName(opponent)
            : "Sin partido pendiente"
        }
      </p>
    </div>
  `;

  return card;
}

/* ======================================================
   BUSCAR PRÓXIMO PARTIDO PENDIENTE
====================================================== */

function findNextPendingGame(games, teamId) {
  const pendingGames = games.filter((game) => {
    const isHome =
      String(game.home_team_id)
      === String(teamId);

    const isAway =
      String(game.away_team_id)
      === String(teamId);

    const finishedValue = String(
      game.finished ?? ""
    ).toLowerCase();

    const isFinished =
      finishedValue === "true"
      || game.time_elapsed === "finished"
      || game.time_elapsed === "completed";

    return (
      !isFinished
      && (isHome || isAway)
    );
  });

  return pendingGames
    .sort((gameA, gameB) => {
      const dateA = new Date(
        gameA.local_date ?? ""
      ).getTime();

      const dateB = new Date(
        gameB.local_date ?? ""
      ).getTime();

      return dateA - dateB;
    })[0] ?? null;
}

/* ======================================================
   OBTENER RIVAL
====================================================== */

function getOpponentId(game, teamId) {
  if (!game) {
    return null;
  }

  if (
    String(game.home_team_id)
    === String(teamId)
  ) {
    return game.away_team_id ?? null;
  }

  return game.home_team_id ?? null;
}