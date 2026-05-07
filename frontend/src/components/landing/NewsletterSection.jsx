function NewsletterSection() {
  return (
    <section className="newsletter" id="contact">
      <div className="newsletter-content">
        <h2>Join Our Circle</h2>
        <p>Subscribe to receive exclusive previews, styling tips, and early access to new collections.</p>
        <form className="newsletter-form">
          <input type="email" placeholder="Enter your email" required />
          <button type="submit">Subscribe</button>
        </form>
      </div>
    </section>
  );
}

export default NewsletterSection;
