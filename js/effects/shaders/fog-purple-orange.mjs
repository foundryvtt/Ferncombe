import HouseDividedShaderMixin from "./base/hd-sampler-shader.mjs";

/**
 * The House Divided Purple/Orange gradient fog.
 */
export default class PlanarFogShader extends HouseDividedShaderMixin(BaseSamplerShader) {

  /** @override */
  static classPluginName = null;

  /* -------------------------------------------- */

  static OCTAVES(mode) {
    return mode > 1 ? "4" : "3";
  }

  /* -------------------------------------------- */

  /** @override */
  static create(defaultUniforms) {
    const mode = canvas?.performance.mode ?? 2;
    const program = PIXI.Program.from(this.vertexShader, this.fragmentShader(mode));
    const uniforms = mergeObject(this.defaultUniforms, defaultUniforms, {inplace: false, insertKeys: false});
    return new this(program, uniforms);
  }

  /** @inheritdoc */
  static fragmentShader(mode) {
    return `
    precision ${PIXI.settings.PRECISION_FRAGMENT} float;
    uniform sampler2D sampler;
    uniform vec4 tintAlpha;
    uniform float time;
    varying vec2 vUvs;

    ${this.CONSTANTS}
    ${this.PERCEIVED_BRIGHTNESS}
    ${this.ROTATION}
    ${this.RAND_HD}

    const int OCTAVES = ${this.OCTAVES(mode)};
    const vec2 SHIFT = vec2(100.0, 100.0);
    const vec3 PURPLE = vec3(0.75, 0.0, 1.5);
    const vec3 ORANGE = vec3(1.0, 0.5, 0.0);
    const float COS05 = cos(0.5);
    const float SIN05 = sin(0.5);
    const mat2 ROTFBMR = mat2(COS05, SIN05, -SIN05, COS05) * 2.0;
     
    // ********************************************************* //
    
    float noise(in vec2 p) {
      vec2 ip = floor(p);
      vec2 u = fract(p);
      u = u * u * (3.0 - 2.0 * u);
    
      float res = mix(
                  mix(rand(ip), rand(ip + vec2(1.0,0.0)), u.x),
                  mix(rand(ip + vec2(0.0,1.0)), rand(ip + vec2(1.0,1.0)), u.x), u.y);
      return res * res;
    }

    // ********************************************************* //

    float fbmr(in vec2 uv) {
        float v = 0.0;
        float a = 0.5;
        for ( int i = 0; i < OCTAVES; ++i ) {
            v += a * noise(uv);
            uv = (uv * ROTFBMR) + SHIFT;
            a *= 0.5;
        }
        return v;
    }
    
    // ********************************************************* //
    
    vec3 fog(in vec2 uv) {
        vec3 color;
        vec2 q;
        vec2 str = uv - PIVOT;
        str *= 6.0;
        str *= rotation(time * 0.04); 
        str += PIVOT;
        q.x = fbmr(str - 0.2 + time * 0.07);
        q.x *= q.x;
        q.y = fract(q.x * 1.33);
        q.y *= q.y;
    
        float r;
        r = fbmr(str + 1.0 * q + 0.15 * time * 0.2);
        float f = fbmr(str - r - q.x + q.y);
        color = vec3(max(q.y, q.x), min(q.y, q.x), max(r, q.x));
        vec3 cloud = vec3((3.0 * f + 2.0 * f + f) * color);
        
        vec3 gcol = vec3(perceivedBrightness(cloud)) * 2.0;
        vec3 uvcol = mix(PURPLE, ORANGE, vUvs.x);
    
        return gcol * uvcol;
    }
    
    // ********************************************************* //
    
    void main() {
      vec4 baseColor = texture2D(sampler, vUvs);
      vec3 fog = fog(vUvs);
      float alpha = min(perceivedBrightness(fog * 6.0), 0.50);
      vec4 effects = vec4(fog, 1.0) * max(alpha, baseColor.a);
      baseColor.rgb = mix(baseColor.rgb, effects.rgb, alpha);
      gl_FragColor = mix(effects, baseColor, baseColor.a);
    }`;
  }

  /* ---------------------------------------- */
  /** @inheritdoc */
  static defaultUniforms = {
    tintAlpha: [1, 1, 1, 1],
    sampler: 0,
    time: 0
  };

  /* ---------------------------------------- */

  /**
   * Perform operations which are required before binding the Shader to the Renderer.
   * @param {SpriteMesh} mesh      The mesh linked to this shader.
   * @internal
   */
  _preRender(mesh) {
    this.uniforms.tintAlpha = mesh._cachedTint;
    this.uniforms.time = canvas.app.ticker.lastTime / 1000;
  }
}
