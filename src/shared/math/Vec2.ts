export interface Vec2 {
  x: number
  y: number
}

export function add(a: Vec2, b: Vec2): Vec2 {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  }
}

export function sub(a: Vec2, b: Vec2): Vec2 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  }
}

export function scale(v: Vec2, scalar: number): Vec2 {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
  }
}

export function floor(v: Vec2): Vec2 {
  return {
    x: Math.floor(v.x),
    y: Math.floor(v.y),
  }
}
