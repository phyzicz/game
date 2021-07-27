import { draw } from "./draw.js"
import { C, theme } from "./color.js"
import { style } from "./style.js"

import { controls } from "../game/controls.js"
import { Enemy } from "../game/enemy.js"
import { Game } from "../game/game.js"
import { stars } from "../game/stars.js"
import { game_start, game_menu } from "../game/start.js"
import { Thing } from "../game/thing.js"
import { things } from "../game/things.js"
import { Tower, towermap } from "../game/tower.js"
import { ThingStat, upgradekeys, upgradelevel } from "../game/thingstat.js"
import { wave } from "../game/wave.js"
import { waves } from "../game/waves.js"

import { math } from "../util/math.js"
import { random } from "../util/random.js"

import { config, category } from "../config/config.js"

export var ui = { }

if (true) {
  // 2 space indent!
}

const Common = Matter.Common,
      Vector = Matter.Vector

ui.vars = {
  // constants
  
  xp_bar_color: "#ff801f",
  
  health_heart_side_x: 25,
  health_heart_side_y: 20,
  health_heart_size: 20,
  health_text_size: 20,
  
  c_icon_purple: "#27007a",
  
  // change
  
  /* main */
  time: 0,
  click: false,
  hover: { x: 0, y: 0 },
  scroll: 0,
  clicktime: 0,
  hovertime: 0,
  hoverstring: "",
  
  /* game */
  xp_bar_xp: 0,
  xp_bar_show: 1,
  
  upgrade_ratios: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                   0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ],
  
  wave_show: 0,
  target_wave_show: 1,
  enemy_wave_done: true,
  
  waves_popup_text: [],
  waves_popup_text_show: false,
  waves_all_clear: false,
  waves_hover: -1,
  
  // show (overlay)
  upgrade_show: false, // upgrade overlay show
  tier_up_show: false, // tier up overlay show
  something_show: function() {
    const v = ui.vars
    return v.upgrade_show || v.tier_up_show || (v.waves_popup_text.length > 0)
  },
  
  enemy_texts: [ ],
  
  /* menu */
  menu_options_show: true,
  star_show: false,
  planet_show: false,
  current_star_key: "",
  
  planet_selected: -1,
  planet_sidebar: 0,
  planet_system_scale: 1,
  planet_system_target_scale: 1,
  
  end_of_ui_vars: "yes this is the end and there is no need for a comma after this"
}

ui.closeOverlay = function() {
  const v = ui.vars
  v.upgrade_show = false
  v.tier_up_show = false
  controls.setPaused(false)
}

ui.hitrect = function(pos, x, y, w, h) {
  return pos && ( pos.x >= x && pos.y >= y && pos.x <= x + w && pos.y <= y + h )
}

ui.hitoutsiderect = function(pos, x, y, w, h) {
  return pos && ( pos.x <= x || pos.x >= x + w || pos.y <= y || pos.y >= y + h )
}

ui.hitrectangle = function(pos, x, y, w, h) {
  return ui.hitrect(pos, x - w / 2, y - h / 2, w, h)
}

ui.hitrectpoints = function(pos, x1, y1, x2, y2) {
  return pos && ( pos.x >= x1 && pos.y >= y1 && pos.x <= x2 && pos.y <= y2 )
}

ui.hitcircle = function(pos, x, y, size, minSize = 0) {
  const dist = Vector.magnitudeSquared(Vector.sub(pos, Vector.create(x, y)))
  return pos && dist < size * size && dist > minSize * minSize
}

ui.keypress = {
  down: null,
  up: null,
  check: function(code, key) {
    return (
      code === key ||
      code === "Key" + key.toUpperCase() ||
      code === key[0].toUpperCase() + key.substring(1) ||
      code === "Digit" + key || 
      code === "Arrow" + key[0].toUpperCase() + key.substring(1)
    )
  }
}

ui.pressed = function(key) {
  const code = ui.keypress.down
  return ui.keypress.check(code, key)
}

ui.released = function(key) {
  const code = ui.keypress.up
  return ui.keypress.check(code, key)
}

ui.focused = true

ui.init = function(render) {
  let v = ui.vars,
      mouse = render.mouse,
      ctx = render.context
  ctx.lineCap = 'round'
  // basically a click
  window.addEventListener("mousemove", function(event) {
    v.hover = mouse.absolute
  })
  window.addEventListener("mouseup", function(event) {
    v.click = mouse.absolute
  })
  window.addEventListener("touchend", function(event) {
    v.click = mouse.absolute
  })
  window.addEventListener("keydown", function(event) {
    if (event.isComposing || event.keyCode === 229) {
      return;
    }
    ui.keypress.down = event.code
  })
  window.addEventListener("keyup", function(event) {
    ui.keypress.down = null
    ui.keypress.up = event.code
  })
  window.addEventListener("wheel", function(event) {
    console.log(event)
    const y = event.deltaY
    ui.vars.scroll = y / Math.abs(y)
  })
  document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "visible") {
      ui.focused = true
    } else {
      ui.focused = false
    }
  })
  // .
}

ui.tick = function() {
  const v = ui.vars,
        render = Thing.render,
        ctx = render.context
  // tick time!
  v.time++
  // that's all?
  // no!
  let target_ws = v.target_wave_show
  if (v.something_show()) {
    target_ws = 0
  }
  v.wave_show = math.lerp(v.wave_show, target_ws, 0.1)
  if (v.enemy_wave_done == false && !Enemy.waveOn()) {
    v.enemy_wave_done = true
    v.target_wave_show = 1
    waves.end()
  } else if (Enemy.waveOn()) {
    v.enemy_wave_done = false
  }
}

ui.tickAfter = function() {
  let v = ui.vars,
      render = Thing.render,
      ctx = render.context
  // clear click (and hover too?)
  if (v.click != false) {
    // increment click time
    v.clicktime++
  } else {
    v.clicktime = 0
  }
  v.click = false
  // clear keypress
  ui.keypress.up = null
  // clear scroll
  v.scroll = 0
}

ui.draw = function() {
  
  // tick!
  ui.tick()
  
  switch (Game.mode) {
    case "game":
      ui.drawGame()
      break
    case "menu":
      ui.drawMenu()
      break
  }
  
  // tick after!
  ui.tickAfter()
  
}

