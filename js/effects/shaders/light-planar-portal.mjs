import HouseDividedShaderMixin from "./base/hd-sampler-shader.mjs";

/**
 * Planar Portal coloration light source animation.
 */
class PlanarPortalColorationShader extends HouseDividedShaderMixin(AdaptiveColorationShader) {
  static fragmentShader = `
  ${this.SHADER_HEADER}
  ${this.PRNG}
  ${this.NOISE}
  ${this.FBM(4, 1.0)}
  ${this.PERCEIVED_BRIGHTNESS}
  ${this.CONSTANTS_CRYSTALS}
  ${this.SIMPLEX_3D}
  ${this.NOISE_SIMPLEX_3D_HIGH}
  ${this.CLIP}
  ${this.VORTEX}
  ${this.INV_BILINEAR}
  ${this.BOLT}

  void main() {
    ${this.FRAGMENT_BEGIN}
    // Rotate uvs and invert Y axis 
    float cost = cos(rotation);
    float sint = sin(rotation);
    mat2 rotMat = mat2(cost, -sint, sint, cost);
    
    vec2 iUvs = ((vUvs - PIVOT) * rotMat) + PIVOT;
    iUvs.y = (1.0 - iUvs.y);
    
    // Create perspective => top down
    vec2 perspectiveUv = invBilinear( iUvs, vec2(0.00, 0.60), vec2(1.00, 0.60), 
                                            vec2(0.85, 0.40), vec2(0.15, 0.40) );
    
    // Create distance variables and fade values
    float dst2 = length(perspectiveUv * 2.0 - 1.0);
    float fade = clamp(1.0 - dst2 * dst2, 0.0, 1.0);
    float fdist = clamp(1.0 - dist, 0.0, 1.0);  
      
    // Timed values
    float t = time * 0.5;
    cost = cos(t);
    sint = sin(t);

    // Rotation matrix
    rotMat = mat2(cost, -sint, sint, cost);
      
    // Create vortex uv with perspective uv
    vec2 vortexUv = vortex(perspectiveUv, dst2, 1.0, rotMat);
        
    // Create vortex colors
    vec3 vortex = spice(vortexUv, rotMat);
    vec3 vortexBolt = bolt(vortexUv) * 12.0;
    vortex += vortexBolt;
    vortex *= smoothstep(0.75, 0.9, 0.6 + iUvs.y * 0.4) * 4.0;
    
    // Colorize with the purple orange gradient  
    vec3 greyCol = vec3(perceivedBrightness(vortex) * 1.5);
    float colorBr = smoothstep(0.85, 0.90, perceivedBrightness(color));
    vec3 actualColor = mix(mix(PURPLE, ORANGE, 0.2 + iUvs.x), color, 1.0 - colorBr);
    vec3 colorized = greyCol * actualColor * fdist * getClip(perspectiveUv) * fade;
    
    // Create the central bolt
    vec2 centralBoltUv = vec2(iUvs.y + 0.5, iUvs.x);
    float timeRndSync = mod(time + random(vec2(time)), 2.0);
    vec3 centralBolt = bolt(centralBoltUv) 
                       * (1.0 - smoothstep(0.48, 0.5, iUvs.y)) 
                       * smoothstep(0.75, 1.0, iUvs.y - timeRndSync + 0.5) 
                       * fdist * VLIGHT * 2.0;
              
    // Add central bolt to the colorized vortex          
    colorized += (centralBolt * mix(centralBolt, vec3(1.0), 1.0 - colorBr) * 2.0);
    
    // Output the final vortex color
    finalColor = colorized * color * colorationAlpha;
    ${this.COLORATION_TECHNIQUES}
    ${this.ADJUSTMENTS}  
    ${this.FALLOFF}
    ${this.FRAGMENT_END}
  }`;
}

/* -------------------------------------------- */

/**
 * Planar Portal coloration light source animation.
 */
