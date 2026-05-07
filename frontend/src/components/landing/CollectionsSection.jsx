import SectionHeader from "./SectionHeader";

function CollectionsSection({ featuredCollections }) {
  return (
    <section className="featured" id="collections">
      <SectionHeader subtitle="Explore by Style" title="Featured Collections" />

      <div className="collections-grid">
        {featuredCollections.map((item) => (
          <article key={item.name} className="collection-card">
            <div className="collection-image">
              <img src={item.imageUrl} alt={item.name} />
            </div>
            <div className="collection-info">
              <h3 className="collection-name">{item.name}</h3>
              <p className="collection-count">{item.count}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CollectionsSection;
