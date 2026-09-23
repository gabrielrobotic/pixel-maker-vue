import { invertMat3, type Mat3 } from './Mat3'
import type { Vec2 } from './Vec2'

export class Camera {
  public position: Vec2 = { x: 0, y: 0 }
  public zoom = 50

  public worldToScreen(world: Vec2, viewportWidth: number, viewportHeight: number): Vec2 {
    return {
      x: (world.x - this.position.x) * this.zoom + viewportWidth / 2,
      y: (world.y - this.position.y) * this.zoom + viewportHeight / 2,
    }
  }

  public screenToWorld(screen: Vec2, viewportWidth: number, viewportHeight: number): Vec2 {
    return {
      x: (screen.x - viewportWidth / 2) / this.zoom + this.position.x,
      y: (screen.y - viewportHeight / 2) / this.zoom + this.position.y,
    }
  }

  public worldToNdcMatrix(viewportWidth: number, viewportHeight: number): Mat3 {
    const scaleX = (2 * this.zoom) / viewportWidth
    const scaleY = (2 * this.zoom) / viewportHeight
    const translateX = -this.position.x * scaleX
    const translateY = this.position.y * scaleY
    return new Float32Array([scaleX, 0, 0, 0, scaleY, 0, translateX, translateY, 1])
  }

  public ndcToWorldMatrix(worldToNdc: Mat3): Mat3 {
    return invertMat3(worldToNdc)
  }

  public pan(delta: Vec2): void {
    this.position.x -= delta.x / this.zoom
    this.position.y -= delta.y / this.zoom
  }

  public zoomAt(screen: Vec2, factor: number, viewportWidth: number, viewportHeight: number): void {
    const worldBefore = this.screenToWorld(screen, viewportWidth, viewportHeight)

    this.zoom *= factor

    const worldAfter = this.screenToWorld(screen, viewportWidth, viewportHeight)

    this.position.x += worldBefore.x - worldAfter.x
    this.position.y += worldBefore.y - worldAfter.y
  }
}
