function PromiseSection({ promises }) {
  return (
    <section className="promise-section" id="promise">
      <div className="section-heading">
        <p className="eyebrow">Why Dressify</p>
        <h2>Built for conversion later, branded for desire now.</h2>
      </div>

      <div className="promise-grid">
        {promises.map((item) => (
          <article key={item.label} className="promise-card">
            <span>{item.label}</span>
            <p>{item.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default PromiseSection;
