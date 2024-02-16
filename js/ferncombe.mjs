/* -------------------------------------------- */
/*  Journal Sheet                               */
/* -------------------------------------------- */

class FerncombeJournalSheet extends JournalSheet {
  constructor(doc, options) {
    super(doc, options);
    this.options.classes.push("ferncombe", doc.getFlag("ferncombe", "realm"));
  }

  async _renderInner(...args) {
    const html = await super._renderInner(...args);
    return html;
  }

}


/* -------------------------------------------- */
/*  Initialization Hook                         */
/* -------------------------------------------- */

Hooks.on("init", () => {
  const module = globalThis.ferncombe = game.modules.get("ferncombe");

  // Register Journal Sheet
  DocumentSheetConfig.registerSheet(JournalEntry, "ferncombe", FerncombeJournalSheet, {
    types: ["base"],
    label: "Ferncombe",
    makeDefault: false
  });

  // Expose module API
  module.api = {
    FerncombeJournalSheet,
  }
});

/* -------------------------------------------- */
/*  Journal Page Rendering                      */
/* -------------------------------------------- */

Hooks.on("renderJournalPageSheet", (app, html, options) => {
  const doc = app.document;
  const isManor = doc.parent.sheet instanceof FerncombeJournalSheet;
  if ( !isManor ) return;
  html.addClass("ferncombe");
  const realm = doc.parent.getFlag("ferncombe", "realm");
  if ( realm ) html.addClass(realm);

  // Apply handwritten styles
  if ( doc.getFlag("ferncombe", "handwritten") ) html.addClass("handwritten");
  
});
