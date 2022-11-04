/* -------------------------------------------- */
/*  Journal Sheet                               */
/* -------------------------------------------- */

class FerncombeJournalSheet extends JournalSheet {
  constructor(doc, options) {
    super(doc, options);
    this.options.classes.push("ferncombe", doc.getFlag("ferncombe", "realm"));
    this.sidebarSections = doc.getFlag("ferncombe", "sidebar-sections") ?? false;
  }

  async _renderInner(...args) {
    const html = await super._renderInner(...args);
    if ( this.sidebarSections ) this._insertSidebarSections(html);
    return html;
  }

  _insertSidebarSections(html) {
    const toc = html[0].querySelector(".pages-list .directory-list");
    if ( !toc.children.length ) return;
    const sections = {locations: false, quests: false, people: false};
    const divider = document.createElement("li");
    divider.classList.add("directory-section", "level1");
    for ( const li of Array.from(toc.children) ) {

      // Locations
      if ( !sections.locations ) {
        const d = divider.cloneNode();
        d.innerHTML = "<h2 class='section-header'>Locations</h2>"
        li.before(d);
        sections.locations = true;
        continue;
      }

      // People
      const title = li.querySelector(".page-title").innerText;
      if ( !sections.people && title.startsWith("Biography:") ) {
        const d = divider.cloneNode();
        d.innerHTML = "<h2 class='section-header'>People</h2>"
        li.before(d);
        sections.people = true;
        continue;
      }

      // Quests
      if ( !sections.quests && title.startsWith("Quest:") ) {
        const d = divider.cloneNode();
        d.innerHTML = "<h2 class='section-header'>Quests</h2>"
        li.before(d);
        sections.quests = true;
      }
    }
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


/* -------------------------------------------- */
/*  DEVELOPMENT TOOLS BELOW                     */
/* -------------------------------------------- */

Hooks.on("preCreateJournalEntry", (doc, data, options, userId) => {
  doc.data.update({
    flags: {
      core: {
        sheetClass: "ferncombe.FerncombeJournalSheet"
      }
    }
  })
});

Hooks.on("preCreateJournalEntryPage", (doc, data, options, userId) => {
  doc.data.update({
    flags: {
      core: {
        sheetClass: "ferncombe.FerncombeJournalSheet"
      }
    }
  })
});
