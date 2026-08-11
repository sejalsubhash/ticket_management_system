export default function Loading({ text = 'Loading...' }) {
  return (
    <div className="loading-container">
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ marginTop: '8px', color: 'var(--gray-500)', fontSize: '0.875rem' }}>{text}</p>
      </div>
    </div>
  );
}
