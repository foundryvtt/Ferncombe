/**
 * The lightning and drifting rocks effects for the planar sanctum.
 * @extends {ParticleEffect}
 */
export default class PlanarSanctumLightningEffect extends ParticleEffect {

  /** @inheritdoc */
  static label = "House Divided";

  /**
   * Configuration for the particle emitter for planar sanctum lightning
   * @type {PIXI.particles.EmitterConfigV3}
   */
  static LIGHTNING_CONFIG = {
    behaviors: [
      {
        type: "alpha",
        config: {
          alpha: {
            list: [
              {time: 0.0, value: 0.00},
              {time: 0.3, value: 0.50},
              {time: 0.4, value: 1.00},
              {time: 0.5, value: 0.90},
              {time: 0.6, value: 1.00},
              {time: 0.7, value: 0.75},
              {time: 0.9, value: 1.00},
              {time: 1.0, value: 0.00}]
          }
        }
      },
      {
        type: "scaleStatic",
        config: {min: 1.5, max: 4.0}
      }
    ],
    frequency: 1,
    lifetime: {min: 1.3, max: 2.7},
    pos: {x: 0, y: 0}
  };

  /**
   * Configuration for the particle emitter for rubbles
   * @type {PIXI.particles.EmitterConfigV3}
   */
  static ROCKS_CONFIG = {
    behaviors: [
      {
        type: "alpha",
        config: {
          alpha: {
            list: [
              {time: 0.000, value: 0.00},
              {time: 0.030, value: 1.00},
              {time: 0.970, value: 1.00},
              {time: 1.000, value: 0.00}]
          }
        }
      },
      {
        type: "color",
        config: {
          color: {
            list: [
              {time: 0.000, value: "ff7f00"},
              {time: 0.030, value: "ffffff"},
              {time: 0.970, value: "ffffff"},
              {time: 1.000, value: "7f00ff"}]
          }
        }
      },
      {
        type: "moveSpeedStatic",
        config: {min: 10, max: 50}
      },
      {
        type: "scaleStatic",
        config: {min: 0.1, max: 1.8}
      },
      {
        type: "rotation",
        config: {accel: 0, minSpeed: 2, maxSpeed: 30, minStart: 0, maxStart: 360}
      },
      {
        type: "textureRandom",
        config: {
          textures: [
            "modules/ferncombe/assets/effects/Stone_001.webp",
            "modules/ferncombe/assets/effects/Stone_002.webp",
            "modules/ferncombe/assets/effects/Stone_003.webp",
            "modules/ferncombe/assets/effects/Stone_004.webp"
          ]
        }
      }
    ],
    frequency: 0.01,
    lifetime: {min: 50, max: 100},
    pos: {x: 0, y: 0}
  };

  /**
   * Configuration for the particle emitter for rubbles sucked by the black hole
   * @type {PIXI.particles.EmitterConfigV3}
   */
  static SUCKED_ROCKS_CONFIG = {
    behaviors: [
      {
        type: "alpha",
        config: {
          alpha: {
            list: [
              {time: 0.00, value: 0.00},
              {time: 0.07, value: 1.00},
              {time: 0.80, value: 1.00},
              {time: 1.00, value: 0.00}
            ]
          }
        }
      },
      {
        type: "rotation",
        config: {accel: -40, minSpeed: 10, maxSpeed: 350, minStart: 180, maxStart: 180},
        order: 1
      },
      {
        type: 'moveSpeed',
        config: {
          speed: {
            list: [
              {time: 0, value: 50},
              {time: 1, value: 700}
            ],
            isStepped: false
          },
        }
      },
      {
        type: 'scale',
        config: {
          scale: {
            list: [
              {time: 0.00, value: 1.80},
              {time: 0.90, value: 1.00},
              {time: 1.00, value: 0.20}
            ],
            isStepped: false
          }
        }
      },
      {
        type: "textureRandom",
        config: {
          textures: [
            "modules/ferncombe/assets/effects/Stone_001.webp",
            "modules/ferncombe/assets/effects/Stone_002.webp",
            "modules/ferncombe/assets/effects/Stone_003.webp",
            "modules/ferncombe/assets/effects/Stone_004.webp"
          ]
        }
      }
    ],
    frequency: 0.01,
    lifetime: {min: 10.5, max: 10.5},
    pos: {x: 0, y: 0}
  };

