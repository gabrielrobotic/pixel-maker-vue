export class WebGPURenderer {
  private readonly canvas: HTMLCanvasElement

  private adapter: GPUAdapter | null = null
  private device: GPUDevice | null = null
  private context: GPUCanvasContext | null = null
  private format: GPUTextureFormat | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
  }

  async initialize(): Promise<void> {
    if (!navigator.gpu) throw new Error('WebGPU is not supported by this browser.')

    const adapter = await navigator.gpu.requestAdapter()
    if (!adapter) throw new Error('Failed to request a WebGPU adapter.')

    const device = await adapter.requestDevice()

    const context = this.canvas.getContext('webgpu')
    if (!context) throw new Error('Failed to get WebGPU canvas context.')

    const format = navigator.gpu.getPreferredCanvasFormat()

    context.configure({
      device,
      format,
      alphaMode: 'opaque',
    })

    this.adapter = adapter
    this.device = device
    this.context = context
    this.format = format
  }

  render(): void {
    if (!this.device || !this.context) throw new Error('WebGPU renderer has not been initialized.')

    const commandEncoder = this.device.createCommandEncoder()

    const textureView = this.context.getCurrentTexture().createView()

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: {
            r: 0.08,
            g: 0.08,
            b: 0.08,
            a: 1,
          },
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    })

    renderPass.end()

    this.device.queue.submit([commandEncoder.finish()])
  }
}
