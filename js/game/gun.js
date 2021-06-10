// imports
import { stats, Stat } from "./stat.js"
import { category, config } from "../config/config.js"
import { style } from "../display/style.js"
import { draw } from "../display/draw.js"
import { Tower } from "./tower.js"
// drawing?

if (true) {
  // 2 spaces
}

var Body = Matter.Body,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint,
    Vector = Matter.Vector

export var guns = [ ] // Gun[]

export class Gun {
  // static
  static _count = 1
  static set = { } // to be filled later
  static create(tower, guntype) {
    return new Gun(tower, Gun.set[guntype])
  }
  
  // fields
  id = Gun._count++
  label = "Gun #" + this.id
  bulletcount = 1
  tower = null
  position = Vector.create(0, 0)
  size = Vector.create(0, 0)
  angle = 0
  shape = "rectangle"
  fill = "#a7a7af"
  stroke = "#a7a7af"
  aspects = { } // optional
  stat = new Stat(this)
  children = [ ] // Matter.Body[]
  shot = 0 // counter
  
  // constructor
  constructor(tower, location, stat) {
    guns.push(this)
    
    this.tower = tower
    this.setStat(stat)
    this.setLocation(location)
  }
  
  // get
  get realPosition() {
    if (this.size.x === 0) {
      let x = this.position.x * this.stat.size // difference!
      let y = this.position.y * this.tower.size * Gun.set.scale
      return Vector.create(
        y * Math.cos(this.direction) + x * Math.sin(this.direction),
        x * Math.cos(this.direction) + y * Math.sin(this.direction),
      )
    } else {
      let x = this.position.x * this.tower.size * Gun.set.scale
      let y = this.position.y * this.tower.size * Gun.set.scale
      return Vector.create(
        y * Math.cos(this.direction) + x * Math.sin(this.direction),
        x * Math.cos(this.direction) + y * Math.sin(this.direction),
      )
    }
  }
  get location() {
    return Vector.add(this.tower.position, this.realPosition)
  }
  get x() {
    return this.location.x
  }
  get y() {
    return this.location.y
  }
  get width() {
    return Math.max(this.size.x * this.tower.size * Gun.set.scale, this.stat.size)
  }
  get height() {
    return this.size.y * this.tower.size * Gun.set.scale
  }
  get direction() {
    return this.angle + this.tower.direction
  }
  get gunDifference() {
    return Vector.create(
      this.height * Math.cos(this.direction),
      this.height * Math.sin(this.direction)
    )
  }
  get gunEnd() {
    return Vector.add(this.location, this.gunDifference)
  }
  get gunMiddle() {
    return Vector.add(this.location, Vector.mult(this.gunDifference, 0.5))
  }
  
  // set
  
  // go!
  draw(render) {
    var ctx = render.context
    switch (this.shape) {
      case "rectangle":
        // todo
        draw.setFill(ctx, this.fill)
        draw.setStroke(ctx, this.stroke)
        draw.gun(render, this.gunMiddle.x, this.gunMiddle.y, this.height / 2, this.width, 1, this.direction)
        break
      case "circle": // a CIRCULAR gun???
        // todo
        break
    }
  }
  
  tick() {
    this.shot++
    if (this.tower.controlled) {
      // hmmm
    } else {
      if (this.shot >= this.stat.reloadFrames) {
        this.shot = 0
        this.shoot()
      }
    }
  }
  
  shoot() {
    var s = this.stat
    var b = Bodies.circle(this.gunEnd.x, this.gunEnd.y, s.size, {
      isStatic: false,
      label: "Bullet #" + (this.bulletcount++) + " from " + this.label,
      categoryFilter: category.yourBullet,
      render: style.tower.basic, // todo
      density: s.mass,
      friction: s.kineticFriction,
      frictionStatic: s.staticFriction,
      frictionAir: s.airResistance,
    })
    if (s.speed !== 0) {
      Body.setVelocity(b, Vector.mult(
        Vector.create( Math.cos(this.direction), Math.sin(this.direction) ),
        s.speed
      ))
    }
    if (s.inertia !== 1) {
      Body.setInertia(b, b.inertia * s.inertia) // works?
    }
    Composite.add(Tower.world, b)
    this.children.push(b)
  }
  
  setStat(s) {
    s = s || []
    this.stat.set(s)
  }
  
  setStatString(s) {
    s = s || []
    this.stat.setString(s)
  }
  
  setLocation(set) {
    this.position = Vector.create(set.x, set.y)
    this.size = Vector.create(set.w, set.h)
    this.angle = set.a || 0
    this.fill = style.gun[set.s] || set.s || "#a7a7af"
    this.stroke = set.stroke || this.fill
    this.shape = set.shape || "rectangle"
    this.aspects = set.aspects || { }
  }
  
  remove(removeFromArray = true) {
    if (removeFromArray) {
      const index = this.tower.guns.indexOf(this);
      if (index > -1) {
        this.tower.guns.splice(index, 1);
      }
    }
    for (let body of this.children) {
      Composite.remove(Tower.world, body)
    }
    this.tower = null
  }
}

Gun.set = {
  // overall gun scale
  scale: 0.1,
}

Gun.set.some_random_comments = {
  x: 0, // position.x (*)
  y: 0, // position.y (*)
  w: 0, // size.x (*)
  h: 10, // size.y (*)
  a: 0, // angle (default: 0)
  s: "#a7a7af", // fill style (default: "#a7a7af")
  stroke: null, // stroke style (default: same as fill style)
  shape: "", // shape (default: rectangle)
  aspects: { } // shape aspects (default: nothing)
}

Gun.set.default = {
  x: 0, y: 0, w: 0, h: 10, a: 0, shape: "rectangle",
}

Gun.set.basic = {
  x: 0, y: 0, w: 0, h: 10, a: 0, s: "basic",  
}

Gun.set.double_left = {
  x: -0.5, y: 0, w: 0, h: 10, a: 0, s: "double",
}

Gun.set.double_right = {
  x: 0.5, y: 0, w: 0, h: 10, a: 0, s: "double",
}
