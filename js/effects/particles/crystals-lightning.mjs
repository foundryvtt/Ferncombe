/**
 * The lightning and drifting rocks effects for the planar sanctum.
 * @extends {ParticleEffect}
 */
export default class PlanarSanctumCristalEffects extends ParticleEffect {

  /** @inheritdoc */
  static label = "House Divided";

  /**
   * Configuration for the particle emitter for purple cristal lightning
   * @type {PIXI.particles.EmitterConfigV3}
   */
  static LIGHTNING_PURPLE = {
    behaviors: [
      {
        type: "alpha",
        config: {
          alpha: {
            list: [
              {time: 0.00, value: 0.00},
              {time: 0.33, value: 1.00},
              {time: 0.50, value: 0.00},
              {time: 0.66, value: 1.00},
              {time: 1.00, value: 0.00}]
          }
        }
      },
      {
        type: 'scale',
        config: {
          scale: {
            list: [
              {time: 0.00, value: 0.20},
              {time: 1.00, value: 1.50}],
            isStepped: false
          }
        }
      },
      {
        type: "textureRandom",
        config: {
          textures: [
            "modules/ferncombe/assets/effects/Lightning_Cristal_Purple_001.webp",
            "modules/ferncombe/assets/effects/Lightning_Cristal_Purple_002.webp",
            "modules/ferncombe/assets/effects/Lightning_Cristal_Purple_003.webp"
          ]
        }
      }
    ],
    frequency: 1,
    lifetime: {min: 0.2, max: 1.5},
    pos: {x: 0, y: 0}
  };

  /**
   * Configuration for the particle emitter for orange cristal lightning
   * @type {PIXI.particles.EmitterConfigV3}
   */
  static LIGHTNING_ORANGE = {
    behaviors: [
      {
        type: "alpha",
        config: {
          alpha: {
            list: [
              {time: 0.00, value: 0.00},
              {time: 0.33, value: 1.00},
              {time: 0.50, value: 0.00},
              {time: 0.66, value: 1.00},
              {time: 1.00, value: 0.00}]
          }
        }
      },
      {
        type: 'scale',
        config: {
          scale: {
            list: [
              {time: 0.00, value: 0.20},
              {time: 1.00, value: 1.50}],
            isStepped: false
          }
        }
      },
      {
        type: "textureRandom",
        config: {
          textures: [
            "modules/ferncombe/assets/effects/Lightning_Cristal_Orange_001.webp",
            "modules/ferncombe/assets/effects/Lightning_Cristal_Orange_002.webp",
            "modules/ferncombe/assets/effects/Lightning_Cristal_Orange_003.webp"
          ]
        }
      }
    ],
    frequency: 1,
    lifetime: {min: 0.2, max: 1.5},
    pos: {x: 0, y: 0}
  };

  /* -------------------------------------------- */

  /** @inheritdoc */
  getParticleEmitters(options) {
    const y = options.shattered ? 6000 : 4600;

    // Create an emitter for lightning
    const purpleCristalConf = foundry.utils.deepClone(this.constructor.LIGHTNING_PURPLE);
    purpleCristalConf.maxParticles = 48;
    purpleCristalConf.frequency = 1 / 48;
    purpleCristalConf.behaviors.push({
      type: "spawnShape",
      config: {
        type: "torus",
        data: {x: 5000, y, radius: 0, innerRadius: 0, affectRotation: true}
      }
    });

    // Create a second emitter for drifting rocks
    const orangeCristalConf = foundry.utils.deepClone(this.constructor.LIGHTNING_ORANGE);
    orangeCristalConf.maxParticles = 48;
    orangeCristalConf.frequency = 1 / 48;
    orangeCristalConf.behaviors.push({
      type: "spawnShape",
      config: {
        type: "torus",
        data: {x: 7000, y, radius: 0, innerRadius: 0, affectRotation: true}
      }
    });

    // Return both emitters
    return [this.createEmitter(purpleCristalConf), this.createEmitter(orangeCristalConf)];
  }
}
