import { useRef } from "react";
import SectionHeader from "./SectionHeader";

function CollectionsSection({ featuredCollections }) {
  const sliderRef = useRef(null);

  function scrollSlider(direction) {
    if (!sliderRef.current) {
      return;
    }

    sliderRef.current.scrollBy({
      left: sliderRef.current.clientWidth * 0.82 * direction,
      behavior: "smooth"
    });
  }

  return (
    <section className="featured" id="collections">
      <div className="slider-header">
        <SectionHeader subtitle="Explore by Style" title="Shop Categories" />
        <div className="slider-controls">
          <button type="button" className="slider-arrow" onClick={() => scrollSlider(-1)}>
            Prev
          </button>
          <button type="button" className="slider-arrow" onClick={() => scrollSlider(1)}>
            Next
          </button>
        </div>
      </div>

      <div className="collections-slider" ref={sliderRef}>
        {featuredCollections.map((item) => (
          <a
            key={item.name}
            href={`#/products?category=${encodeURIComponent(item.name)}`}
            className="collection-card"
          >
            <div className="collection-image">
              <img src={item.imageUrl} alt={item.name} />
            </div>
            <div className="collection-info">
              <h3 className="collection-name">{item.name}</h3>
              <p className="collection-count">{item.count}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default CollectionsSection;
