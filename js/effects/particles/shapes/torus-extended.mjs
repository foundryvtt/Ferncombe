/**
 * A class for spawning particles in a circle or ring.
 * Can optionally apply rotation to particles so that they are aimed away from the center of the circle.
 * This extended version handles limited spawn area angles.
 */
export default class TorusExtended {
  constructor({radius, x, y, innerRadius, affectRotation, minAngle, maxAngle}) {
    this.x = x || 0;
    this.y = y || 0;
    this.radius = radius;
    this.innerRadius = innerRadius || 0;
    this.rotation = !!affectRotation;
    this.minAngle = minAngle || 0;
    this.maxAngle = maxAngle || (Math.PI * 2);
  }

  static type = 'torusExtended';
  static editorConfig = null;

  /**
   * X position of the center of the shape.
   * @type {number}
   */
  x;

  /**
   * Y position of the center of the shape.
   * @type {number}
   */
  y;

  /**
   * Radius of circle, or outer radius of a ring.
   * @type {number}
   */
  radius;

  /**
   * Inner radius of a ring. Use 0 to have a circle.
   * @type {number}
   */
  innerRadius;

  /**
   * If rotation should be applied to particles.
   * @type {boolean}
   */
  rotation;

  /**
   * Minimum angular rotation for random generation (in radians).
   * @type {number}
   */
  minAngle;

  /**
   * Maximum angular rotation for random generation (in radians).
   * @type {number}
   */
  maxAngle;

  /**
   * Generate random positions in the shape.
   * @param {PIXI.particles.Particle} particle
   */
  getRandPos(particle) {
    // place the particle at a random radius in the ring
    if ( this.innerRadius !== this.radius ) {
      particle.x = (Math.random() * (this.radius - this.innerRadius)) + this.innerRadius;
    }
    else {
      particle.x = this.radius;
    }
    particle.y = 0;

    // rotate the point to a random angle in the circle
    const angle = Math.random() * this.maxAngle + this.minAngle;

    if ( this.rotation ) {
      particle.rotation += angle;
    }
    PIXI.particles.ParticleUtils.rotatePoint(angle, particle.position);

    // now add in the center of the torus
    particle.position.x += this.x;
    particle.position.y += this.y;
  }
}
