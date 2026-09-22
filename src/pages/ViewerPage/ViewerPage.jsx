import { Link, useParams } from "react-router-dom";
import ErrorMessage from "../../components/common/ErrorMessage";
import LoadingIndicator from "../../components/common/LoadingIndicator";
import ScanModelViewer from "../../features/viewer/components/ScanModelViewer";
import ViewerHeader from "../../features/viewer/components/ViewerHeader";
import { useLocation } from "../../features/locations/hooks/useLocation";
import "./ViewerPage.css";

function ViewerPage() {
  const { scanId } = useParams();
  const { location, isLoading, error } = useLocation(scanId);

  if (isLoading) {
    return (
      <main className="viewer-page viewer-page--loading">
        <LoadingIndicator label="地点情報を読み込んでいます" />
        <p>地点情報を読み込んでいます…</p>
      </main>
    );
  }

  if (error || !location || !location.modelUrl) {
    return (
      <main className="viewer-page viewer-page--error">
        <ErrorMessage
          title={location ? "3Dモデルがありません" : "地点が見つかりません"}
          message={error || "指定された地点には3Dモデルが登録されていません。"}
          action={<Link className="viewer-error__link" to="/">地図に戻る</Link>}
        />
      </main>
    );
  }

  return (
    <main className="viewer-page">
      <ViewerHeader title={location.name} />
      <ScanModelViewer location={location} />
      <p className="viewer-page__tip">ドラッグで回転、ホイールやピンチで拡大・縮小できます</p>
    </main>
  );
}

export default ViewerPage;
