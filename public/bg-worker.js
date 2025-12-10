// Background removal worker
import { AutoModel, AutoProcessor, RawImage, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/+esm';

// Configure for browser
env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

let model = null;
let processor = null;

self.addEventListener('message', async (e) => {
  const { type, data } = e.data;

  try {
    if (type === 'load') {
      self.postMessage({ type: 'progress', data: 'Loading model...' });

      const model_id = 'briaai/RMBG-1.4';

      model = await AutoModel.from_pretrained(model_id, {
        progress_callback: (progress) => {
          if (progress.status === 'progress' && progress.total) {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            self.postMessage({ type: 'progress', data: `Downloading: ${percent}%` });
          }
        },
      });

      processor = await AutoProcessor.from_pretrained(model_id);

      self.postMessage({ type: 'ready' });
    } else if (type === 'process') {
      if (!model || !processor) {
        throw new Error('Model not loaded');
      }

      self.postMessage({ type: 'progress', data: 'Processing image...' });

      const image = await RawImage.fromURL(data.imageUrl);

      const { pixel_values } = await processor(image);

      const { output } = await model({ input: pixel_values });

      const mask = await RawImage.fromTensor(
        output[0].mul(255).to('uint8')
      ).resize(image.width, image.height);

      // Convert to ImageData
      const canvas = new OffscreenCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');

      const imgCanvas = image.toCanvas();
      ctx.drawImage(imgCanvas, 0, 0);

      const pixelData = ctx.getImageData(0, 0, image.width, image.height);
      for (let i = 0; i < mask.data.length; ++i) {
        pixelData.data[4 * i + 3] = mask.data[i];
      }
      ctx.putImageData(pixelData, 0, 0);

      const blob = await canvas.convertToBlob({ type: 'image/png' });
      const url = URL.createObjectURL(blob);

      self.postMessage({ type: 'result', data: { url } });
    }
  } catch (error) {
    self.postMessage({ type: 'error', data: error.message });
  }
});
