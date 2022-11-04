/**
 * A mixin which decorates a BaseSamplerShader with some custom House Divided properties.
 * @category - Mixins
 * @param {typeof BaseSamplerShader} ShaderClass   The parent ShaderClass class being mixed.
 * @returns {typeof HouseDividedShaderMixin}       A Shader subclass mixed with HouseDividedShaderMixin features.
 */
const HouseDividedShaderMixin = ShaderClass => {
  class HouseDividedShaderMixin extends ShaderClass {

    static CONSTANTS_CRYSTALS = `
    const vec3 PURPLE = vec3(0.6, 0.0, 1.2);
    const vec3 ORANGE = vec3(1.0, 0.5, 0.0);
    const vec3 SPB = vec3(2.0 / 3.0, 1.0, 1.0 / 3.0);
    `;

    static SIMPLEX_3D = `
    vec4 permute(in vec4 x) {
        return mod(((x * 34.0) + 1.0) * x, 289.0);
    }
    
    vec4 taylorInvSqrt(in vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
    }

    float simplex3d(in vec3 v) { 
      const vec2  C = vec2(1.0 / 6.0, 1.0 / 3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 =   v - i + dot(i, C.xxx) ;
    
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
    
      vec3 x1 = x0 - i1 + 1.0 * C.xxx;
      vec3 x2 = x0 - i2 + 2.0 * C.xxx;
      vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    
    
      i = mod(i, 289.0 ); 
      vec4 p = permute( permute( permute( 
                 i.z + vec4(0.0, i1.z, i2.z, 1.0))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0)) 
               + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    
      float n_ = 1.0 / 7.0;
      vec3  ns = n_ * D.wyz - D.xzx;
    
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);  
    
      vec4 x = x_ * ns.x + ns.yyyy;
      vec4 y = y_ * ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
    
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
    
      vec4 s0 = floor(b0) * 2.0 + 1.0;
      vec4 s1 = floor(b1) * 2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
    
      vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww ;
    
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
    
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
    
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                    dot(p2,x2), dot(p3,x3) ) );
    }
    `;

    static NOISE_SIMPLEX_3D_HIGH = `
    float noise(in vec3 m) {
      return    0.64 * simplex3d(m)
              + 0.27 * simplex3d(7.0 * m)
              + 0.13 * simplex3d(11.0 * m)
              + 0.07 * simplex3d(19.0 * m);
    }
    `;

    static NOISE_SIMPLEX_3D = `
    float noise(in vec3 m) {
      return    0.64 * simplex3d(m)
              + 0.27 * simplex3d(1.5 * m)
              + 0.13 * simplex3d(4.0 * m)
              + 0.07 * simplex3d(8.0 * m);
    }
    `;

    static MATRIX = `
    mat2 matrix(in float r, in float scale) {
      float s = sin(r);
      float c = cos(r);
      return mat2(c + scale, -s , s , c + scale);
    }
    `;

    static ROTATION = `
    mat2 rotation(in float a) {
      float s = sin(a);
      float c = cos(a);
      return mat2(c, -s, s, c);
    }
    `;

    static INV_BILINEAR = `
    float bilinearCoord(in vec2 p0, in vec2 p1) { 
      return p0.x * p1.y - p0.y * p1.x;
    }

    vec2 invBilinear(in vec2 uv, in vec2 pa, in vec2 pb, in vec2 pc, in vec2 pd) {
      vec2 p0 = pb - pa;
      vec2 p1 = pd - pa;
      vec2 p2 = pa - pb + pc - pd;
      vec2 p3 = uv - pa;
          
      float bc0 = bilinearCoord(p3, p0);
      float bc1 = bilinearCoord(p0, p1) + bilinearCoord(p3, p2);
      float bc2 = bilinearCoord(p2, p1);
      float w = bc1 * bc1 - 4.0 * bc0 * bc2;
      
      if ( w < 0.0 ) return vec2(-1.0);
    
      w = sqrt(w);
        
      float v0 = (-bc1 - w) / (2.0 * bc2);
      float v1 = (-bc1 + w) / (2.0 * bc2);
      float u0 = (p3.x - p1.x * v0) / (p0.x + p2.x * v0);
      float u1 = (p3.x - p1.x * v1) / (p0.x + p2.x * v1);
      bool  b0 = v0 > 0.0 && v0 < 1.0 && u0 > 0.0 && u0 < 1.0;
      bool  b1 = v1 > 0.0 && v1 < 1.0 && u1 > 0.0 && u1 < 1.0;
      
      vec2 res = vec2(-1.0);
    
      if( b0 && !b1 ) res = vec2(u0, v0);
      if( !b0 && b1 ) res = vec2(u1, v1);
      
      return res;
    }
    `;

    static CLIP = `
    float getClip(in vec2 uv) {
      return step(3.5,
             step(0.0, uv.x) +
             step(0.0, uv.y) +
             step(uv.x, 1.0) +
             step(uv.y, 1.0));
    }
    `;

    static VORTEX = `
    vec2 vortex(in vec2 uv, in float dist, in float radius, in mat2 rotmat) {
      float intens = intensity * 0.2;
      vec2 uvs = uv - PIVOT;
      uv *= rotmat;
    
      if ( dist < radius ) {
        float sigma = (radius - dist) / radius;
        float theta = sigma * sigma * TWOPI * intens;
        float st = sin(theta);
        float ct = cos(theta);
        uvs = vec2(dot(uvs, vec2(ct, -st)), dot(uvs, vec2(st, ct)));
      }
      uvs += PIVOT;
      return uvs;
    }

    vec3 spice(in vec2 iuv, in mat2 rotmat) {
      // constructing the palette
      vec3 c1 = color * 0.9;
      vec3 c2 = color * 0.35;
      vec3 c3 = color * 0.95;
      vec3 c4 = color * 0.85;
      vec3 c5 = vec3(0.1);
      vec3 c6 = color;
  
      // creating the deformation
      vec2 uv = iuv;
      uv -= PIVOT;
      uv *= rotmat;
      vec2 p = uv.xy * 6.0;
      uv += PIVOT;
  
      // time motion fbm and palette mixing
      float q = fbm(p + time);
      vec2 r = vec2(fbm(p + q + time * 0.9 - p.x - p.y), 
                    fbm(p + q + time * 0.6));
      vec3 c = mix(c1, 
                   c2, 
                   fbm(p + r)) + mix(c3, c4, r.x) 
                               - mix(c5, c6, r.y);
      // returning the color
      return c;
    }
    `;

    static BOLT = `
    const vec3 VLIGHT = vec3(0.9, 0.7, 0.7);
  
    vec3 bolt(in vec2 uv) {
      // compute distance from center
      uv = uv * 2.0 - 1.0;
      
      // distort on horizontal axis
      uv.y *= 0.5;
      float dist = length(uv);
      vec3 pt = vec3(uv, time * 0.8);    
      
      // create coherent noise, diminished near the crystals
      float rdt = max(1.0 - dist, 0.0);
      float intens = rdt * noise(pt * 2.0 + 1.0) * 1.3;
     
      // create lightning                                         
      float y = clamp(abs(intens * -0.2 + uv.y), 0.0, 1.0);
      float u = -pow(y, 0.15);   
      vec3 col = vec3(1.1, 1.0, 1.15);
      col = col * u + col;                    
      col = col * col;
      
      // form the lightning levels
      col = pow(col, vec3(2.2));
      float p = (col.r + col.g + col.b) / 3.0;
      col = min(mix(col, vec3(1.0), p * 4.0), vec3(1.0));
      
  
      // combining the texture with the bolts, and adjusting the conflicting area
      return mix(col, vec3(0.0), 
                      smoothstep(0.95, 1.0, rdt - intens * 0.02));
                     
    }
    `;

    static RAND_HD = `
    float rand(in vec2 n) { 
      n = mod(n, 1000.0);
      return fract( dot(n, vec2(5.23, 2.89) 
                        * fract((2.41 * n.x + 2.27 * n.y)
                                 * 251.19)) * 551.83);
    }
    `
  }

  return HouseDividedShaderMixin;
};

export default HouseDividedShaderMixin;
