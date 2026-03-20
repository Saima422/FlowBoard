import './AuthArtwork.scss';

export function AuthArtwork() {
  return (
    <div className="auth-artwork">
      {/* Floating task cards clustered around the board */}
      <div className="art-float art-float-1" />
      <div className="art-float art-float-2" />
      <div className="art-float art-float-3" />
      <div className="art-float art-float-4" />
      <div className="art-float art-float-5" />
      <div className="art-float art-float-6" />
      <div className="art-float art-float-7" />
      <div className="art-float art-float-8" />
      <div className="art-float art-float-9" />
      <div className="art-float art-float-10" />
      <div className="art-float art-float-11" />

      {/* Central kanban board */}
      <div className="art-kanban">
        <div className="art-kanban-col">
          <div className="art-kanban-label">To Do</div>
          <div className="art-kanban-card todo" />
          <div className="art-kanban-card todo" />
          <div className="art-kanban-card todo" />
        </div>
        <div className="art-kanban-col">
          <div className="art-kanban-label">Doing</div>
          <div className="art-kanban-card doing" />
          <div className="art-kanban-card doing" />
        </div>
        <div className="art-kanban-col">
          <div className="art-kanban-label">Done</div>
          <div className="art-kanban-card done" />
          <div className="art-kanban-card done" />
        </div>
      </div>

      <p className="auth-artwork-tagline">Organize. Drag. Done.</p>
    </div>
  );
}
