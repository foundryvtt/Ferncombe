
const BIOGRAPHY_JOURNAL_ID = "Q2Ugx1bL0kbKlRXR";

const CONFIG = {
  usk: {
    id: "usk",
    label: "Usk",
    cssClass: "ruined",
    pageId: "uJ8F15Har6MVMj6a",
    header: "The Ruined Manor"
  },
  byscilla: {
    id: "byscilla",
    label: "Byscilla",
    cssClass: "ruined",
    pageId: "xbxnzgARPDPigG4e"
  },
  vivesna: {
    id: "vivesna",
    label: "Vivesna",
    cssClass: "shadeward",
    pageId: "CHPlHOdAOkk9F3l4",
    header: "The Shadeward Manor"
  },
  kryn: {
    id: "kryn",
    label: "Kryn",
    cssClass: "shadeward",
    pageId: "TxmjQWotcshN0E21",
  },
  vaxillus: {
    id: "vaxillus",
    label: "Vaxillus",
    cssClass: "shadeward",
    pageId: "Gw3iiZla1BZ1sqdv",
  },
  lyranth: {
    id: "lyranth",
    label: "Lyranth",
    cssClass: "shadeward",
    pageId: "5JoTaG5u80O1Ohsw"
  },
  vostolas: {
    id: "vostolas",
    label: "Vostolas",
    cssClass: "shadeward",
    pageId: "5zgB2b6vG4z8aM1a"
  },
  elscieth: {
    id: "elscieth",
    label: "Elscieth",
    cssClass: "feyward",
    pageId: "OSoaOvATFXQ3MiU0",
    header: "The Feyward Manor"
  },
  chirneros: {
    id: "chirneros",
    label: "Chirneros",
    cssClass: "feyward",
    pageId: "9Pf6tWcNRd4W760i",
  },
  saedia: {
    id: "saedia",
    label: "Saedia",
    cssClass: "feyward",
    pageId: "lUVjMazN4aeVfm9r",
  },
  tymnas: {
    id: "tymnas",
    label: "Tymnas",
    cssClass: "feyward",
    pageId: "ihU4PkZ1kW0EJZTc"
  },
  sprites: {
    id: "sprites",
    label: "The Sprites",
    cssClass: "feyward",
    pageId: "e6XKTpQcnGuIeiEv"
  }
}

const TIERS = [
  [-7, "Despised"],
  [-4, "Scorned"],
  [-1, "Unfriendly"],
  [0, "Neutral"],
  [3, "Friendly"],
  [6, "Loyal"],
  [10, "Devoted"]
];

export default class HouseDividedReputationTracker extends Application {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "ferncombe-reputation",
      classes: ["ferncombe"],
      title: "House Divided Approval Tracker",
      template: "modules/ferncombe/templates/reputation.hbs",
      width: 400,
      height: 660,
      resizable: true,
      popOut: true
    })
  }

  async _render(force, options) {
    if ( !game.user.isGM ) return ui.notifications.error("You do not have permission to view the approval tracker.");
    return super._render(force, options);
  }

  getData() {
    const reputation = foundry.utils.deepClone(CONFIG);
    const values = game.settings.get("ferncombe", "reputation");
    const biographies = game.journal.get(BIOGRAPHY_JOURNAL_ID);
    for ( const [id, r] of Object.entries(reputation) ) {
      const page = biographies.pages.get(r.pageId);
      r.link = page?.toAnchor({
        classes: ["content-link"],
        name: r.label,
        icon: false
      }).outerHTML ?? "";
      r.value = Math.clamped(values[id] ?? 0, -10, 10);
      r.tier = TIERS.find(t => r.value <= t[0])[1];
      r.barClass = r.value < 0 ? "negative" : "positive";
      r.pct = (r.value + 10) * 100 / 20
    }
    return {reputation};
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".action-button").click(this.#onClickActionButton.bind(this));
  }

  async #onClickActionButton(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const action = button.dataset.action;
    const npc = button.parentElement.dataset.npc;

    // Adjust reputation and re-render
    let delta = 0;
    if ( action === "increase" ) delta = 1;
    else if ( action === "decrease" ) delta = -1;
    await this.constructor.adjust(npc, delta);
    return this.render();
  }

  /* -------------------------------------------- */

  static registerSetting() {
    game.settings.register("ferncombe", "reputation", {
      scope: "world",
      type: Object,
      config: false,
      default: {},
      onChange: () => houseDivided.ui.reputation.render()
    });
  }

  /* -------------------------------------------- */

  /**
   * Adjust reputation for a specific NPC by a provided delta
   * @param {string} npc      The character to adjust
   * @param {number} delta    The amount to adjust by
   * @returns {Promise<*>}
   */
  static async adjust(npc, delta) {
    const values = game.settings.get("ferncombe", "reputation");
    values[npc] = Math.clamped(values[npc] ?? 0, -10, 10);
    values[npc] += delta;
    return game.settings.set("ferncombe", "reputation", values);
  }

  /* -------------------------------------------- */

  /**
   * Get a formatted button label for an approval change button
   * @param amounts
   * @returns {string}
   */
  static getButtonLabel(amounts) {
    const changes = [];
    for ( const [k, v] of Object.entries(amounts) ) {
      const l = CONFIG[k].label;
      changes.push(`${l} ${v.signedString()}`);
    }
    return `Approval Change: ${changes.join(", ")}`;
  }

  /* -------------------------------------------- */

  /**
   * Apply approval adjustments when a button is clicked
   * @param event
   * @returns {Promise<void>}
   */
  static async clickButtonLabel(event) {
    if ( !game.user.isGM ) return ui.notifications.warn(`Only a Gamemaster may apply approval changes.`);
    const button = event.currentTarget;
    const changed = [];
    for ( const [k, v] of Object.entries(button.dataset) ) {
      const c = CONFIG[k];
      if ( !c ) continue;
      const delta = Number(v);
      await HouseDividedReputationTracker.adjust(k, delta);
      changed.push(c.label);
    }
    ui.notifications.info(`Adjusted approval for: ${changed.join(", ")}`);
  }
}
