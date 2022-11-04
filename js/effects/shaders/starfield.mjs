import HouseDividedShaderMixin from "./base/hd-sampler-shader.mjs";

/**
 * The manorial #starfield far background
 */
export default class StarfieldShader extends HouseDividedShaderMixin(BaseSamplerShader) {

  /** @override */
  static classPluginName = null;

  /* -------------------------------------------- */

  static OCTAVES(mode) {
    return mode > 1 ? "4" : "3";
  }

  static NB_LAYERS(mode) {
    return mode > 1 ? "3.0" : "2.0";
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
  static fragmentShader(mode) {
    return `
    precision ${PIXI.settings.PRECISION_FRAGMENT} float;
    uniform sampler2D sampler;
    uniform vec4 tintAlpha;
    uniform float time;
    uniform float strength;
    uniform bool apocalypse;
    varying vec2 vUvs;

    ${this.CONSTANTS}
    ${this.PERCEIVED_BRIGHTNESS}
    ${this.ROTATION}
    ${this.RAND_HD}
    
    const float INVSIX = 1.0 / 6.0;
    const float NBLAYERS = ${this.NB_LAYERS(mode)};
    const int OCTAVES = ${this.OCTAVES(mode)};
            
    // ********************************************************* //
    
    float noise(in vec2 p) {
      vec2 ip = floor(p);
      vec2 u = fract(p);
      u = u * u * (3.0 - 2.0 * u);
    
      float res = mix(
                  mix(rand(ip), rand(ip + vec2(1.0,0.0)), u.x),
                  mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x), u.y);
      return res * res;
    }

    // ********************************************************* //
    
    float hash(in vec2 h) {    
      h = fract(h * vec2(201.34, 756.21));
      h += dot(h, h + 11.0194512);
      return fract(h.x * h.y);
    }

    vec3 hash(in vec3 h) {    
      h = fract(h * vec3(0.1543, 0.14369, 0.28787));
      h += dot(h, h.yxx + 11.0194512);
      return -1.0 + 2.0 * fract(vec3((h.x + h.y) * h.z, 
                                     (h.x + h.z) * h.y, 
                                     (h.y + h.z) * h.x));
    }
    
    // ********************************************************* //
    
    float voronoi(in vec2 n, in float t) {
      vec3 p = vec3(n.x, n.y, t);
  
      vec3 i = floor(p + (p.x + p.y + p.z) * INVTHREE);
      vec3 d0 = p - (i - (i.x + i.y + i.z) * INVSIX);
      
      vec3 e = step(vec3(0.0), d0 - d0.yzx);
      vec3 i1 = e * (1.0 - e.zxy);
      vec3 i2 = 1.0 - e.zxy * (1.0 - e);
      
      vec3 d1 = d0 - (i1 - 1.0 * INVSIX);
      vec3 d2 = d0 - (i2 - 2.0 * INVSIX);
      vec3 d3 = d0 - (1.0 - 3.0 * INVSIX);
      
      vec4 h = max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);
      vec4 q = h * h * h * h * vec4(dot(d0, hash(i)), dot(d1, hash(i + i1)), dot(d2, hash(i + i2)), dot(d3, hash(i + 1.0)));
      
      return dot(vec4(50.0), q);
    }
    
    // ********************************************************* //
  
    float star(in vec2 uv, in float flare) {
        vec2 uvs = uv;
        uvs *= rotation(time);
        float d = length(uvs);
        float m = 0.025 / d;  
        float rays = max(0.5, 1.0 - abs(uvs.x * uvs.y * 400.0)); 
        m += (flare * flare * rays * rays * rays) * 0.5;
        uv *= rotation(PI / 4.0);
        rays = max(0.0, 1.0 - abs(uvs.x * uvs.y * 100.0));
        m *= smoothstep(1.0, 0.2, d);
        return m;
    }

    // ********************************************************* //
  
    vec3 layer(in vec2 uv) {
        vec3 col = vec3(0.0);
        vec2 gv = fract(uv) - 0.5;
        vec2 id = floor(uv);
        
        for( int y=-1; y<=1; y++ ) {
            for( int x=-1; x<=1; x++ ) {
                vec2 offs = vec2(x, y);
                float n = hash(id + offs);
                float size = fract(n);
                float star = star(gv - offs - vec2(n, fract(n * 34.0)) + 0.5, smoothstep(0.85, 0.95, size) * 0.50);
                vec3 color = sin( vec3(1.2, 1.2, 1.2) * fract(n * 2.2) * TWOPI) * 0.95 + 0.95;
                color = color * vec3(0.9, 1.1, 0.8 + size);
                star *= sin(time * 1.0 + n * TWOPI) * 0.25 + 0.5;
                col += clamp(star * size * size * color + star * size * size, vec3(0.0), vec3(1.0));
            }
        }
        return col;
    }

    // ********************************************************* //
  
    vec3 starfield(in vec2 uv) {
        uv -= PIVOT;
        uv *= 4.0;
        uv *= rotation(time * 0.0125);
        uv += PIVOT;
        vec3 col = vec3(0);
        
        for( float i = 0.0; i < 1.0; i += 1.0 / NBLAYERS ) {
            float depth = fract(i);
            float scale = mix(20.0, 0.5, depth);
            float fade = depth * smoothstep(0.0, 1.0, depth);
            col += layer(uv * scale + i * 333.2 - time * 0.001) * fade;
        }
        return col;
    }
  
    // ********************************************************* //
    
    void main() {
      vec2 uv = vUvs;
      if ( apocalypse ) {
        uv -= PIVOT;
        float dist = length(uv);
        
        float sinVal = sin((-time * 0.5) + (dist * 10.0));
        float sinValNormalized = (sinVal * 0.5) + 0.5;
        float lerp = ((1.40 - 0.65) * sinValNormalized) + 0.65;
        
        float rotationAmount = strength * lerp;
        float sinX = sin ( rotationAmount );
        float cosX = cos ( rotationAmount );
        mat2 rotationMatrix = mat2( cosX, -sinX, sinX, cosX);
    
        uv = vec2(uv * rotationMatrix) * lerp; 
        uv += PIVOT;
      }
      gl_FragColor = vec4(starfield(uv), 1.0);
    }`;
  }

  /* ---------------------------------------- */
  /** @inheritdoc */
  static defaultUniforms = {
    tintAlpha: [1, 1, 1, 1],
    sampler: 0,
    time: 0,
    strength: 0.75,
    apocalypse: false
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
