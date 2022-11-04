import {ADVENTURE} from "./adventure.mjs";

/* -------------------------------------------- */
/*  Customize Import Form                       */
/* -------------------------------------------- */

/**
 * Add HTML options to the importer form
 * @returns {string}
 */
export function renderAdventureImporter(app, html, data) {
  if ( app.adventure.pack !== ADVENTURE.packId ) return;
  html.find(".window-content").addClass("ferncombe");
  html.find("h2").addClass("border");

  // Format options HTML
  let options = `<section class="import-form"><h2 class="border">Options</h2>`;
  for ( const [name, option] of Object.entries(ADVENTURE.importOptions) ) {
    options += `<div class="form-group">
        <label class="checkbox">
            <input type="checkbox" name="${name}" title="${option.label}" ${option.default ? "checked" : ""}/>
            ${option.label}
        </label>
    </div>`;
  }
  options += `</section>`;

  // Insert options
  html.find(".adventure-contents").append(options);
  app.setPosition();
}

/* -------------------------------------------- */
/*  Handle Import Options                       */
/* -------------------------------------------- */

/**
 * Handle options supported by the importer
 * @param {Adventure} adventure
 * @param {object} formData
 * @param {object} created
 * @param {object} updated
 * @returns {Promise<void>}
 */
export async function handleImportOptions(adventure, formData, created, updated) {
  for ( let [name, option] of Object.entries(ADVENTURE.importOptions) ) {
    if ( formData[name] ) await option.handler(adventure, option);
  }
}

/**
 * Activate an initial scene
 * @param {Adventure} adventure   The adventure being imported
 * @param {object} option         The configured import option
 * @returns {Promise<*>}
 */
export async function activateScene(adventure, option) {
  const scene = game.scenes.get(option.documentId);
  return scene.activate();
}

/* -------------------------------------------- */

/**
 * Display an initial journal entry
 * @param {Adventure} adventure     The adventure being imported
 * @param {object} option           The configured import option
 * @returns {Promise<*>}
 */
export async function displayJournal(adventure, option) {
  const journal = game.journal.get(option.documentId);
  journal.sheet.render(true);
}

/* -------------------------------------------- */

/**
 * Begin playing an initial audio playlist
 * @param {Adventure} adventure     The adventure being imported
 * @param {object} option           The configured import option
 * @returns {Promise<*>}
 */
export async function playMusic(adventure, option) {
  const playlist = game.playlists.get(option.documentId);
  return playlist.playAll();
}

/* -------------------------------------------- */

/**
 * Customize the world description and background image
 * @param {Adventure} adventure     The adventure being imported
 * @param {object} option           The configured import option
 * @returns {Promise<*>}
 */
export async function customizeJoin(adventure, option) {
  const worldData = {
    action: "editWorld",
    id: game.world.id,
    description: ADVENTURE.description,
    background: option.background
  }
  await fetchJsonWithTimeout(foundry.utils.getRoute("setup"), {
    method: "POST",
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(worldData)
  });
  game.world.updateSource(worldData);
}
