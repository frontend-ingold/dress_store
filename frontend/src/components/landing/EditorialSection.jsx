function EditorialSection() {
  return (
    <section className="editorial-section">
      <div className="editorial-copy">
        <p className="eyebrow">Visual merchandising</p>
        <h2>Use strong imagery now, layer catalog depth later.</h2>
        <p>
          This page gives you an attractive launch surface today. Later, product listing, details,
          cart, checkout, and success flows can be added underneath the same visual direction
          without rebuilding the brand foundation.
        </p>
      </div>

      <div className="editorial-collage">
        <img
          className="editorial-large"
          src="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80"
          alt="Red dress editorial look"
        />
        <img
          className="editorial-small top"
          src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
          alt="Dark eveningwear fashion look"
        />
        <img
          className="editorial-small bottom"
          src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80"
          alt="Soft neutral fashion portrait"
        />
      </div>
    </section>
  );
}

export default EditorialSection;
