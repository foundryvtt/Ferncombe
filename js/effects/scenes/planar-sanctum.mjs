import StarfieldShader from "../shaders/starfield.mjs";
import LightningClashShader from "../shaders/lightning-clash.mjs";
import HouseDividedParticleContainer from "../particles/base/hd-particle-container.mjs";
import PlanarSanctumLightningEffect from "../particles/lightning-rubbles.mjs";
import PlanarSanctumCristalEffects from "../particles/crystals-lightning.mjs";
import PlanarFogShader from "../shaders/fog-purple-orange.mjs";

/**
 * Class to handle the planar sanctum visual effects.
 */
export default class PlanarSanctumEffects {
  /**
   * @type {SpriteMesh}
   */
  #starfield;

  /**
   * @type {SpriteMesh}
   */
  #lightningClash;

  /**
   * @type {HouseDividedParticleContainer}
   */
  #rubbleContainer;

  /**
   * @type {HouseDividedParticleContainer}
   */
  #crystalContainer;

  /**
   * @type {PIXI.LegacyGraphics}
   */
  #mask;

  /**
   * @type {object}
   */
  #crystals = {
    purple: true,
    orange: true
  };

  /* -------------------------------------------- */

  onCanvasReady(canvas) {
    // Assigning #crystals states
    this.#crystals = game.settings.get("ferncombe", "crystals");

    // Launch effects
    this.#activateEffects();
  }

  /* -------------------------------------------- */

  onCrystalChange() {
    this.#crystals = game.settings.get("ferncombe", "crystals");

    const shutDown = !this.#crystals.purple && !this.#crystals.orange;

    const updateCrystal = l => {
      if ( !l ) return;
      if ( shutDown ) l.visible = false;
      else {
        l.shader.uniforms.purpleDestroyed = !this.#crystals.purple;
        l.shader.uniforms.orangeDestroyed = !this.#crystals.orange;
        l.visible = true;
      }
    }

    // Changing the clash of lightning uniforms if necessary
    updateCrystal(this.#lightningClash);

    // Deactivating or activating #crystals lightning emitters
    if ( this.#crystalContainer ) {
      const cc = this.#crystalContainer;
      if ( shutDown ) cc.visible = false;
      else {
        cc.particleEffect.emitters[0].emit = this.#crystals.purple;
        cc.particleEffect.emitters[1].emit = this.#crystals.orange;
        cc.visible = true;
      }
    }
  }

  /* -------------------------------------------- */

  /**
   * Active special visual effects for the planar sanctum and shattered planar sanctum.
   * @protected
   */
  #activateEffects() {
    this.#clear();
    const d = canvas.dimensions;

    // Create the sprite mesh with the #starfield shader
    const s = this.#starfield = new SpriteMesh(PIXI.Texture.WHITE);
    s.elevation = -20;
    s.position.set(d.sceneX, d.sceneY);
    s.width = d.sceneWidth;
    s.height = d.sceneHeight;

    // Activate the #starfield shader
    s.setShaderClass(StarfieldShader);
    s.shader.uniforms.apocalypse = this.inShatteredPlanarSanctum;

    // Create the conflicting lightning
    const tex = PIXI.Texture.from("modules/ferncombe/assets/effects/Lightning_Clash.webp");
    const c = this.#lightningClash = new SpriteMesh(tex);
    c.blendMode = PIXI.BLEND_MODES.ADD;
    c.elevation = 15;
    c.position.set(5000, 4400);
    c.width = 2000;
    c.height = 400;

    // Activate the clash lightning shader
    c.setShaderClass(LightningClashShader);

    // Create #mask for particle containers
    const m = this.#mask = new PIXI.LegacyGraphics();
    m.renderable = false;
    m.beginFill(0xFFFFFF, 1.0).drawRect(d.sceneRect.x, d.sceneRect.y, d.sceneRect.width, d.sceneRect.height).endFill();
    canvas.hidden.addMask("PlanarSanctum", m);

    // Create the "particleContainer layer" specific for lightning and drifting rocks
    const rc = this.#rubbleContainer = new HouseDividedParticleContainer();
    rc.elevation = -10;
    rc.mask = m;

    // Prepare effects
    rc.initializeParticles(PlanarSanctumLightningEffect);

    // Create the "particleContainer layer" specific for lightning and drifting rocks
    const cc = this.#crystalContainer = new HouseDividedParticleContainer();
    cc.elevation = 10;
    cc.mask = m;

    // Prepare effects
    cc.initializeParticles(PlanarSanctumCristalEffects);

    // Add the display objects into the primary group
    canvas.primary.addChild(this.#rubbleContainer);
    canvas.primary.addChild(this.#starfield);
    canvas.primary.addChild(this.#crystalContainer);
    if ( this.#lightningClash ) canvas.primary.addChild(this.#lightningClash);

    // Sort children
    canvas.primary.sortChildren();

    // Activate the foreground shader class with fog
    canvas.primary.foreground.setShaderClass(PlanarFogShader);

    // Update #crystals if necessary
    this.onCrystalChange();
  }

  /* -------------------------------------------- */

  /**
   * Clear class properties references.
   * We don't need to destroy them, this is handled by the canvas automated clear/destroy/tearDown.
   * @protected
   */
  #clear() {
    const displayObjects = ["#starfield", "#lightningClash", "#rubbleContainer", "#crystalContainer", "#mask"];

    const clear = (d, ctx) => {
      if ( ctx[d] === undefined ) return;
      if ( !ctx[d].destroyed ) {
        ctx[d].destroy({children: true});
      }
      ctx[d] = undefined;
    }

    for ( let d of displayObjects ) clear(d, this);
  }
}