class PlanarPortalIlluminationShader extends HouseDividedShaderMixin(AdaptiveIlluminationShader) {
  static fragmentShader = `
  ${this.SHADER_HEADER}
  ${this.PRNG}
  ${this.NOISE}
  ${this.FBM(4, 1.0)}
  ${this.PERCEIVED_BRIGHTNESS}
  ${this.CONSTANTS_CRYSTALS}
  ${this.SIMPLEX_3D}
  ${this.NOISE_SIMPLEX_3D_HIGH}
  ${this.CLIP}
  ${this.VORTEX}
  ${this.INV_BILINEAR}
  ${this.BOLT}

  void main() {
    ${this.FRAGMENT_BEGIN}
    ${this.TRANSITION}
    // Rotate uvs and invert Y axis 
    float cost = cos(rotation);
    float sint = sin(rotation);
    mat2 rotMat = mat2(cost, -sint, sint, cost);
    
    vec2 iUvs = ((vUvs - PIVOT) * rotMat) + PIVOT;
    iUvs.y = (1.0 - iUvs.y);
    
    // Create perspective => top down
    vec2 perspectiveUv = invBilinear( iUvs, vec2(0.00, 0.60), vec2(1.00, 0.60), 
                                            vec2(0.85, 0.40), vec2(0.15, 0.40) );
    
    // Create distance variables and fade values
    float dst2 = length(perspectiveUv * 2.0 - 1.0);
    float fade = clamp(1.0 - dst2 * dst2, 0.0, 1.0);
    float fdist = clamp(1.0 - dist, 0.0, 1.0);  
      
    // Timed values
    float t = time * 0.5;
    cost = cos(t);
    sint = sin(t);

    // Rotation matrix
    rotMat = mat2(cost, -sint, sint, cost);
      
    // Create vortex uv with perspective uv
    vec2 vortexUv = vortex(perspectiveUv, dst2, 1.0, rotMat);
        
    // Create vortex colors
    vec3 vortex = spice(vortexUv, rotMat) * 4.0;
    vec3 vortexBolt = bolt(vortexUv) * 18.0;
    vortex += vortexBolt;
    vortex *= smoothstep(0.75, 0.9, 0.6 + iUvs.y * 0.4) * 4.0;
    
    // Colorize with the purple orange gradient  
    float br = clamp(perceivedBrightness(vortex) * 2.0, 0.0, 1.0);
    vec3 greyCol = vec3(br) * fade * fdist * getClip(perspectiveUv);
    
    // Output the final vortex color
    float colorBr = smoothstep(0.85, 0.90, perceivedBrightness(color));
    vec3 actualColor = mix(mix(PURPLE, ORANGE, 0.2 + iUvs.x), color, 1.0 - colorBr);
    finalColor = darkness ? vec3(1.0) - greyCol : max(finalColor * greyCol * 2.0, finalColor) * actualColor;
    ${this.ADJUSTMENTS}
    ${this.FALLOFF}
    ${this.FRAGMENT_END}
  }`;
}

/* -------------------------------------------- */

/**
 * Emanate waves of light from the source origin point
 * @param {number} dt                         Delta time
 * @param {object} [options={}]               Additional options which modify the animation
 * @param {number} [options.speed=5]            The animation speed, from 1 to 10
 * @param {number} [options.intensity=5]        The animation intensity, from 1 to 10
 * @param {boolean} [options.reverse=false]     Reverse the animation direction
 */
function animatePortal(dt, {speed=5, intensity=5, reverse=false}={}) {

  // Determine the animation timing
  let t = canvas.app.ticker.lastTime;
  if ( reverse ) t *= -1;
  this.animation.time = ((speed * t)/5000) + this.animation.seed;

  // Rotation
  const rad = Math.toRadians(this.data.rotation);

  // Update uniforms
  const co = this.coloration;
  co.uniforms.intensity = intensity;
  co.uniforms.time = this.animation.time;
  co.uniforms.rotation = rad;
  const il = this.illumination;
  il.uniforms.intensity = intensity;
  il.uniforms.time = this.animation.time;
  il.uniforms.rotation = rad;
}

/* -------------------------------------------- */

/**
 * Default export object
 * @type {{Illumination: PlanarPortalIlluminationShader, Animation: animatePortal, Coloration: PlanarPortalColorationShader}}
 */
const PlanarPortalShader = {
  Coloration: PlanarPortalColorationShader,
  Illumination: PlanarPortalIlluminationShader,
  Animation: animatePortal
}
export default PlanarPortalShader;
