import { Link } from "react-router-dom";
import IconButton from "../../../components/common/IconButton";
import ModelPreview from "../../viewer/components/ModelPreview";

function CloseIcon() {
  return <span aria-hidden="true" className="close-icon">×</span>;
}

function LocationMedia({ location }) {
  if (location.imageUrl) {
    return <img className="location-card__thumbnail" src={location.imageUrl} alt={location.name} loading="lazy" />;
  }

  if (location.modelUrl) {
    return <ModelPreview location={location} />;
  }

  return <div className="location-card__placeholder" aria-hidden="true">NO IMAGE</div>;
}

function LocationAddress({ location }) {
  return (
    <p className="location-card__address">
      {location.postalCode && <span>{location.postalCode}<br /></span>}
      {location.address}
    </p>
  );
}

function ScanLocationCard({ location, onClose }) {
  if (!location) return null;

  return (
    <article className="location-card" aria-label={`${location.name}の詳細`}>
      <IconButton className="location-card__close" label="地点情報を閉じる" onClick={onClose}>
        <CloseIcon />
      </IconButton>
      <Link className="location-card__thumbnail-link" to={`/scan/${location.id}`} aria-label={`${location.name}を3Dで見る`}>
        <LocationMedia location={location} />
      </Link>
      <div className="location-card__body">
        <p className="location-card__eyebrow">3D SCAN</p>
        <h2>{location.name}</h2>
        <p className="location-card__description">{location.description}</p>
        <LocationAddress location={location} />
        {location.modelUrl && <Link className="location-card__action" to={`/scan/${location.id}`}>
          3Dで見る
          <span aria-hidden="true">→</span>
        </Link>}
      </div>
    </article>
  );
}

export default ScanLocationCard;
