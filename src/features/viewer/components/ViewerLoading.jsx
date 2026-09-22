import LoadingIndicator from "../../../components/common/LoadingIndicator";

function ViewerLoading({ progress }) {
  const percentage = Math.round(progress * 100);

  return (
    <div className="viewer-loading" aria-live="polite">
      <LoadingIndicator label="3Dモデルを読み込んでいます" />
      <p>3Dモデルを読み込んでいます…</p>
      {percentage > 0 && <span>{percentage}%</span>}
    </div>
  );
}

export default ViewerLoading;
