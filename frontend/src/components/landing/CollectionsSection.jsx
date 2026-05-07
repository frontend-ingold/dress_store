function CollectionsSection({ collectionPreview }) {
  return (
    <section className="collections-section" id="collections">
      <div className="section-heading">
        <p className="eyebrow">Collection preview</p>
        <h2>Three visual directions to anchor the store.</h2>
      </div>

      <div className="collection-grid">
        {collectionPreview.map((item) => (
          <article key={item.title} className="collection-card">
            <img src={item.image} alt={item.title} />
            <div className="collection-card-copy">
              <p className="collection-index">{item.title}</p>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CollectionsSection;
