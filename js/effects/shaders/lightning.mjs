import HouseDividedShaderMixin from "./base/hd-sampler-shader.mjs";

/**
 * The House Divided Purple/Orange gradient fog.
 */
export default class LightningShader extends HouseDividedShaderMixin(BaseSamplerShader) {

  /** @override */
  static classPluginName = null;

  /** @inheritdoc */
  static fragmentShader = `
    precision ${PIXI.settings.PRECISION_FRAGMENT} float;
    uniform sampler2D sampler;
    uniform vec4 tintAlpha;
    uniform float ratiox;
    uniform float time;
    uniform bool isPurple;
    varying vec2 vUvs;

    ${this.CONSTANTS}
    ${this.PERCEIVED_BRIGHTNESS}
    ${this.CONSTANTS_CRYSTALS}
    ${this.SIMPLEX_3D}
    ${this.NOISE_SIMPLEX_3D}
    ${this.MATRIX}

    // ********************************************************* //
    
    vec3 bolt(in vec2 uv) {
        // compute distance from center
        uv = uv * 2.0 - 1.0;
        
        // distort on horizontal axis
        uv.y *= 0.25;
        vec3 pt = vec3(uv, time * 0.8);    
        
        // create coherent noise, diminished near the crystals
        float intensity = smoothstep(0.0, 0.2, vUvs.x) * noise(pt * 2.0 + 1.0);
       
        // create lightning                                         
        float y = clamp(abs(intensity * -0.2 + uv.y), 0.0, 1.0);
        float tr = smoothstep(ratiox - 0.2 * ratiox, ratiox, vUvs.x);
        float u = -pow(y, min(0.30 + tr * 0.15, 0.40));   
        vec3 col = vec3(1.2, 1.1, 1.25);
        col = col * u + col;                    
        col = col * col;

        // form the lightning levels
        col = pow(col, vec3(2.5));
        float p = perceivedBrightness(col);
        col = mix(col, vec3(1.0), p);
           
        // combining the texture with the bolts, and adjusting the conflicting area
        float fadey = smoothstep(0.2, 0.5 + intensity * 0.25, 1.0 - abs(uv.y * 4.0));
        return clamp(col, vec3(0.0), vec3(1.0)) * fadey;
    }
    
    // ********************************************************* //
    
    void main() {       
        // generating bolts
        vec3 bolts = bolt(vUvs);
        
        // get brightness of the bolts
        float br = perceivedBrightness(bolts);
        
        // mixing colors by position on x
        vec3 col = (isPurple ? PURPLE : ORANGE);
        
        // turning to white the hottest area of the bolts               
        col = mix(col, vec3(1.0), br * br);
        
        // add transparency when x tends to 1
        float tr = 1.0 - smoothstep(ratiox, ratiox + 0.1 * ratiox, vUvs.x);
        
        // returning the result adjusted by the color correction
        gl_FragColor = vec4(bolts * col * tr, 1.0);
    }
    `;

  /* ---------------------------------------- */
  /** @inheritdoc */
  static defaultUniforms = {
    tintAlpha: [1, 1, 1, 1],
    ratiox: 1,
    sampler: 0,
    time: 0,
    isPurple: true,
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
