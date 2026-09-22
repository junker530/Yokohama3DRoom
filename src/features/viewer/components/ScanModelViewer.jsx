import "@google/model-viewer";
import ErrorMessage from "../../../components/common/ErrorMessage";
import { useModelViewer } from "../hooks/useModelViewer";
import ViewerLoading from "./ViewerLoading";

function ScanModelViewer({ location }) {
  const modelSource = location.modelUrl;
  const { modelViewerRef, isLoading, progress, error } = useModelViewer(modelSource);

  if (error) {
    return (
      <div className="viewer-stage viewer-stage--error">
        <ErrorMessage
          title="3Dモデルを読み込めませんでした"
          message="ファイルが存在しないか、ブラウザが3D表示に対応していない可能性があります。"
        />
      </div>
    );
  }

  return (
    <div className="viewer-stage">
      <model-viewer
        ref={modelViewerRef}
        class="scan-model-viewer"
        src={modelSource}
        alt={location.name}
        camera-controls
        touch-action="pan-y"
        shadow-intensity="1"
        exposure="1"
        interaction-prompt="none"
        loading="eager"
      />
      {isLoading && <ViewerLoading progress={progress} />}
    </div>
  );
}

export default ScanModelViewer;
