// Web Worker: roda os experimentos comparativos sem travar a interface.
import { runExperiments } from './runner.js';

self.onmessage = (e) => {
  try {
    const report = runExperiments({ ...e.data, onProgress: (p) => self.postMessage({ type: 'progress', ...p, last: undefined }) });
    self.postMessage({ type: 'done', report });
  } catch (err) {
    self.postMessage({ type: 'error', message: err?.message ?? String(err) });
  }
};
