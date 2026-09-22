import { Link } from "react-router-dom";

function BackIcon() {
  return <span className="back-icon" aria-hidden="true">←</span>;
}

function ViewerHeader({ title }) {
  return (
    <header className="viewer-header">
      <Link className="viewer-header__back" to="/">
        <BackIcon />
        <span>地図に戻る</span>
      </Link>
      <h1>{title}</h1>
    </header>
  );
}

export default ViewerHeader;
