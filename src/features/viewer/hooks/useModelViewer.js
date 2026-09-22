import { useEffect, useRef, useState } from "react";

export function useModelViewer(src) {
  const modelViewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(Boolean(src));
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(Boolean(src));
    setProgress(0);
    setError(src ? null : "3Dモデルのパスが設定されていません。");
  }, [src]);

  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    if (!modelViewer || !src) return undefined;

    const handleLoad = () => {
      setProgress(1);
      setIsLoading(false);
    };
    const handleProgress = (event) => {
      const nextProgress = event.detail?.totalProgress;
      if (typeof nextProgress === "number") setProgress(nextProgress);
    };
    const handleError = () => {
      setIsLoading(false);
      setError("3Dモデルを読み込めませんでした。");
    };

    modelViewer.addEventListener("load", handleLoad);
    modelViewer.addEventListener("progress", handleProgress);
    modelViewer.addEventListener("error", handleError);

    return () => {
      modelViewer.removeEventListener("load", handleLoad);
      modelViewer.removeEventListener("progress", handleProgress);
      modelViewer.removeEventListener("error", handleError);
    };
  }, [src]);

  return { modelViewerRef, isLoading, progress, error };
}
