import * as handlers from "./importer.mjs";

/**
 * Configuration of the adventure being exported/imported
 */
export const ADVENTURE = {

  // Basic information about the module and the adventure compendium it contains
  moduleName: "ferncombe",
  packName: "ferncombe",
  packId: "ferncombe.ferncombe",

  // A CSS class to automatically apply to application windows which belong to this module
  cssClass: "ferncombe",

  // For now, hard code a banner image caption that will be displayed in the import UI
  banner: "modules/ferncombe/assets/cover.webp",
  caption: "An original 5th edition adventure designed exclusively for Foundry Virtual Tabletop",
  description: `
		<blockquote>
			<p>What has happened to our family? I lament what we have become. The halls of Raventree Estate once echoed with love and joy. Now, there is only suffering. Some say that time heals all wounds, but betrayal leaves wounds that will never knit.</p>
			<p>Is this the legacy I worked so hard to secure? Raventree in ruin. Trapped between life and death. Lost amidst shadow and chaos. <strong>A House Divided</strong>.</p>
		</blockquote>
		<p>A House Divided is an original adventure written and created by the Foundry Virtual Tabletop team. The adventure is designed specifically for Foundry Virtual Tabletop and leverages advanced features of the software to provide a unique storytelling experience. This comprehensive adventure for the 5th edition of the world's best-known roleplaying game, and will provide a party starting at 5th level with an estimated 100 hours of gameplay carrying them to level 10 by the story's conclusion.</p>
		<p>A House Divided is a tale of gothic horror and familial drama. The adventure features immersive exploration and tactically challenging combat, but its primary gameplay emphasis is social interaction with a rich cast of nuanced characters. What choices will the party make within the halls of Raventree Estate? What allegiances will they forge and what betrayals will they commit? Will the heroes restore the manor to its former glory, release it from its torment, or seize its power for their own?</p>`,

  // Define special Import Options with custom callback logic
  importOptions: {
    activateScene: {
      label: "Activate Initial Scene",
      default: true,
      handler: handlers.activateScene,
      documentId: "ZxNXOBaLeNaPVAWv"
    },
    displayJournal: {
      label: "Display Getting Started Journal",
      default: true,
      handler: handlers.displayJournal,
      documentId: "D1QzSUnec7ZApnDF"
    },
    playMusic: {
      label: "Play Title Theme Music",
      default: true,
      handler: handlers.playMusic,
      documentId: "e8vBTB0wODdiSNJF"
    },
    customizeJoin: {
      label: "Customize World Details",
      default: false,
      handler: handlers.customizeJoin,
      background: "modules/ferncombe/assets/journals/environments/manor-exterior.webp"
    }
  }
};