  /* -------------------------------------------- */

  /** @inheritdoc */
  getParticleEmitters(options={}) {
    const d = canvas.scene.dimensions.sceneRect;

    // Create an emitter for lightning
    const lightningPurpleConf = foundry.utils.deepClone(this.constructor.LIGHTNING_CONFIG);
    lightningPurpleConf.maxParticles = 1;
    lightningPurpleConf.addAtBack = true;
    lightningPurpleConf.frequency = 1.5;
    lightningPurpleConf.behaviors.push({
      type: "textureRandom",
      config: {
        textures: [
          "modules/ferncombe/assets/effects/lightning-p-starfield-1.webp",
          "modules/ferncombe/assets/effects/lightning-p-starfield-2.webp",
          "modules/ferncombe/assets/effects/lightning-p-starfield-3.webp"
        ]
      }
    });
    lightningPurpleConf.behaviors.push({
      type: "spawnShape",
      config: {
        type: "torusExtended",
        data: {
          x: 6050, y: 6050, radius: 3000, innerRadius: 1500, affectRotation: true,
          minAngle: Math.PI / 2 + Math.PI / 6, maxAngle: Math.PI - (Math.PI / 3)
        }
      }
    });

    // Create an emitter for lightning
    const lightningOrangeConf = foundry.utils.deepClone(this.constructor.LIGHTNING_CONFIG);
    lightningOrangeConf.maxParticles = 1;
    lightningOrangeConf.addAtBack = true;
    lightningOrangeConf.frequency = 1.2;
    lightningOrangeConf.behaviors.push({
      type: "textureRandom",
      config: {
        textures: [
          "modules/ferncombe/assets/effects/lightning-o-starfield-1.webp",
          "modules/ferncombe/assets/effects/lightning-o-starfield-2.webp",
          "modules/ferncombe/assets/effects/lightning-o-starfield-3.webp"
        ]
      }
    });
    lightningOrangeConf.behaviors.push({
      type: "spawnShape",
      config: {
        type: "torusExtended",
        data: {
          x: 6050, y: 6050, radius: 3000, innerRadius: 1500, affectRotation: true,
          minAngle: 1.5 * Math.PI + Math.PI / 6, maxAngle: Math.PI - (Math.PI / 3)
        }
      }
    });

    let rubbleConf;
    if ( !options.shattered ) {
      // Create a second emitter for drifting rocks
      rubbleConf = foundry.utils.deepClone(this.constructor.ROCKS_CONFIG);
      rubbleConf.maxParticles = 400;
      rubbleConf.frequency = 0.001;
      rubbleConf.behaviors.push({
        type: "spawnShape",
        config: {
          type: "rect",
          data: {x: d.x, y: d.y, w: d.width, h: d.height}
        }
      });
    }
    else {
      // Create a second emitter for drifting rocks sucked by the vortex
      rubbleConf = foundry.utils.deepClone(this.constructor.SUCKED_ROCKS_CONFIG);
      rubbleConf.maxParticles = 300;
      rubbleConf.frequency = 0.1;
      rubbleConf.behaviors.push({
        type: "spawnShape",
        config: {
          type: "torus",
          data: {x: 6050, y: 6050, radius: 4000, innerRadius: 4000, affectRotation: true}
        }
      });
    }

    // Return both emitters
    return [this.createEmitter(rubbleConf),
      this.createEmitter(lightningPurpleConf),
      this.createEmitter(lightningOrangeConf)];
  }
}
