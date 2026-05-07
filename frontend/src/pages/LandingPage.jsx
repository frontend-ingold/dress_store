import { useEffect, useMemo, useState } from "react";
import Header from "../components/landing/Header";
import HeroSection from "../components/landing/HeroSection";
import CollectionsSection from "../components/landing/CollectionsSection";
import ArrivalsSection from "../components/landing/ArrivalsSection";
import NewsletterSection from "../components/landing/NewsletterSection";
import Footer from "../components/landing/Footer";
import { footerSections, navigationLinks } from "../data/landingContent";
import { apiBaseUrl } from "../config/api";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function LandingPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch(`${apiBaseUrl}/products`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("Unable to load homepage products.");
        }

        const data = await response.json();
        setProducts(data.products ?? []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      }
    }

    loadProducts();
    return () => controller.abort();
  }, []);

  const heroImage = products[0];
  const categoryCount = new Set(products.map((product) => product.category)).size;

  const heroContent = useMemo(() => {
    if (!heroImage) {
      return {
        subtitle: "Dress Collection",
        title: "Crafted with intention and elegance",
        description:
          "Discover contemporary dresses curated for a polished, premium storefront experience."
      };
    }

    return {
      subtitle: `${heroImage.category} Spotlight`,
      title: `${heroImage.name} and ${Math.max(categoryCount - 1, 0)} more curated dress stories`,
      description:
        heroImage.description ||
        "Discover contemporary dresses curated for a polished, premium storefront experience."
    };
  }, [categoryCount, heroImage]);

  const featuredCollections = useMemo(() => {
    const grouped = new Map();

    for (const product of products) {
      if (!grouped.has(product.category)) {
        grouped.set(product.category, {
          name: product.category,
          pieces: 0,
          imageUrl: product.imageUrl
        });
      }

      grouped.get(product.category).pieces += 1;
    }

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,
        count: `${item.pieces} Piece${item.pieces === 1 ? "" : "s"}`
      }))
      .slice(0, 3);
  }, [products]);

  const newArrivals = useMemo(
    () =>
      products.slice(0, 4).map((product) => ({
        ...product,
        priceLabel: currency.format(Number(product.price))
      })),
    [products]
  );

  return (
    <>
      <Header navigationLinks={navigationLinks} />

      <main>
        <HeroSection
          heroImage={heroImage}
          heroSubtitle={heroContent.subtitle}
          heroTitle={heroContent.title}
          heroDescription={heroContent.description}
        />
        <CollectionsSection featuredCollections={featuredCollections} />
        <ArrivalsSection newArrivals={newArrivals} />
        <NewsletterSection />
      </main>

      <Footer footerSections={footerSections} />
    </>
  );
}

export default LandingPage;
