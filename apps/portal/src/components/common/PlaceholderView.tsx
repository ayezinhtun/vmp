export const PlaceholderView = ({ title, description }: { title: string; description: string }) => (
  <div className="content">
    <div className="page-head">
      <h1 className="page-title">{title}</h1>
    </div>
    <div className="card">
      <div className="card-body">
        <div className="empty">
          <div className="title">{title}</div>
          <div className="sub">{description}</div>
        </div>
      </div>
    </div>
  </div>
)
