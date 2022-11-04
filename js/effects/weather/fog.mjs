import MistShader from "../shaders/mist.mjs";

/**
 * The House Divided Purple/Orange gradient fog.
 */
export default class FogWeatherEffect extends SpriteMesh {
  constructor(container) {
    super(PIXI.Texture.WHITE, MistShader);

    // For some scenes, we are using a custom mask
    switch ( canvas.scene?.id ) {
      case "zA8TGJrK0CHBM0VO":
        this.#maskTexture =
          PIXI.Texture.from("modules/ferncombe/assets/maps/ruined/manor-first/fog-mask.webp");
        break;
      case "zhDAyG12UoLvMQGF":
        this.#maskTexture =
          PIXI.Texture.from("modules/ferncombe/assets/maps/ruined/manor-second/fog-mask.webp");
        break;
      case "KcLoYTJA8lRX9BNs":
        this.#maskTexture =
          PIXI.Texture.from("modules/ferncombe/assets/maps/ruined/manor-attic/fog-mask.webp");
        break;
      default:
        this.#maskTexture = undefined;
    }

    if ( this.#maskTexture ) {
      this.shader.uniforms.maskSampler = this.#maskTexture;
      this.shader.uniforms.customTex = true;
    }
    else {
      this.shader.uniforms.maskSampler = canvas.masks.depth.renderTexture;
      this.shader.uniforms.customTex = false;
    }

    this.visible = false;
    this.blendMode = PIXI.BLEND_MODES.SCREEN;

    const d = canvas.dimensions;
    this.position.set(d.sceneRect.x, d.sceneRect.y);
    this.width = d.sceneRect.width;
    this.height = d.sceneRect.height;

    container.addChild(this);
  }

  /**
   * A placeholder if the shader need to handle a custom mask texture.
   * @type {PIXI.Texture|undefined}
   */
  #maskTexture;

  /* -------------------------------------------- */

  /**
   * Label for weather effect
   * @type {string}
   */
  static label = "Fog";

  /* -------------------------------------------- */

  /**
   * Same interface contract as other particle weather effect.
   */
  play() {
    this.visible = true;
  }

  /* -------------------------------------------- */

  /**
   * Same interface contract as other particle weather effect.
   */
  stop() {
    canvas.primary.weather.weatherOcclusionFilter.enabled = true;
    this.visible = false;
    this.#maskTexture?.destroy(true);
    this.#maskTexture = undefined;
    this.destroy();
  }
}
