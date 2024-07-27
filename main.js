/// <reference types="@webgpu/types" />
/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas")
/** @type {GPUCanvasContext} */
const context = canvas.getContext('webgpu')

const init = async () => {
  const adapter = await navigator.gpu?.requestAdapter()
  const device = await adapter?.requestDevice()
  if (!device) {
    console.error("Initialisation Failed!!!")
  }
  
  context.configure({
    device: device,
    format: navigator.gpu.getPreferredCanvasFormat(),
    alphaMode: 'premultiplied'
  })
  
  const shaderModule = device.createShaderModule({
    label: 'My very First Triangle(WebGPU) Shader',
    code: `
      @vertex fn vs(@builtin(vertex_index) vertexIndex :u32) -> @builtin(position ) vec4f{
        let vertices = array(
          vec2f(0.0,1.0),
          vec2f(-1.0,-1.0),
          vec2f(1.0,-1.0)
        );
        return vec4f(vertices[vertexIndex],0.0,1.0);
      }
      @fragment fn fs() -> @location(0) vec4f{
        return vec4f(1.0,0.5,0.5,1.0);
      }
    `
  })
  
  const renderPipeline = device.createRenderPipeline({
    label: 'My very First Triangle(WebGPU) Render Pipeline',
    layout: 'auto',
    vertex: {
      entryPoint: 'vs',
      module: shaderModule,
    },
    fragment: {
      entryPoint: 'fs',
      module: shaderModule,
      targets: [{
        format: navigator.gpu.getPreferredCanvasFormat()
      }]
    }
  })
  /** @type {GPURenderPassDescriptor} */
  const renderPassDescriptor = {
    label: 'My very First Triangle(WebGPU) Render Pass Descriptor',
    colorAttachments: [{
      clearValue: [0.3, 0.3, 0.3, 1.0],
      loadOp: 'load',
      storeOp: 'store'
    }]
  }
  
  const render = () => {
    renderPassDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView()
  
    const encoder = device.createCommandEncoder({
      label: 'My very First Triangle(WebGPU) Command Encoder',
    })
  
    const pass = encoder.beginRenderPass(renderPassDescriptor)
    pass.setPipeline(renderPipeline)
    pass.draw(3)
    pass.end()
  
    const commandBuffer = encoder.finish()
    device.queue.submit([commandBuffer])
  }
  
  render()
}

init()