import HouseDividedShaderMixin from "./base/hd-sampler-shader.mjs";

/**
 * The House Divided Purple/Orange gradient fog.
 */
export default class MistShader extends HouseDividedShaderMixin(BaseSamplerShader) {

  /** @override */
  static classPluginName = null;

  /* -------------------------------------------- */

  static OCTAVES(mode) {
    return `${mode + 2}`;
  }

  static MIST(mode) {
    if ( mode === 0 ) {
      return `vec2 mv = vec2(fbm(uv * 4.5 + time * 0.115)) * (1.0 + r * 0.25);
        mist += fbm(uv * 4.5 + mv - time * 0.0275) * (1.0 + r * 0.25);`;
    }
    return `for ( int i=0; i<2; i++ ) {
        vec2 mv = vec2(fbm(uv * 4.5 + time * 0.115 + vec2(float(i) * 250.0))) * (0.50 + r * 0.25);
        mist += fbm(uv * 4.5 + mv - time * 0.0275) * (0.50 + r * 0.25);
    }`;
  }

  /* -------------------------------------------- */

  /** @override */
  static create(defaultUniforms) {
    const mode = canvas?.performance.mode ?? 2;
    const program = PIXI.Program.from(this.vertexShader, this.fragmentShader(mode));
    const uniforms = mergeObject(this.defaultUniforms, defaultUniforms, {inplace: false, insertKeys: false});
    return new this(program, uniforms);
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  static vertexShader = `
    precision ${PIXI.settings.PRECISION_VERTEX} float;
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    uniform mat3 projectionMatrix;
    uniform vec2 screenDimensions;
    uniform bool customTex;
    varying vec2 vUvsMask;
    varying vec2 vUvs;
  
    void main() {
      vUvs = aTextureCoord;
      vUvsMask = customTex ? vUvs : aVertexPosition / screenDimensions;
      gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }
  `;

  /** @inheritdoc */
  static fragmentShader(mode) {
    return `
    precision ${PIXI.settings.PRECISION_FRAGMENT} float;
    uniform sampler2D maskSampler;
    uniform sampler2D sampler;
    uniform vec4 tintAlpha;
    uniform float time;
    uniform bool customTex;
    varying vec2 vUvs;
    varying vec2 vUvsMask;
    
    ${this.CONSTANTS}
    ${this.PERCEIVED_BRIGHTNESS}
    ${this.RAND_HD}
     
    // ********************************************************* //

    float fnoise(in vec2 coords) {
      vec2 i = floor(coords);
      vec2 f = fract(coords);
    
      float a = rand(i);
      float b = rand(i + vec2(1.0, 0.0));
      float c = rand(i + vec2(0.0, 1.0));
      float d = rand(i + vec2(1.0, 1.0));
      vec2 cb = f * f * (3.0 - 2.0 * f);
    
      return mix(a, b, cb.x) + (c - a) * cb.y * (1.0 - cb.x) + (d - b) * cb.x * cb.y;
    }
     
    // ********************************************************* //

    float fbm(in vec2 uv) {
      float r = 0.0;
      float scale = 1.0;  
      uv += time * 0.03;
      uv *= 2.0;
        
      for (int i = 0; i < ${this.OCTAVES(mode)}; i++) {
        r += fnoise(uv + time * 0.03) * scale;
        uv *= 3.0;
        scale *= 0.3;
      }
      return r;
    }
    
    // ********************************************************* //
    
    vec3 mist(in vec2 uv, in float r) {
      float mist = 0.0;
      ${this.MIST(mode)}
      return vec3(0.9, 0.85, 1.0) * mist;
    }
    
    // ********************************************************* //
    
    void main() {
      vec4 mask = texture2D(maskSampler, vUvsMask);
      vec3 col = mist(vUvs * 2.0 - 1.0, customTex ? mask.r : 0.0);
      float pb = smoothstep(0.0, 1.25, perceivedBrightness(col)) * 0.75;
      pb = 0.35 + smoothstep(0.0, 1.0, pb) * 0.25;
      gl_FragColor = vec4(mix(vec3(0.05, 0.05, 0.08), 
                          max(col + (customTex ? mask.r : 0.0) * 0.2, vec3(0.21, 0.21, 0.31)), pb) 
                     * (1.0 - smoothstep(0.0, 0.19, mask.b)), 1.0) 
                     * 0.75;
    }
    `;
  }

  /* ---------------------------------------- */

  /** @inheritdoc */
  static defaultUniforms = {
    tintAlpha: [1, 1, 1, 1],
    screenDimensions: [1, 1],
    maskSampler: 0,
    sampler: 0,
    time: 0,
    customTex: false
  };

  /* ---------------------------------------- */

  /**
   * Perform operations which are required before binding the Shader to the Renderer.
   * @param {SpriteMesh} mesh      The mesh linked to this shader.
   * @internal
   */
  _preRender(mesh) {
    const wof = canvas.primary.weather.weatherOcclusionFilter;
    if ( wof.enabled ) wof.enabled = false;
    this.uniforms.tintAlpha = mesh._cachedTint;
    this.uniforms.time = canvas.app.ticker.lastTime / 1000;
    this.uniforms.screenDimensions = canvas.screenDimensions;
  }
}
