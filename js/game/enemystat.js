
export var enemystats = {
  base: { // base stats, all stats are multiplied by this
    control: "none", // controller of enemy...
    mass: 1, // mass of enemy
    speed: 1, // initial velocity of enemy
    size: 1, // size of enemy
    air: 1, // air resistance of enemy
    inertia: 1, // inertia of enemy
    gravity: 1, // gravity scale of enemy
    reward: 1,
    bonus: 1,
    damage: 1,
    guns: [ ],
  }, // end of base stats...
  // now for normal enemies
  ball: {
    control: "none",
    mass: 0.3,
    speed: 1,
    size: 13,
    air: 0.015,
    gravity: 0.05,
    reward: 11,
    bonus: 0.2,
    damage: 1,
  },
  // now for normal enemies
  asteroid: {
    control: "none",
    mass: 1,
    speed: 1,
    size: 14,
    air: 0.01,
    gravity: 0.1,
    reward: 10,
    bonus: 0.3,
    damage: 1,
  },
  // simple shooter enemies
  ballgun: {
    control: "aim_player",
    mass: 0.2,
    speed: 0.6,
    size: 21,
    air: 0.03,
    gravity: 0.05,
    reward: 21,
    bonus: 0.5,
    damage: 1.5,
    guns: [ { 
        set: {
          x: 0, y: 0, w: 0, h: 10, a: 0, d: 0,
          style: "ballgun",
        },
        stat: ["enemy", "enemyshooter", "ballgun"],
        options: { },
    }, ],
  },
}

export class EnemyStat {
  // static
  static stats = enemystats
  
  // fields
  level = 0
  mass = 1
  speed = 1
  size = 1
  air = 1
  gravity = 1
  reward = 1
  bonus = 1
  damage = 1
  difficulty = 1
  guns = [ ] // do not set...
  enemy = null // related enemy
  // create a fake "mult"
  mult = {
    size: 1,
    mass: 1,
    speed: 1,
    reload: 1,
    enemyspeed: 1,
    spread: 1,
    air: 1,
  }
  
  // constructor
  constructor(enemy) {
    this.enemy = enemy
    // this.refresh()
  }
  
  // get
  
  // set
  
  // go!
  setOptions(options) {
    const o = options
    this.difficulty = o.difficulty
    this.mass *= o.difficulty * o.mass || 1
    this.speed *= o.speed || 1
    this.size *= o.size || 1
    this.air *= o.air || 1
    this.gravity *= o.gravity || 1
    this.reward *= o.reward || 1
    this.bonus *= o.bonus || 1
    this.damage *= o.damage || 1
    if (o.bullet) {
      this.mult.size *= o.bullet.size || 1
      this.mult.mass *= o.bullet.mass || 1
      this.mult.speed *= o.bullet.speed || 1
      this.mult.reload *= o.bullet.reload || 1
      this.mult.spread *= o.bullet.spread || 1
      this.mult.air *= o.bullet.air || 1
    }
  }
  
  refresh() {
    this.setType(this.enemy.type)
  }
  
  setBase(s) {
    this.mass = s.mass || 1
    this.speed = s.speed || 1
    this.size = s.size || 1
    this.air = s.air || 1
    this.gravity = s.gravity || 1
    this.reward = s.reward || 1
    this.bonus = s.bonus || 1
    this.damage = s.damage || 1
      
    this.guns = s.guns || []
  }
  
  add(s) {
    this.mass *= s.mass || 1
    this.speed *= s.speed || 1
    this.size *= s.size || 1
    this.air *= s.air || 1
    this.gravity *= s.gravity || 1
    this.reward *= s.reward || 1
    this.bonus *= s.bonus || 1
    this.damage *= s.damage || 1
    
    this.guns = s.guns || []
  }
  
  // the real refresh function?
  setType(type) {
    // set base stats
    this.setBase(enemystats.base)
    // and then add some more stats
    var e = enemystats[type]
    this.enemy.controlType = e.control
    while (e != null) {
      this.add(e)
      e = enemystats[e.parent]
    }
    // init guns too
    this.enemy.removeAllGuns()
    for (let g of this.guns) {
      this.enemy.addGun(g.set, g.stat, g.options)
    }
  }
}
