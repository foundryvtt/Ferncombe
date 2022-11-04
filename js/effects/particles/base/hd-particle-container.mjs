/**
 * A House Divided custom container for displaying visual effects based on particles.
 */
export default class HouseDividedParticleContainer extends PIXI.Container {

  /**
   * The particleContainer overlay container
   * @type {FullCanvasContainer}
   */
  particleContainer;

  /**
   * The currently active particle effect
   * @type {ParticleEffect}
   */
  particleEffect;


  /* -------------------------------------------- */

  /**
   * Define an elevation property on the WeatherEffects layer.
   * This approach is used for now until the particleContainer elevation property is formally added to the Scene data schema.
   * @type {number}
   */
  get elevation() {
    return this._elevation;
  }

  set elevation(value) {
    this._elevation = value;
  }

  _elevation;

  /* -------------------------------------------- */

  /** override */
  destroy({children=true}={}) {
    this.particleEffect?.destroy(children);
    this.particleContainer = this.particleEffect = undefined;
    super.destroy({children});
  }

  /* -------------------------------------------- */

  /**
   * Initialize the particle container.
   * @param {ParticleEffect} emitterClass
   * @param {object} [options={}]
   * @returns {FullCanvasContainer|null}    The particleContainer container, or null if no effect is present
   */
  initializeParticles(emitterClass, options={}) {
    if ( !emitterClass ) throw new Error("A valid ParticleEffect must be passed to initializeParticles.");

    // Create the effect and begin playback
    if ( !this.particleContainer ) {
      const pc = new FullCanvasContainer();
      pc.accessibleChildren = pc.interactiveChildren = false;
      this.particleContainer = this.addChild(pc);
    }
    this.particleEffect = new emitterClass(this.particleContainer, options);
    this.particleEffect.play();
    return this.particleContainer;
  }
}
