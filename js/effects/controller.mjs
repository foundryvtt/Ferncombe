import PlanarSanctumEffects from "./scenes/planar-sanctum.mjs";
import ShatteredSanctumEffects from "./scenes/shattered-planar-sanctum.mjs";
import FogWeatherEffect from "./weather/fog.mjs";
import PlanarPortalShader from "./shaders/light-planar-portal.mjs"
import TorusExtended from "./particles/shapes/torus-extended.mjs";

export default class HouseDividedEffectsController {
  constructor() {
    /**
     * Handle effects for the Planar Sanctum.
     * @type {PlanarSanctumEffects}
     */
    this.#planarSanctumEffects = new PlanarSanctumEffects();

    /**
     * Handle effects for the Shattered Planar Sanctum.
     * @type {ShatteredSanctumEffects}
     */
    this.#shatteredSanctumEffects = new ShatteredSanctumEffects();
  }

  /**
   * Enum of scene id
   * @type {enum}
   */
  #scenesId = {
    planarSanctum: "rRY9Y8jNBkPbmcUl",
    shatteredSanctum: "9fjzcw7xLMsg9dYX"
  }

  /**
   * @type {PlanarSanctumEffects}
   */
  #planarSanctumEffects;

  /**
   * @type {ShatteredSanctumEffects}
   */
  #shatteredSanctumEffects;

  /* -------------------------------------------- */

  onCanvasReady(canvas) {
    if ( !canvas ) return;

    switch ( canvas.scene?.id ) {
      case this.#scenesId.planarSanctum:
        this.#planarSanctumEffects.onCanvasReady(canvas);
        return;
      case this.#scenesId.shatteredSanctum:
        this.#shatteredSanctumEffects.onCanvasReady(canvas);
        return;
    }
  }

  /* -------------------------------------------- */

  onCreateToken(doc) {
    if ( canvas.scene?.id === this.#scenesId.shatteredSanctum )
      this.#shatteredSanctumEffects.onAbominationChange();
  }

  /* -------------------------------------------- */

  onDeleteToken(sceneId, tokenId) {
    if ( canvas.scene?.id === this.#scenesId.shatteredSanctum )
      this.#shatteredSanctumEffects.onAbominationChange();
  }

  /* -------------------------------------------- */

  onUpdateToken(doc, updateData, options, userId) {
    if ( canvas.scene?.id === this.#scenesId.shatteredSanctum )
      this.#shatteredSanctumEffects.onAbominationChange();
  }

  /* -------------------------------------------- */

  onUpdateActor(actor, data, options, userId) {
    if ( canvas.scene?.id === this.#scenesId.shatteredSanctum )
      this.#shatteredSanctumEffects.onAbominationChange();
  }

  onCreateActiveEffect() {
    if ( canvas.scene?.id === this.#scenesId.shatteredSanctum )
      this.#shatteredSanctumEffects.onAbominationChange();
  }

  onDeleteActiveEffect() {
    if ( canvas.scene?.id === this.#scenesId.shatteredSanctum )
      this.#shatteredSanctumEffects.onAbominationChange();
  }

  onUpdateActiveEffect() {
    if ( canvas.scene?.id === this.#scenesId.shatteredSanctum )
      this.#shatteredSanctumEffects.onAbominationChange();
  }

  /* -------------------------------------------- */

  onCrystalChange() {
    switch ( canvas.scene?.id ) {
      case this.#scenesId.planarSanctum:
        this.#planarSanctumEffects.onCrystalChange();
        break;
      case this.#scenesId.shatteredSanctum:
        this.#shatteredSanctumEffects.onCrystalChange();
        break;
    }
  }

  /* -------------------------------------------- */

  static registerSetting() {
    // Planar Sanctum Crystals state
    game.settings.register("ferncombe", "crystals", {
      scope: "world",
      type: Object,
      config: false,
      default: {purple: true, orange: true}, // both #crystals are active by default
      onChange: () => houseDivided.effects.controller.onCrystalChange()
    });

    // Abomination token and actor ID
    game.settings.register("ferncombe", "abomination", {
      scope: "world",
      type: Object,
      config: false,
      default: {tokenId: "eVdbnjEOjb3Rs82P", actorId: "Xxf80BJeTCVKhIao"},
    });

    // Add weather effect
    CONFIG.weatherEffects.fog = FogWeatherEffect;

    // Add planar portal light animation
    CONFIG.Canvas.lightAnimations.planarPortal = {
      label: "Planar Portal",
      animation: PlanarPortalShader.Animation,
      colorationShader: PlanarPortalShader.Coloration,
      illuminationShader: PlanarPortalShader.Illumination
    }

    // Add new SpawnShape to pixi particles behaviors
    PIXI.particles.behaviors.ShapeSpawnBehavior.registerShape(TorusExtended);
  }
}
