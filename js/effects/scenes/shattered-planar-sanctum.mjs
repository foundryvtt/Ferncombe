import StarfieldShader from "../shaders/starfield.mjs";
import LightningShader from "../shaders/lightning.mjs";
import ClashShader from "../shaders/clash.mjs";
import HouseDividedParticleContainer from "../particles/base/hd-particle-container.mjs";
import PlanarSanctumLightningEffect from "../particles/lightning-rubbles.mjs";
import PlanarSanctumCristalEffects from "../particles/crystals-lightning.mjs";
import PlanarFogShader from "../shaders/fog-purple-orange.mjs";

/**
 * Class to handle the planar sanctum visual effects.
 */
export default class ShatteredSanctumEffects {
  /**
   * @type {SpriteMesh}
   */
  #starfield;

  /**
   * @type {HouseDividedParticleContainer}
   */
  #rubbleContainer;

  /**
   * @type {HouseDividedParticleContainer}
   */
  #crystalContainer;

  /**
   * @type {object}
   */
  #shatteredLightningClash = {
    purple: undefined,
    orange: undefined,
    clash: undefined
  }

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

  /**
   * @enum {number}
   */
  static ABOMINATION = {
    NotPresent: 0,
    Alive: 1,
    Dead: 2
  }

  get abominationNotPresent() {
    return this._abomination === this.constructor.ABOMINATION.NotPresent;
  }

  get abominationIsDead() {
    return this._abomination === this.constructor.ABOMINATION.Dead;
  }

  /**
   * @type {number}
   * @protected
   */
  _abomination;

  /**
   * @type {object}
   */
  abominationToken;

  /* -------------------------------------------- */

  onCanvasReady(canvas) {
    if ( !canvas ) return;

    // Assigning #crystals states
    this.#crystals = game.settings.get("ferncombe", "crystals");

    // Abomination initialization
    this.#intializeAbominationData();

    // Launch effects
    this.#activateEffects();
  }

  /* -------------------------------------------- */

  onAbominationChange() {
    this.#intializeAbominationData();
    this.onCrystalChange();
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
    updateCrystal(this.#shatteredLightningClash.clash);
    const l = this.#shatteredLightningClash;
    if ( l.purple && l.orange && l.clash ) {
      l.purple.visible = this.#crystals.purple;
      l.orange.visible = this.#crystals.orange;

      // Update #crystals if the abomination is dead or not present
      if ( this.abominationIsDead || this.abominationNotPresent ) {
        l.clash.visible = false;
        l.purple.position.set(5000, 6000);
        l.orange.position.set(7000, 6000);
        l.purple.rotation = 0;
        l.orange.rotation = Math.PI;
        l.purple.width = l.orange.width = 1300;
        l.purple.height = l.orange.height = 400;
        l.purple.shader.uniforms.ratiox = l.orange.shader.uniforms.ratiox = 0.75;
      }
    }

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

  #intializeAbominationData() {
    // Small inline function to know if token t is dead
    const tokenIsDead = t => {
      return t.actor.effects.some(e => e.getFlag('core', 'statusId') === CONFIG.specialStatusEffects.DEFEATED) ||
        t.actor.system.attributes.hp.value <= 0;
    }

    const abomination = game.settings.get("ferncombe", "abomination");
    let hasToken = !!abomination.tokenId;
    let isDead = false;

    // First with token Id
    let t = canvas.tokens.get(abomination.tokenId);
    if ( !t ) hasToken = false;
    else isDead = tokenIsDead(t);

    // If we do not found a token, we are searching for the first token with the abomination actor Id
    if ( !hasToken ) {
      const a = game.actors.get(abomination.actorId);
      if ( a ) {
        t = canvas.tokens.placeables.find(t => t.actor?.id === abomination.actorId);
        if ( t ) {
          abomination.tokenId = t.id;
          hasToken = true;
          isDead = tokenIsDead(t);
        }
      }
    }

    // Assign token and redefine render method
    this.abominationToken = t;
    if ( this.abominationToken ) {
      const self = this;
      this.abominationToken.render = function(renderer) {

        // Just to be sure we are in the right place
        if ( this.mesh.visible && !(self.abominationIsDead || self.abominationNotPresent) ) {
          const c =  this.center;
          const {purple, orange, clash} = self.#shatteredLightningClash;

          // Configuring clash position
          clash.position.set(c.x, c.y);
          clash.rotation = this.mesh.rotation;

          // Configuring rotation to target the abomination with the beam
          purple.rotation = Math.atan2(c.y - purple.position.y, c.x - purple.position.x);
          orange.rotation = Math.atan2(orange.position.y - c.y, orange.position.x - c.x) + Math.PI;

          // Configuring width to match distance to the abomination and adjust resolution
          let dx = purple.position.x - c.x;
          let dy = purple.position.y - c.y;
          purple.width = Math.sqrt(dx * dx + dy * dy);
          purple.shader.uniforms.ratiox = Math.clamped(1.0 - (300 / purple.width), 0.3, 0.9);

          dx = orange.position.x - c.x;
          dy = orange.position.y - c.y;
          orange.width = Math.sqrt(dx * dx + dy * dy);
          orange.shader.uniforms.ratiox = Math.clamped(1.0 - (300 / orange.width), 0.3, 0.9);
        }

        Token.prototype.render.call(this, renderer);
      };
    }

    // Assign status
    this._abomination = isDead ? this.constructor.ABOMINATION.Dead
      : (hasToken && !t.document.hidden ? this.constructor.ABOMINATION.Alive : this.constructor.ABOMINATION.NotPresent);
  }

  /* -------------------------------------------- */

  /**
   * Active special visual effects for the planar sanctum and shattered planar sanctum.
   * @protected
   */
  #activateEffects() {
    this.#clear();
    const d = canvas.dimensions;
    const options = {shattered: true}

    // Create the sprite mesh with the #starfield shader
    const s = this.#starfield = new SpriteMesh(PIXI.Texture.WHITE);
    s.elevation = -20;
    s.position.set(d.sceneX, d.sceneY);
    s.width = d.sceneWidth;
    s.height = d.sceneHeight;

    // Activate the #starfield shader
    s.setShaderClass(StarfieldShader);
    s.shader.uniforms.apocalypse = true;

    // Activate the lightning clashes shaders
    const center = this.abominationToken ? this.abominationToken.center : {x: 6000, y: 6000};
    const tex = PIXI.Texture.from("modules/ferncombe/assets/effects/black-1000x800.webp");

    // Purple bolt
    const cp = this.#shatteredLightningClash.purple = new SpriteMesh(tex);
    cp.blendMode = PIXI.BLEND_MODES.ADD;
    cp.elevation = 15;
    cp.pivot.set(0, 400);
    cp.position.set(5000, 6000);
    cp.width = 1000;
    cp.height = 400;
    cp.rotation = Math.atan2(center.y - cp.position.y, center.x - cp.position.x);

    // Orange bolt
    const co = this.#shatteredLightningClash.orange = new SpriteMesh(tex);
    co.blendMode = PIXI.BLEND_MODES.ADD;
    co.elevation = 15;
    co.pivot.set(0, 400);
    co.position.set(7000, 6000);
    co.width = 1000;
    co.height = 400;
    co.rotation = Math.atan2(co.position.y - center.y, co.position.x - center.x) + Math.PI;

    // Central clash effect
    const clashTex = PIXI.Texture.from("modules/ferncombe/assets/effects/lightning-abomination.webp")
    const cl = this.#shatteredLightningClash.clash = new SpriteMesh(clashTex);
    cl.blendMode = PIXI.BLEND_MODES.ADD;
    cl.elevation = 15;
    cl.pivot.set(600, 600);
    cl.position.set(center.x, center.y);
    cl.width = 600;
    cl.height = 600;

    cp.setShaderClass(LightningShader);
    cp.shader.uniforms.isPurple = true;
    cp.shader.uniforms.ratiox = 0.70;

    co.setShaderClass(LightningShader);
    co.shader.uniforms.isPurple = false;
    co.shader.uniforms.ratiox = 0.70;

    cl.setShaderClass(ClashShader);

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
    rc.initializeParticles(PlanarSanctumLightningEffect, options);

    // Create the "particleContainer layer" specific for lightning and drifting rocks
    const cc = this.#crystalContainer = new HouseDividedParticleContainer();
    cc.elevation = 10;
    cc.mask = m;

    // Prepare effects
    cc.initializeParticles(PlanarSanctumCristalEffects, options);

    // Add the display objects into the primary group
    canvas.primary.addChild(this.#rubbleContainer);
    canvas.primary.addChild(this.#starfield);
    canvas.primary.addChild(this.#crystalContainer);
    if ( this.#shatteredLightningClash.purple ) canvas.primary.addChild(this.#shatteredLightningClash.purple);
    if ( this.#shatteredLightningClash.orange ) canvas.primary.addChild(this.#shatteredLightningClash.orange);
    if ( this.#shatteredLightningClash.clash ) canvas.primary.addChild(this.#shatteredLightningClash.clash);

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
    const displayObjects = ["starfield", "rubbleContainer", "crystalContainer", "mask"];

    const clear = (d, ctx) => {
      if ( ctx[d] === undefined ) return;
      if ( !ctx[d].destroyed ) {
        ctx[d].destroy({children: true});
      }
      ctx[d] = undefined;
    }

    for ( let d of displayObjects ) clear(d, this);
    for ( let d of Object.keys(this.#shatteredLightningClash) ) clear(d, this.#shatteredLightningClash);
  }
}
