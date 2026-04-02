import './Skeleton.css';

export const Skeleton = ({ width = '100%', height = '20px', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton" style={{ width, height }} />
      ))}
    </>
  );
};

export const RecipeSkeleton = () => {
  return (
    <div className="recipe-skeleton">
      <Skeleton height="200px" />
      <div className="skeleton-content">
        <Skeleton height="20px" width="80%" />
        <Skeleton height="16px" width="100%" />
        <Skeleton height="16px" width="90%" />
        <Skeleton height="32px" width="100%" />
      </div>
    </div>
  );
};

export const SkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <RecipeSkeleton key={i} />
      ))}
    </div>
  );
};
