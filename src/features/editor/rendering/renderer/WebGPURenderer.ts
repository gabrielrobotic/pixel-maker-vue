import { d, tgpu, type TgpuRenderPipeline, type TgpuRoot } from 'typegpu'

export class WebGPURenderer {
  private readonly canvas: HTMLCanvasElement

  private adapter: GPUAdapter | null = null
  private device: GPUDevice | null = null
  private context: GPUCanvasContext | null = null
  private format: GPUTextureFormat | null = null

  private root: TgpuRoot | null = null
  private pipeline: TgpuRenderPipeline | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  async initialize(): Promise<void> {
    if (!navigator.gpu) {
      throw new Error('WebGPU is not supported by this browser.')
    }

    const adapter = await navigator.gpu.requestAdapter()

    if (!adapter) {
      throw new Error('Failed to request a WebGPU adapter.')
    }

    const device = await adapter.requestDevice()

    const context = this.canvas.getContext('webgpu')

    if (!context) {
      throw new Error('Failed to get WebGPU canvas context.')
    }

    const format = navigator.gpu.getPreferredCanvasFormat()

    context.configure({
      device,
      format,
      alphaMode: 'opaque',
    })

    const root = tgpu.initFromDevice({ device })

    const positions = tgpu.const(d.arrayOf(d.vec2f, 3), [
      d.vec2f(0.0, 0.6),
      d.vec2f(-0.6, -0.6),
      d.vec2f(0.6, -0.6),
    ])

    const pipeline = root.createRenderPipeline({
      primitive: {
        topology: 'triangle-list',
      },

      vertex: ({ $vertexIndex: index }) => {
        'use gpu'

        return {
          $position: d.vec4f(positions.$[index]!, 0.0, 1.0),
        }
      },

      fragment: () => {
        'use gpu'

        return d.vec4f(1.0, 0.2, 0.2, 1.0)
      },

      targets: {
        format,
      },
    })

    this.adapter = adapter
    this.device = device
    this.context = context
    this.format = format
    this.root = root
    this.pipeline = pipeline
  }

  render(): void {
    if (!this.device || !this.context) {
      throw new Error('WebGPU renderer has not been initialized.')
    }

    if (!this.pipeline) {
      throw new Error('WebGPU render pipeline has not been initialized.')
    }

    const commandEncoder = this.device.createCommandEncoder()

    const textureView = this.context
      .getCurrentTexture()
      .createView()

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: {
            r: 0.08,
            g: 0.08,
            b: 0.08,
            a: 1.0,
          },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    })

    this.pipeline.with(renderPass).draw(3)

    renderPass.end()

    this.device.queue.submit([commandEncoder.finish()])
  }
}
