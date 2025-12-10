// Configure transformers.js environment for browser use
export async function configureTransformers() {
  const { env } = await import('@xenova/transformers');

  // Set up environment for browser
  if (typeof window !== 'undefined') {
    env.allowLocalModels = false;
    env.allowRemoteModels = true;
    env.useBrowserCache = true;
    env.backends.onnx.wasm.proxy = true;
  }

  return { env };
}