ui.drawMenu = function() {
  const v = ui.vars,
        render = Thing.render,
        ctx = render.context,
        _width = render.options.width,
        _height = render.options.height
  
  let mousepos = render.mouse.absolute,
      clickpos = v.click,
      x = 0,
      y = 0,
      size = 0,
      width = 0,
      height = 0
  
  
  // some large text
  draw.setFill(ctx, C.lightblue)
  draw.setStroke(ctx, C.darkblue)
  draw.setFont(ctx, "48px Roboto Condensed")
    draw._text(ctx, _width / 2, _height / 5, "LOREM IPSUM", ui.vars.time / 200, "center")
  
  
  
  
  // some options
  const options = {
    array: [
      { text: "Start",
        onclick: function() {
          v.star_show = true
          v.menu_options_show = false
        },
      },
      { text: "Upgrades",
        onclick: function() {
          // ?????
        },
      }
    ],
    font_size: 20,
    gap: 60,
  }
  if (v.menu_options_show) {
    y = _height / 2 - options.gap * options.array.length
    draw.setFont(ctx, options.font_size + "px Roboto Mono")
    for (let o of options.array) {
      const text = o.text,
            text_width = ctx.measureText(text).width,
            rect_width = text_width + options.gap,
            rect_height = options.font_size + options.gap * 0.2,
            hovering = ui.hitrectangle(mousepos, _width / 2, y, rect_width, rect_height),
            clicking = ui.hitrectangle(clickpos, _width / 2, y, rect_width, rect_height)
      // draw (rounded) rectangle
      if (hovering) {
        v.hovertime++
        v.hoverstring = "menu option " + text
        const hoverPercent = Math.min(100, v.hovertime * 7),
              hoverColor = chroma.mix("#b08819", "#b05f19", hoverPercent / 100, 'lch')
        draw.setFillDarkenStroke(ctx, hoverColor)
        mousepos = false
      } else {
        if (v.hoverstring === "menu option " + text) {
          v.hovertime = 0
          v.hoverstring = ""
        }
        draw.setFillDarkenStroke(ctx, "#b08819")
      }
      if (clicking) {
        draw.setFillDarkenStroke(ctx, "#b04419")
        o.onclick()
        clickpos = false
      }
      draw.setLineWidth(ctx, 6)
      draw._rectangle(ctx, _width / 2, y, rect_width, rect_height)
      draw.setFillNoStroke(ctx, "#ffe7a6")
      draw._text(ctx, _width / 2, y, text, 0, "center")
      y += options.gap
    }
  } // end menu options show
  
  // some stars?
  if (v.star_show) {
    // draw overlay
    draw.setFillNoStroke(ctx, C.cyan) // CONST star overlay rect color
    ctx.save() // save the canvas
    draw.setGlobalAlpha(ctx, 0.80) // CONST star overlay rect opacity
    const overlayTopGap = _height * 0.05, // CONST star overlay gap
          overlaySideGap = _width * 0.1,
          contentSideGap = _width * 0.05
      draw._rect(ctx, overlaySideGap, overlayTopGap, _width - overlaySideGap * 2, _height - overlayTopGap * 2)
    ctx.restore() // restore the canvas to just a few lines above
    // draw the star boxes!
    const boxSize = Math.min(80, _height * 0.2),
          boxGap = 20
    y = overlayTopGap + boxGap + boxSize / 2
    for (let star_key in stars.stars) {
      x = overlaySideGap + contentSideGap
      const star = stars.stars[star_key],
            unlocked = true
      if (star.secret) {
        continue
      }
      if (unlocked) {
        let boxColor = C.orange
        if (star.boxcolor != null) {
          boxColor = star.boxcolor
        }
        const boxHover = ui.hitrectangle(mousepos, _width / 2, y, _width - (overlaySideGap + contentSideGap) * 2, boxSize),
              boxClick = ui.hitrectangle(clickpos, _width / 2, y, _width - (overlaySideGap + contentSideGap) * 2, boxSize)
        if (boxHover) {
          v.hovertime++
          v.hoverstring = "star: " + star_key
          const hoverPercent = Math.min(50, v.hovertime * 4) // maximum 50 percent
          draw.setLightFill(ctx, boxColor, hoverPercent / 100)
          draw.setNoStroke(ctx)
        } else {
          if (v.hoverstring === "star: " + star_key) {
            v.hovertime = 0
            v.hoverstring = ""
          }
          draw.setFillNoStroke(ctx, boxColor)
        }
        if (boxClick) {
          v.star_show = false
          v.planet_show = true
          v.planet_selected = -1
          v.planet_sidebar = 0
          v.current_star_key = star_key
          v.planet_system_scale = star.pre_system_scale || 0.0001
          v.target_planet_system_scale = star.system_scale || 1
          clickpos = false
        }
        draw._rectangle(ctx, _width / 2, y, _width - (overlaySideGap + contentSideGap) * 2, boxSize)
        // draw star: (fit width = boxSize * 1.4)
        const starContentWidth = boxSize * 1.4
        x += starContentWidth / 2
        const realStarSize = boxSize * 0.6 * Math.pow(star.size, 0.5),
              dispStarSize = math.bound(realStarSize, boxSize * 0.1, boxSize * 0.9),
              cutoffRatio = dispStarSize / realStarSize // should be 1 most of the time...
        draw.setFillDarkenStroke(ctx, star.color)
        if (star.stroke != null) {
          draw.setStroke(ctx, star.stroke)
        }
        if (star.lineWidth != null) {
          draw.setLineWidth(ctx, star.lineWidth)
        } else {
          draw.setLineWidth(ctx, 4 * cutoffRatio) // can consider doing a Math.pow(cutoffRatio, 0.5) or something here
        }
        // draw the circle for the star!
        draw._circle(ctx, x, y, dispStarSize / 2)
        // draw the star text!
        x += starContentWidth / 2 + 5
        draw.setFillNoStroke(ctx, C.darkblue)
        draw.setFont(ctx, "28px Roboto Condensed")
        draw._text(ctx, x, y - 10, star.name, 0, "left")
        draw.setFillNoStroke(ctx, C.darkpurple)
        draw.setFont(ctx, "16px Roboto Condensed")
        draw._text(ctx, x, y + 20, star.description, 0, "left")
        // add a progress bar?
        // finally create a gap for the next box
        y += boxSize + boxGap
      } else {
        // locked
        draw.setFillNoStroke(ctx, C.locked)
        draw._rectangle(ctx, _width / 2, y, _width - (overlaySideGap - contentSideGap) * 2, boxSize)
        // TODO
        // finally create a gap for the next box (might be smaller than the unlocked star???)
        y += boxSize + boxGap
      }
    }
    
    if ( ui.released("escape") ||
         ui.hitoutsiderect(clickpos, overlaySideGap, overlayTopGap, _width - overlaySideGap * 2, _height - overlayTopGap * 2)
       ) {
      v.star_show = false
      v.menu_options_show = true
      clickpos = false
    } else if (ui.released("enter")) {
      // temporary, remove
      game_start("tut1")
    }
  } // end star show
  
  if (v.planet_show) {
    const star = stars.stars[v.current_star_key],
          planets = star.planets
    // if scrolled
    if (v.scroll && v.scroll != 0) {
      v.planet_system_target_scale *= Math.pow(0.9, v.scroll)
    }
    v.planet_system_scale = math.lerp(v.planet_system_scale, v.planet_system_target_scale, 0.1)
    // then get the planetary system's scale
    let scale = v.planet_system_scale
    // draw full black overlay
    draw.setFillNoStroke(ctx, C.black)
    if (star.background != null) {
      draw.setFillNoStroke(ctx, star.background)
    }
    draw._rect(ctx, 0, 0, _width, _height)
    // draw star in the middle
    const realStarSize = stars.c.star_size * star.size,
          dispStarWobble = stars.c.star_wobble * realStarSize * (star.wobble || 0),
          wobblePeriod = star.wobblePeriod || 10,
          dispStarSize = scale * (realStarSize + dispStarWobble * Math.sin(v.time / 60 / wobblePeriod))
    draw.setFillNoStroke(ctx, star.color)
    if (star.stroke != null) {
      draw.setStroke(ctx, star.stroke)
    }
    if (star.lineWidth != null) {
      draw.setLineWidth(ctx, star.lineWidth)
    } else {
      draw.setLineWidth(ctx, 0)
    }
    // draw the star circle!
    x = _width / 2 + v.planet_sidebar / 2
    y = _height / 2
    draw._circle(ctx, x, y, dispStarSize)
    let index = 0,
        clicked_on_orbit = false
    // draw the planets!
    for (let p of planets) {
      const planetName = star.name + star.postfix + p.name,
            realPlanetSize = stars.c.planet_size * p.size,
            dispPlanetSize = realPlanetSize * scale,
            realOrbitSize = stars.c.orbit_size * p.radius,
            dispOrbitSize = realOrbitSize * scale,
            realPeriod = stars.c.period_mult * p.period,
            frequency = 360 / realPeriod, // 2 * pi / T
            angle = math.degToRad((v.time / 60) * frequency * 360),
            // check mouse touching orbit
            hoverdistance = Math.max(dispOrbitSize * 0.1, 20),
            hovering = ui.hitcircle(mousepos, x, y, dispOrbitSize + hoverdistance, dispOrbitSize - hoverdistance), // max/min
            clicking = ui.hitcircle(clickpos, x, y, dispOrbitSize + hoverdistance, dispOrbitSize - hoverdistance)
      if (clicking) {
        v.planet_selected = index
        clickpos = false
        clicked_on_orbit = true
      }
      // draw orbit of planet
      if (hovering || v.planet_selected === index) {
        draw.setLightStroke(ctx, p.orbitColor || "#6e6e6e", 1)
        draw.setNoFill(ctx)
      } else {
        draw.setStrokeNoFill(ctx, p.orbitColor || "#6e6e6e")
      }
      draw.setLineWidth(ctx, p.orbitWidth || 2)
      draw._circle(ctx, x, y, dispOrbitSize)
      // draw planet
      draw.setFillNoStroke(ctx, p.color)
      if (p.stroke != null) {
        draw.setStroke(ctx, p.stroke)
      }
      if (p.lineWidth != null) {
        draw.setLineWidth(ctx, p.lineWidth)
      } else {
        draw.setLineWidth(ctx, 0)
      }
      const planetX = x + dispOrbitSize * Math.cos(angle),
            planetY = y + dispOrbitSize * Math.sin(angle)
      draw._circle(ctx, x + dispOrbitSize * Math.cos(angle), y + dispOrbitSize * Math.sin(angle), dispPlanetSize)
      if (v.planet_selected === index) {
        // draw planet popup (if needed)
        /*
        draw.setFont(ctx, "14px Roboto Mono")
        const strings = [
                "Name: " + p.full, // planet full name
                "Orbit Radius: " + math.roundBy(p.radius, 3) + "",
                "Radius: " + math.roundBy(p.size, 3) + "",
                "Period: " + math.roundBy(p.real_period, 3) + " days"
              ],
              stringColors = [
                C.darkgreen, "",
              ],
              maxLength = Math.max(...strings.map( str => {
                return ctx.measureText(str).width
              } )),
              popupTextGap = 5,
              popupWidth = maxLength + 20,
              popupHeight = popupTextGap * 3 + (14 + popupTextGap) * strings.length,
        let popupX = planetX - popupWidth / 2 + 10,
            popupY = planetY - dispPlanetSize - 20 - popupHeight
        // draw popup
        draw.setFillNoStroke(ctx, C.lightgrey)
        draw._rectangle(ctx, planetX, popupY + popupHeight / 2, popupWidth, popupHeight)
        for (let index = 0; index < strings.length; ++index) {
          const str = strings[index],
                strcolor = stringColors[index]
          draw.setFillNoStroke(ctx, strcolor)
          draw._text(ctx, popupX, popupY, str, 0, "left")
        }
        */
        // draw planet sidebar
      }
      // finally, increment planet index
      index++
    } // end of planet loop
    // move planet sidebar
    const planet_sidebar_move_rate = 0.1,
          planet_sidebar_target = _width * 0.3
    if (v.planet_selected >= 0) {
      v.planet_sidebar = math.lerp(v.planet_sidebar, planet_sidebar_target, planet_sidebar_move_rate)
    } else {
      v.planet_sidebar = math.lerp(v.planet_sidebar, 0, planet_sidebar_move_rate)
    }
    // draw planet sidebar
    if (Math.round(v.planet_sidebar) > 0) {
      // expected sidebar width
      width = planet_sidebar_target
      // check hover or click (the whole thing :O)
      let hovering = ui.hitrect(mousepos, 0, 0, v.planet_sidebar, _height),
          clicking = ui.hitrect(clickpos, 0, 0, v.planet_sidebar, _height),
          sidebar_center = v.planet_sidebar - width / 2
      if (clicking) {
        clicked_on_orbit = true
      }
      // draw sidebar background (dark grey, whole thing)
      draw.setFillNoStroke(ctx, C.darkgrey)
      draw._rect(ctx, 0, 0, v.planet_sidebar, _height)
      // draw planet information, if there is no planet selected, draw nothing
      if (v.planet_selected >= 0) {
        // get the currently selected planet
        const p = planets[v.planet_selected]
        // draw sidebar title
        draw.setFillNoStroke(ctx, C.lightgreen)
        draw.setFont(ctx, "18px Roboto Mono")
        draw._text(ctx, sidebar_center, _height * 0.1, star.name + star.postfix + p.name)
        // TODO
      } // end of planet information
    } // end planet sidebar
    // unselect selected planet if clicked on the space area
    if (!clicked_on_orbit && clickpos) {
      v.planet_selected = -1
    }
    if ( ui.released("escape") ) {
      v.star_show = true
      v.planet_show = false
      v.current_star_key = ""
      clickpos = false
    } else if ( ui.released("enter") ) {
      // nothing for now
    }
  } // end planet show
  
}

