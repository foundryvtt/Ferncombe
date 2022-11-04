import HouseDividedShaderMixin from "./base/hd-sampler-shader.mjs";

/**
 * The House Divided Purple/Orange gradient fog.
 */
export default class ClashShader extends HouseDividedShaderMixin(BaseSamplerShader) {

  /** @override */
  static classPluginName = null;

  /** @inheritdoc */
  static fragmentShader = `
    precision ${PIXI.settings.PRECISION_FRAGMENT} float;
    uniform sampler2D sampler;
    uniform vec4 tintAlpha;
    uniform float time;
    uniform bool purpleDestroyed;
    uniform bool orangeDestroyed;
    varying vec2 vUvs;

    ${this.CONSTANTS}
    ${this.PERCEIVED_BRIGHTNESS}
    ${this.CONSTANTS_CRYSTALS}
    ${this.SIMPLEX_3D}
    ${this.NOISE_SIMPLEX_3D}
    ${this.MATRIX}

    // ********************************************************* //
    
    vec3 clash(in vec2 uv) {
        // compute distance from center
        uv = uv * 2.0 - 1.0;
        
        // distort on horizontal axis
        uv.y *= 0.5;
        float dist = length(uv);
        vec3 pt = vec3(uv, time);    
        
        // create coherent noise
        float intensity = noise(pt * 2.0 + 1.0) * 1.3;
       
        // create lightning                                         
        float y = clamp(abs(intensity * -0.2 + uv.y), 0.0, 1.0);
        float u = -pow(y, 0.30);   
        vec3 col = vec3(1.2, 1.1, 1.25);
        col = col * u + col;                    
        col = col * col;
        
        // create the conflicting area
        float ns = mix(1.0, 3.0, dist - 0.3);
        float nint = mix(intensity * 0.10, 0.0, dist);
        
        // form the lightning levels
        col = pow(col, vec3(2.5));
        float p = perceivedBrightness(col);
        col = mix(col, vec3(1.0), p);
        
        // texture incrustation
        vec4 tex = texture2D(sampler, vUvs) * 3.0 * intensity;              
 
        // combining the texture with the bolts, and adjusting the conflicting area
        return tex.rgb;
    }
    
    // ********************************************************* //
    
    void main() {
        // edge case to handle by discarding the entire texel
        if ( purpleDestroyed && orangeDestroyed ) discard;
        
        // generating bolts
        vec3 clashLightning = clash(vUvs);
        
        // get brightness of the bolts
        float br = perceivedBrightness(clashLightning);
        
        vec2 ruv = vUvs;
        ruv -= PIVOT;
        ruv = ruv * matrix(time, 1.0);
        ruv += PIVOT;
        
        // mixing colors by rotation
        vec3 col = mix(purpleDestroyed ? ORANGE : PURPLE,
                       orangeDestroyed ? PURPLE : ORANGE,
                       smoothstep(0.35, 0.65, ruv.x));
        
        // turning to white the hottest area of the bolts               
        col = mix(col, vec3(1.0), br * br);
        
        // returning the result adjusted by the color correction
        gl_FragColor = vec4(clashLightning * col, 1.0);
    }
    `;

  /* ---------------------------------------- */
  /** @inheritdoc */
  static defaultUniforms = {
    tintAlpha: [1, 1, 1, 1],
    sampler: 0,
    time: 0,
    purpleDestroyed: false,
    orangeDestroyed: false
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
