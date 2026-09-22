import "@google/model-viewer";

function ModelPreview({ location }) {
  if (!location?.modelUrl) return null;

  return (
    <model-viewer
      class="model-preview"
      src={location.modelUrl}
      alt={location.name}
      auto-rotate
      interaction-prompt="none"
      loading="lazy"
      reveal="auto"
    />
  );
}

export default ModelPreview;