ui.drawGame = function() {
  
  // define common variables first
  
  const v = ui.vars,
        render = Thing.render,
        ctx = render.context,
        player = Tower.player,
        playerX = player.x,
        playerY = player.y,
        playerSize = player.size,
        playerType = player.type,
        playerStat = player.stat,
        _width = render.options.width,
        _height = render.options.height
  
  let mousepos = render.mouse.absolute,
      clickpos = v.click,
      stat = things[playerType],
      x = 0,
      y = 0,
      size = 0,
      width = 0,
      height = 0
  
  // there will be 5 spaces after every major section in this function
  
  
  
  
  
  // draw the xp bar
  
  if (true) {
    // bar vars
    let xp_show = v.xp_bar_show,
        xp = math.lerp(v.xp_bar_xp, player.xp, 0.05), // CONST xp bar lerp
        // whether the UI is currently still smoothing
        smoothing = ( Math.abs(player.xp - v.xp_bar_xp) >= 0.01 ) // CONST xp bar smooth threshold
    if (xp_show > 0 || smoothing) {
      // more mars bars- no, bar vars
      let color = v.xp_bar_color,
          level = math.towerlevel(Math.round(xp)),
          current = xp - math.towerxp(level),
          next = math.towerxpneeded(level),
          ratio = current / next
      const rBall = 15, // CONST xp ball radius
            xp_bar_side_x = 30
      x = _width - xp_bar_side_x * xp_show
      height = 0.5 * _height
      let y1 = _height / 2 - height / 2 - rBall * 2,
          y2 = y1 + height,
          mid = y2 - ratio * height,
          yBall = y2 + rBall
      v.xp_bar_xp = xp
      // draw! (remember to add ctx)
      draw.setFill(ctx, "transparent")
      draw.setLineWidth(ctx, 10)
      draw.setLightStroke(ctx, color)
        draw._line(ctx, x, y1, x, y2)
      draw.setLineWidth(ctx, 8)
      draw.setDarkStroke(ctx, color)
        draw._line(ctx, x, y1, x, y2)
      draw.setStroke(ctx, color)
        draw._line(ctx, x, mid, x, y2)
      // draw ball!
      draw.setLightFill(ctx, color)
      draw.setStroke(ctx, "transparent")
        draw._circle(ctx, x, yBall - 2, rBall)
      draw.setDarkFill(ctx, color)
      draw.setFont(ctx, "20px Roboto Condensed")
        draw._text(ctx, x, yBall, level + "", 0, "center")
      // check mouse!
      const xp_bar_side_x_mouse = 60
      if (smoothing || ( mousepos && mousepos.x > (_width - xp_bar_side_x_mouse * xp_show) && mousepos.y > y1 - 10 && mousepos.y < y2 )) {
        draw.setLightFill(ctx, color)
        draw.setFont(ctx, "15px Roboto Condensed")
          draw._text(ctx, x - 15, mid, math.number(current) + "/" + math.number(next), 0, "right")
      }
      if (mousepos && mousepos.x > (_width - xp_bar_side_x_mouse * xp_show) && mousepos.y > yBall - rBall && mousepos.y < yBall + rBall) {
        draw.setLightFill(ctx, color)
        draw.setFont(ctx, Math.floor(v.xp_text_font_size) + "px Roboto Condensed")
          draw._text(ctx, x - rBall - 15, yBall, "Level " + Math.round(level), 0, "right")
      }
    }
  }
  
  
  
  
  
  // draw planet health
  
  if (true) {
    const towerHealth = Tower.health
    x = _width - v.health_heart_side_x
    y = _height - 20 - v.health_heart_side_y
    size = v.health_heart_size
    draw.setFillNoStroke(ctx, C.deepred)
      draw._heart(ctx, x, y, size, size)
    draw.setTextLightFill(ctx, C.deepred)
    draw.setFont(ctx, Math.floor(v.health_text_size) + "px Roboto Condensed")
      draw._text(ctx, x - 15 - size / 2, y + 3, towerHealth + "", 0, "right")
  }
  
  
  
  
  
  // draw upgrade button at the side...
  
  if (!v.upgrade_show) {
    size = 16 // CONST upgrade button size
    x = _width - size - 11 // CONST upgrade button right side gap
    y = _height - size - 100 // CONST upgrade button 
    let color = C.button
    const mouseBoxSize = size * 1.1 // CONST upgrade button mouse box ratio
    if ( !v.something_show() && mousepos && Math.abs(mousepos.x - x) < mouseBoxSize && Math.abs(mousepos.y - y) < mouseBoxSize ) {
      size *= 1.0 // CONST upgrade button hover size change
      color = C.button_hover
      mousepos = false
    }
    if ( !v.something_show() && clickpos && Math.abs(clickpos.x - x) < mouseBoxSize && Math.abs(clickpos.y - y) < mouseBoxSize ) {
      v.upgrade_show = true
      controls.setPaused(true)
      clickpos = false
    }
    draw.setFillDarkenStroke(ctx, color)
    draw.setLineWidth(ctx, 3) // CONST tier up button border width
      draw._rectangle(ctx, x, y, size * 2, size * 2)
    // draw up symbol time
    const statSymbolSize = 0.6 // CONST upgrade button symbol size
    draw.setStrokeNoFill(ctx, C.darkpurple)
    draw.setLineWidth(ctx, 4) // CONST upgrade button symbol line width
    y += size * statSymbolSize
      draw._line(ctx, x, y, x, y - size * 1.2)
      draw._line(ctx, x - size * 0.4, y, x - size * 0.4, y - size * 0.45)
      draw._line(ctx, x + size * 0.4, y, x + size * 0.4, y - size * 0.85)
    y -= size * statSymbolSize
    // draw text
    if (playerStat.points > 0) {
      draw.setTextLightFill(ctx, "#5100ff") // CONST upgrade button text color (was #27007a without lightening)
      draw.setFont(ctx, "16px Roboto Condensed")  // CONST upgrade button text font
        draw._text(ctx, x - size - 8, y - size + 4, "x" + playerStat.points, math.degToRad(-10), "right")
    }
  }
  
  
  
  
  
  // draw upgrade overlay
  
  if (v.upgrade_show) {
    // draw translucent overlay rectangle
    draw.setFillNoStroke(ctx, "#99ff00") // CONST upgrade overlay rect color
    ctx.save() // save the canvas
    draw.setGlobalAlpha(ctx, 0.75) // CONST upgrade overlay rect opacity
    const overlayGap = 40 // CONST upgrade overlay gap
      draw._rect(ctx, overlayGap, overlayGap, _width - overlayGap * 2, _height - overlayGap * 2)
    ctx.restore() // restore the canvas to last save (above)
    // draw X button
    if (true) {
      const crossX = _width - overlayGap * 2.4,
            crossY = overlayGap * 2.4
      size = 10 // CONST upgrade overlay X button size
      draw.setStrokeNoFill(ctx, "#ff3333") // CONST upgrade overlay X button color
      draw.setLineWidth(ctx, 5)
        draw._line(ctx, crossX - size, crossY - size, crossX + size, crossY + size)
        draw._line(ctx, crossX + size, crossY - size, crossX - size, crossY + size)
      if ( // check whether the user presses the x button OR clicks the outside (hee)
           clickpos && ( 
           ( Math.abs(clickpos.x - crossX) < size * 2.5 && Math.abs(clickpos.y - crossY) < size * 2.5 ) ||
           ( clickpos.x < overlayGap || clickpos.y < overlayGap || clickpos.x > _width - overlayGap || clickpos.y > _height - overlayGap )
         ) ) {
        ui.closeOverlay()
        clickpos = false
      }
    }
    // draw title
    const top_text_angle = math.degToRad(1)           // CONST upgrade overlay title text tilt angle
                             * Math.sin(v.time / 100) // CONST upgrade overlay title text tilt speed
    draw.setFill(ctx, "#004708") // CONST upgrade overlay title text color (was #3d2200)
    draw.setStroke(ctx, "transparent")
    draw.setFont(ctx, "30px Roboto Mono") // CONST upgrade overlay title text font
    // CONST tier up title text position (x, y)
      draw._text(ctx, _width / 2, _height / 4, "Upgrade Yourself!", top_text_angle, "center")
    draw.setFont(ctx, "20px Roboto Condensed") // CONST upgrade overlay title text font
      draw._text(ctx, _width / 2, _height * 0.375, "Points remaining: " + playerStat.points, 0, "")
    // finally!
    // upgrade constant vars (all arrays)
    const upgradeList = config.upgradetext[playerStat.upgradetext],
          upgradeNumbers = playerStat.upgradeArray,
          upgradeColors = style.upgradetext,
          upgradeLength = upgradeList.length,
          oldratios = v.upgrade_ratios
    // vars that (can) change each loop (rather, *let*s that change every loop)
    let utext = "default stat name",
        unumber = 0,
        upgradeMax = 0,
        maxratio = 1,
        realLength = 0,
        ucolor = "#888888",
        ratio = 0,
        dispratio = 0,
        percentText = "0%",
        ygap = 6, // gap between rows
        hovering = false,
        clicking = false,
        hovering_ = false,
        clicking_ = false,
        clicked = -1,
        clicksign = 0
    
    x = _width / 3 - 10
    width = _width / 3 - 50
    height = 20 // height of each one
    ygap += height
    y = _height / 2 - (upgradeLength - 1) / 2
    // some SMALL loops
    for (let i = 0; i < upgradeLength; ++i) {
      if (upgradeList[i] !== "") {
        upgradeMax += upgradeNumbers[i] + 1
        ++realLength
      }
    }
    maxratio = Math.min(1, 2 / realLength)
    for (let i = 0; i < upgradeLength; ++i) {
      if (upgradeList[i] !== "") {
        ratio = (upgradeNumbers[i] + 1) / upgradeMax
        maxratio = Math.max(maxratio, ratio)
      }
    }
    // a HUGE loop
    for (let i = 0; i < upgradeLength; ++i) {
      if (upgradeList[i] === "") {
        continue
      }
      utext = upgradeList[i]
      ucolor = upgradeColors[i]
      unumber = upgradeNumbers[i] + 1
      ratio = unumber / upgradeMax
      const percentText = Math.round(ratio * 100) + "%"
      ratio = ratio / maxratio
      size = 10
      dispratio = math.lerp(oldratios[i] || 0, ratio, 0.07)
      oldratios[i] = dispratio
      
      // draw upgrade bar title
      draw.setTextDarkFill(ctx, ucolor)
      draw.setFont(ctx, "16px Roboto Condensed") // CONST upgrade bar text font
        draw._text(ctx, x - 20, y, utext, 0, "right")
      
      // upgrade bar button hover/click detection
      hovering = ui.hitcircle(mousepos, x, y, size + 2)
      hovering_ = ui.hitcircle(mousepos, x + 60, y, size + 3)
      clicking = ui.hitcircle(clickpos, x, y, size + 2)
      clicking_ = ui.hitcircle(clickpos, x + 60, y, size + 3)
      if (clicking) {
        clicked = i
        clicksign = 1
        clickpos = false
      } else if (clicking_) {
        clicked = i
        clicksign = -1
        clickpos = false
      }
      
      // draw upgrade plus/minus button circles
      draw.setLineWidth(ctx, 3)
      draw.setFillDarkenStroke(ctx, (hovering) ? "#46bf00" : ucolor)
        draw._circle(ctx, x, y, size)
      draw.setFillDarkenStroke(ctx, (hovering_) ? "#bf3600" : ucolor)
        draw._circle(ctx, x + 60, y, size)
      
      // draw upgrade number
      draw.setTextDarkFill(ctx, ucolor)
        draw._text(ctx, x + 30, y, unumber + "", 0, "center")
      
      // draw upgrade plus/minus signs
      size *= 0.6 // CONST upgrade bar plus/minus sign size ratio
      draw.setStrokeNoFill(ctx, "#006b07") // CONST upgrade bar plus color
        draw._line(ctx, x - size, y, x + size, y)
        draw._line(ctx, x, y - size, x, y + size)
      draw.setStrokeNoFill(ctx, "#6b0000") // CONST upgrade bar minus color
        draw._line(ctx, x + 60 - size, y, x + 60 + size, y)
      
      // draw bar
      x += 85 // CONST upgrade bar x-translate of bar
      
      draw.setFill(ctx, "transparent")
      draw.setDarkStroke(ctx, ucolor)
      draw.setLineWidth(ctx, 10) // CONST upgrade bar thicker line width
        draw._line(ctx, x, y, x + width, y)
      draw.setLightStroke(ctx, ucolor)
      draw.setLineWidth(ctx, 8) // CONST upgrade bar thinner line width
        draw._line(ctx, x, y, x + width, y)
      draw.setStroke(ctx, ucolor)
        draw._line(ctx, x, y, x + width * dispratio, y)
      
      // draw % text
      draw.setTextDarkFill(ctx, ucolor)
        draw._text(ctx, x + width + 15, y, percentText, 0, "left")
      
      x -= 85 // same as above
      
      y += ygap
    }
    
    if (clicked !== -1 && clicksign !== 0) {
      const index = clicked,
            key = upgradekeys[index],
            maxstat = /*upgradeMax[key]*/0 - 1,
            newstat = playerStat.upgrade[key] + clicksign
      if ( (newstat <= maxstat || maxstat === -1) && newstat >= 0 && playerStat.points >= clicksign) {
        playerStat.upgrade[key] = newstat
        playerStat.refreshPoints()
      } else {
        // todo invalid
      }
    }
    
  }
  
  
  
  
  
  // tier up button
  
  if (playerStat.canTierUp && !v.something_show()) {
    size = 14 // CONST tier up button size
    x = playerX
    y = playerY - playerSize - size - 20 // CONST tier up button-body gap
    let color = C.button // CONST tier up button color
    const mouseBoxSize = size * 1.1 // CONST tier up button mouse box ratio
    if ( mousepos && Math.abs(mousepos.x - x) < mouseBoxSize && Math.abs(mousepos.y - y) < mouseBoxSize ) {
      size *= 1.0 // CONST tier up button hover size change
      color = C.button_hover // CONST tier up button hover color (changed from #0095ff)
    }
    if ( clickpos && Math.abs(clickpos.x - x) < mouseBoxSize && Math.abs(clickpos.y - y) < mouseBoxSize ) {
      v.tier_up_show = true
      controls.setPaused(true)
      clickpos = false
    }
    draw.setFillDarkenStroke(ctx, color)
    draw.setLineWidth(ctx, 3) // CONST tier up button border width
    draw._rectangle(ctx, x, y, size * 2, size * 2)
    // draw up symbol time
    const upSymbolSize = 0.7, // CONST
          arrowSize = 0.5 // CONST
    draw.setFill(ctx, "transparent")
    draw.setStroke(ctx, C.darkpurple) // CONST tier up button symbol color (was #0c9400 and #ff7700)
    draw.setLineWidth(ctx, 3) // CONST tier up button symbol line width
    draw._line(ctx, x, y - size * upSymbolSize, x - size * arrowSize, y - size * (upSymbolSize - arrowSize))
    draw._line(ctx, x, y - size * upSymbolSize, x + size * arrowSize, y - size * (upSymbolSize - arrowSize))
    draw._line(ctx, x, y - size * upSymbolSize, x, y + size * upSymbolSize)
  }
  
  
  
  
  
  // tier up overlay
  
  if (v.tier_up_show) {
    // draw translucent overlay rectangle
    draw.setFillNoStroke(ctx, C.cyan) // CONST tier up overlay rect color
    ctx.save()
    draw.setGlobalAlpha(ctx, 0.75) // CONST tier up overlay rect opacity (was 0.6)
    const overlayGap = 50
      draw._rect(ctx, overlayGap, overlayGap, _width - overlayGap * 2, _height - overlayGap * 2)
    ctx.restore()
    // draw X button
    x = _width - overlayGap * 2
    y = overlayGap * 2
    size = 10 // CONST tier up overlay X button size
    draw.setStrokeNoFill(ctx, "#ff3333") // CONST tier up overlay X button color (was #cf0000)
    draw.setLineWidth(ctx, 5)
      draw._line(ctx, x - size, y - size, x + size, y + size)
      draw._line(ctx, x + size, y - size, x - size, y + size)
    if ( // check whether the user presses the x button OR clicks the outside
         clickpos && (
         ( Math.abs(clickpos.x - x) < size * 2.5 && Math.abs(clickpos.y - y) < size * 2.5 ) ||
         ( clickpos.x < overlayGap || clickpos.y < overlayGap || clickpos.x > _width - overlayGap || clickpos.y > _height - overlayGap )
       ) ) {
      ui.closeOverlay()
      clickpos = false
    }
    // draw title
    const top_text_angle = math.degToRad(4)         // CONST tier up title text tilt angle
                             * Math.sin(v.time / 30) // CONST tier up title text tilt speed
    draw.setFill(ctx, "#002620") // CONST tier up title text color (was #003d09)
    draw.setStroke(ctx, "transparent")
    draw.setFont(ctx, "30px Roboto Mono") // CONST tier up title text font
    // CONST tier up title text position (x, y)
      draw._text(ctx, _width / 2, _height / 4, "Choose an upgrade!", top_text_angle, "center")
    // some vars
    y = _height / 2 // CONST tier up circle y-position
    const choices = stat.displayUpgrades || ["G-0"], // ?
          choicesX = stat.upgrades || ["basic"], // ?
          choiceLength = choices.length,
          towerSizeRatio = 0.7, // CONST tier up circle size ratio (how much smaller?)
          circleSizes = []
    let hovered = -1,
        clicked = -1,
        maxSize = 0,
        sumSize = 0
    for (let i = 0; i < choiceLength; ++i) {
      const choice = choices[i],
            statSize = things[choicesX[i]].stat.size,
            circleSize = statSize / towerSizeRatio
      circleSizes.push(circleSize)
      sumSize += circleSize * 2 + 25 // CONST tier up circles gap (x)
      maxSize = Math.max(maxSize, circleSize)
    }
    x = _width / 2 - sumSize / 2 - 12.5
    size = 0
    const yText = y + maxSize + 20 // CONST tier up circle text gap (y)
    // draw circles
    for (let i = 0; i < choiceLength; ++i) {
      // x = _width / 2 + (i - (choiceLength - 1) / 2) * (size * 2 + 25)
      x += size + 25
      size = circleSizes[i]
      x += size
      const choice = choices[i],
            mouseBoxSize = 1.05, // CONST tier up circle mouse box size
            hovering = ui.hitcircle(mousepos, x, y, size * mouseBoxSize),
            clicking = ui.hitcircle(clickpos, x, y, size * mouseBoxSize)
      if (clicking) {
        clicked = i
      }
      if (hovering) {
        hovered = i
        draw.setFill(ctx, "#7547ff55") // CONST tier up circle hover color
      } else {
        draw.setFill(ctx, "transparent")
      }
      draw.setStroke(ctx, "#3f00de") // CONST tier up circle border color
      draw.setLineWidth(ctx, 5) // CONST tier up circle line width
        draw._circle(ctx, x, y, size)
        draw.tower(render, x, y, size * towerSizeRatio, choice) // CONST tier up circle tower size ratio
      draw.setFillNoStroke(ctx, "#4b00ad") // CONST tier up circle text
      draw.setFont(ctx, "20px Roboto Mono")
        draw._text(ctx, x, yText, choice, 0, "center")
    }
    if (hovered >= 0) {
      const choice = choices[hovered],
            text = things[choicesX[hovered]].description, // "Description for " + choice,
            fontSize = 20,
            fontGap = 24
      draw.setFillNoStroke(ctx, "#002620") // CONST tier up description heading text (#003d09)
      draw.setFont(ctx, fontSize + "px Roboto Condensed")
      const lines = draw.splitText(ctx, text, _width - overlayGap * 6),
            y = 3 * _height / 4 - (lines.length - 1) / 2 * fontGap
      let i = 0
      for (let line of lines) {
        draw._text(ctx, _width / 2, y + fontGap * i, line, 0, "center")
        ++i
      }
    }
    if (clicked >= 0) {
      player.remove()
      player.make(things[choicesX[clicked]])
      player.create()
      ui.closeOverlay()
      clickpos = false
    }
  }
  
  
  
  
  
  // enemy wave small button (top)
  
  if (!v.something_show()) {
    const waveshow = v.wave_show
    let buttoncolor = C.button
    x = _width / 2
    y = 0
    size = 30
    
    if (ui.hitrect(mousepos, x - size / 2, y - size / 2, size, size)) {
      buttoncolor = C.button_hover
      mousepos = false
    }
    if (ui.hitrect(clickpos, x - size / 2, y - size / 2, size, size)) {
      v.target_wave_show = 1 - v.target_wave_show
      clickpos = false
    }
    // draw button rectangle
    draw.setFillDarkenStroke(ctx, buttoncolor)
    draw.setLineWidth(ctx, 2)
      draw._rectangle(ctx, x, y, size, size)
    // draw symbol
    y += 2.5
    height = waveshow * 10
    draw.setStrokeNoFill(ctx, "#0c9400")
    draw.setLineWidth(ctx, 2)
      draw._line(ctx, x - 10, y + height, x, y + 10 - height)
      draw._line(ctx, x, y + 10 - height, x + 10, y + height)
  }
  
  
  
  
  
  // enemy waves (top)
  
  if (v.wave_show * 65 > 0.4) {
    // wave vars
    const W = waves.waves,
          waveoff = !Enemy.waveOn(),
          nextwave = waves.current + 1,
          waverashow = v.wave_show, // ray-show? get it?
          waveshow = waverashow * 65, // the real constant I will use (for y)
          wavecount = 5,
          playsize = waveoff ? 18 : 0,
          playgap = waveoff ? 25 : 0,
          playcolor = "#009c1d",
          barwidth = 250,
          totalwidth = barwidth + playsize * 2 + playgap,
          startX = (_width - totalwidth) / 2
    // draw wave stuff
    y = waveshow - 30
    x = startX
    // draw the LONG LINE
    draw.setStrokeNoFill(ctx, "#536150")
    draw.setLineWidth(ctx, 6)
      draw._line(ctx, x, y, x + barwidth, y)
    // draw wave circles and wave number
    // THE LARGE FOR LOOP
    for (let offset = -1; offset <= wavecount - 2; ++offset) { // only show current wave (-1) up to 3 waves after [next] (<= 3)
      const num = nextwave + offset,
            wave = W ? W.wave[num - 1] : null
      // if wave exists, draw the circle!
      if (wave != null) {
        size = (offset == 0) ? 16 : 10
        draw.setFillLightenStroke(ctx, "#cf0034") // todo
        draw.setLineWidth(ctx, 3)
        // check for hover
        if (ui.hitcircle(mousepos, x, y, size)) { // big if
          const rectextra = 10,
                rectheight = 50,
                rectgap = 25,
                enemySize = 15,
                enemyType = wave.type,
                enemyOptions = wave
          let xx = startX - rectextra,
              yy = y + rectgap,
              recttext = ""
          draw.setFillNoStroke(ctx, "#ff8d5c") // was #ff3d74
          ctx.save()
          draw.setGlobalAlpha(ctx, 0.8)
            draw._rect(ctx, xx, yy, barwidth + playsize + playgap + rectextra * 2, rectheight)
          ctx.restore()
          xx += enemySize + 10
          yy += rectheight / 2
          if (v.waves_hover !== num) {
            v.waves_hover = num
            Enemy.redrawEnemy(enemyType) // , enemyOptions ???
          }
          let rectenemy = Enemy.drawEnemy(render, xx, yy, enemySize, enemyType, enemyOptions)
          xx += enemySize + 10
          yy += 10
          recttext = "x" + wave.number
          draw.setFillNoStroke(ctx, "#73003b")
          draw.setFont(ctx, "16px Roboto Condensed")
            draw._text(ctx, xx, yy, recttext, 0, "left")
          xx += ctx.measureText(recttext).width + 10
          yy = y + rectgap + rectheight / 2
          recttext = wave.sep + " s apart"
          draw.setFillNoStroke(ctx, C.darkpurple)
          draw._text(ctx, xx, yy, recttext, 0, "left")
          
          // TODO here
          
          // set mousepos to false (in case (for whatever reason) 2 mouseboxes overlap)
          mousepos = false
          // and reset those stuff
          draw.setFillLightenStroke(ctx, "#cf00b3")
          draw.setLineWidth(ctx, 3)
        } // end of check for hover
        // anyway, draw the actual circle!
        if (offset == 0) {
            draw._circle(ctx, x, y, size)
          draw.setFillNoStroke(ctx, "#69ff69") // todo text color?
          draw.setFont(ctx, "16px Roboto Condensed")
            draw._text(ctx, x, y + 2, nextwave + "", 0, "center")
          draw.setTextLightFill(ctx, "#cf0034")
          draw.setFont(ctx, "12px Roboto Condensed")
            draw._text(ctx, x, y - size - 3, "next", 0, "bottom")
        } else {
          draw._circle(ctx, x, y, size / 2)
        }
        // check for click
        if (ui.hitcircle(clickpos, x, y, size)) {
          // CLICKED! do something? I think not (for now).
          clickpos = false
        }
      }
      // remember to increment x too!
      x += barwidth / (wavecount - 1)
    } // end of the LARGE FOR LOOP
    // draw the PLAY BUTTON
    if (waveoff) {
      x = startX + barwidth + playgap + playsize
      draw.setFillLightenStroke(ctx, playcolor)
      if (ui.hitcircle(mousepos, x, y, playsize)) {
        draw.setDarkFill(ctx, playcolor)
        mousepos = false
      }
      draw.setLineWidth(ctx, 3)
        draw._circle(ctx, x, y, playsize)
      draw.setLightStroke(ctx, playcolor)
      draw.setFill(ctx, "transparent")
        draw._polygon(ctx, [
          { x: x - playsize * 0.2, y: y - playsize * 0.3 },
          { x: x + playsize * 0.3, y: y },
          { x: x - playsize * 0.2, y: y + playsize * 0.3 },
        ])
      if (ui.hitcircle(clickpos, x, y, playsize)) {
        // start wave!
        waves.start()
        v.target_wave_show = 0
        clickpos = false
      }
    } // end draw the PLAY BUTTON
    // done with drawing enemy wave stuff?
  }
  
  
  
  
  
  // pre-wave texts
  
  if (v.waves_popup_text.length > 0) {
    if (!v.waves_popup_text_show) {
      v.waves_popup_text_show = true
      controls.setPaused(true)
    }
    // set font early
    draw.setFont(ctx, "16px Roboto Condensed")
    const originalText = v.waves_popup_text[0],
          maxWidth = Math.min(500, _width * 0.75),
          texts = draw.splitText(ctx, originalText, maxWidth),
          textSize = 16,
          textGap = 9,
          border = 20,
          circleSize = 40
    let rectwidth = maxWidth,
        rectheight = border * 2 + texts.length * (textSize + textGap) - textGap
    if (texts.length == 1) {
      const measured = ctx.measureText(texts[0])
      rectwidth = measured.width
    }
    rectwidth += border * 2 + circleSize
    // draw translucent pop-up rectangle
    draw.setFillNoStroke(ctx, "#9e87ff") // CONST text popup overlay rect color
    draw.setGlobalAlpha(ctx, 0.8) // CONST text popup rect opacity
      // draw a centered rect
      draw._rectangle(ctx, _width / 2, _height / 2, rectwidth, rectheight)
    draw.setGlobalAlpha(ctx, 1)
    x = (_width  - circleSize) / 2
    y = (_height - rectheight + textSize) / 2 + border
    for (let text of texts) {
      // draw text!
      draw.setTextDarkFill(ctx, "#002620")
        draw._text(ctx, x, y, text, 0, "center")
      y += textSize + textGap
    }
    x = (_width + rectwidth) / 2 - circleSize / 2
    y = _height / 2
    let buttonColor = C.button
    if (ui.hitcircle(mousepos, x, y, circleSize * 0.4)) {
      buttonColor = C.button_hover
      mousepos = false
    }
    draw.setFillDarkenStroke(ctx, buttonColor)
      draw._circle(ctx, x, y, circleSize * 0.375)
    if (v.waves_popup_text.length == 1) {
      draw.setTextDarkFill(ctx, "#002620")
      draw.setFont(ctx, "16px Roboto Condensed") // same
        draw._text(ctx, x, y + 2, "OK", 0, "center")
    } else {
      draw.setStrokeNoFill(ctx, C.darkpurple)
      draw.setLineWidth(ctx, 3)
        draw._line(ctx, x + circleSize * 0.17, y, x - circleSize * 0.15, y - circleSize * 0.17)
        draw._line(ctx, x + circleSize * 0.17, y, x - circleSize * 0.15, y + circleSize * 0.17)
    }
    if (
      ui.hitcircle(clickpos, x, y, circleSize * 0.4) ||
      ui.released("ArrowRight") ||
      ui.released("Enter")
    ) {
      v.waves_popup_text.splice(0, 1)
      if (v.waves_popup_text.length <= 0) {
        v.waves_popup_text_show = false
        controls.setPaused(false)
      }
      clickpos = false
    }
  }
  
  
  
  
  
  // enemy texts
  
  let i = 0
  for (let t of v.enemy_texts.slice()) {
    // lots of default values ahead!
    x = t.x
    y = t.y
    size = t.size
    draw.setFill(ctx, t.fill || t.color || "transparent")
    draw.setStroke(ctx, t.stroke || "transparent")
    draw.setLineWidth(ctx, t.lineWidth || 1)
    draw.setFont(ctx, Math.floor(size) + "px Roboto Condensed")
    ctx.save()
    draw.setGlobalAlpha(ctx, t.opacity || 1)
      draw._text(ctx, x, y, t.text, t.angle, "center")
    ctx.restore()
    if (t.time < v.time) {
      v.enemy_texts.splice(i, 1)
    }
    ++i
  }
  
  
  
  
  
  // huge pause overlay... (when the user actually pauses)
  
  if (controls.isPaused() && !v.something_show()) {
    // draw huge pause overlay
    draw.setFillNoStroke(ctx, "#cccccc") // white grey
    ctx.save()
    draw.setGlobalAlpha(ctx, 0.8)
      draw._rect(ctx, 0, 0, _width, _height)
    ctx.restore()
    draw.setFillNoStroke(ctx, "#444444") // black grey
    draw.setFont(ctx, "30px Roboto Mono")
      draw._text(ctx, _width / 2, _height / 3, "PAUSED", 0, "center")
    draw.setFont(ctx, "20px Roboto Mono")
      draw._text(ctx, _width / 2, _height / 2, "Click anywhere to play again", 0, "center")
    if (ui.hitrect(clickpos, 0, 0, _width, _height)) {
      controls.setPaused(false)
      clickpos = false
    }
    if (ui.released("escape")) {
      game_menu()
    }
  }
  
  
  
  
  
  // end of function
}
