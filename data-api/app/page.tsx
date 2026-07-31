export default function Home() {
  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <h1 style={{ marginBottom: '0.5rem' }}>EHC Data API</h1>
      <p style={{ color: '#999', marginBottom: '2rem' }}>
        Centralized data sync service for EHC Inventory Log, images, and eBay listings
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Quick Start</h2>
        <div style={{ backgroundColor: '#1a1a1a', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <p style={{ marginBottom: '1rem' }}>
            Visit the <a href="/dashboard">dashboard</a> to monitor syncs and trigger manual syncs.
          </p>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>API Endpoints</h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#d4af37' }}>
            GET /api/inventory
          </h3>
          <p style={{ color: '#bbb', marginBottom: '0.5rem' }}>Fetch current inventory from EHC Inventory Log</p>
          <div style={{ backgroundColor: '#1a1a1a', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
            <p>
              <strong>Query Parameters:</strong>
            </p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>
                <code>status</code> (optional): Filter by inventory status (e.g., &quot;In Stock&quot;)
              </li>
              <li>
                <code>gender</code> (optional): Filter by gender/department (e.g., &quot;Men&quot;, &quot;Women&quot;)
              </li>
            </ul>
            <p style={{ marginTop: '1rem' }}>
              <strong>Example:</strong>
            </p>
            <code>/api/inventory?status=In%20Stock&gender=Women</code>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#d4af37' }}>
            GET /api/sync
          </h3>
          <p style={{ color: '#bbb', marginBottom: '0.5rem' }}>Get current sync state and logs</p>
          <div style={{ backgroundColor: '#1a1a1a', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
            <p>Returns sync state including last sync times, active sync status, and recent logs.</p>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#d4af37' }}>
            POST /api/sync
          </h3>
          <p style={{ color: '#bbb', marginBottom: '0.5rem' }}>Trigger a manual sync from Google Sheets</p>
          <div style={{ backgroundColor: '#1a1a1a', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
            <p>Returns sync result with records processed and any errors encountered.</p>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Integration with Storefront & JayLeeFit</h2>
        <div style={{ backgroundColor: '#1a1a1a', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <p style={{ marginBottom: '1rem' }}>
            Both the Storefront and JayLeeFit applications can consume this API:
          </p>
          <ul style={{ marginLeft: '1.5rem' }}>
            <li>
              <strong>Storefront:</strong> Call <code>/api/inventory</code> instead of directly fetching Google Sheets
            </li>
            <li>
              <strong>JayLeeFit:</strong> Use inventory data for testimonials and client progress tracking
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Features (In Progress)</h2>
        <div style={{ backgroundColor: '#1a1a1a', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <ul style={{ marginLeft: '1.5rem' }}>
            <li>✅ Sync from EHC Inventory Log (Google Sheets)</li>
            <li>⏳ Sync images from Google Drive (EHC-IMPORT-INVENTORY)</li>
            <li>⏳ Sync to eBay listings</li>
            <li>⏳ Blob storage integration (Cloudinary)</li>
            <li>⏳ Multi-source caching and transformation</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
