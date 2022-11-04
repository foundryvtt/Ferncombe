import HouseDividedShaderMixin from "./base/hd-sampler-shader.mjs";

/**
 * The House Divided Purple/Orange gradient fog.
 */
export default class LightningClashShader extends HouseDividedShaderMixin(BaseSamplerShader) {

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
    
    vec3 bolt(in vec2 uv) {
        // compute distance from center
        uv = uv * 2.0 - 1.0;
        vec2 uvs = vUvs;
        uvs.y = ((vUvs.y - 0.5) * 0.5) + 0.5;
        
        // distort on horizontal axis
        uv.y *= 0.25;
        float dist = length(uv);
        vec3 pt = vec3(uv, time * 0.8);    
        
        // create coherent noise, diminished near the crystals
        float rdt = max(1.0 - dist, 0.0);
        float intensity = rdt * noise(pt * 2.0 + 1.0) * 1.3;
       
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
        vec4 tex = texture2D(sampler, uvs + vec2(intensity * 0.02)) * 4.0 * intensity;
                
        // if the purple crystal is destroyed, clear its color
        if ( purpleDestroyed ) {
          col = mix(vec3(0.0), col, smoothstep(0.45, 0.55, vUvs.x));
          tex.rgb = min(tex.rgb, col);
        }
        
        // if the orange crystal is destroyed, clear its color
        if ( orangeDestroyed ) {
          col = mix(col, vec3(0.0), smoothstep(0.45, 0.55, vUvs.x));
          tex.rgb = min(tex.rgb, col);
        }
        
        // combining the texture with the bolts, and adjusting the conflicting area
        return max( mix(col, 
                        vec3(0.0), 
                        smoothstep(0.6, 0.85, rdt * rdt - intensity * 0.02)),
                    tex.rgb);   
    }
    
    // ********************************************************* //
    
    void main() {
        // edge case to handle by discarding the entire texel
        if ( purpleDestroyed && orangeDestroyed ) discard;
        
        // generating bolts
        vec3 bolts = bolt(vUvs);
        
        // get brightness of the bolts
        float br = perceivedBrightness(bolts);
        
        // mixing colors by position on x
        vec3 col = mix(PURPLE, ORANGE, smoothstep(0.35, 0.65, vUvs.x));
        
        // turning to white the hottest area of the bolts               
        col = mix(col, vec3(1.0), br * br);
        
        // returning the result adjusted by the color correction
        gl_FragColor = vec4(bolts * col, 1.0);
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
