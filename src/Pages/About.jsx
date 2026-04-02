import "./About.css";

function About() {
  return (
    <div className="about">
      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-text">
          <h1>About Berry’s Recipes 🍓</h1>
          <p>
            A modern recipe platform built for food lovers who enjoy
            discovering, cooking, and sharing amazing meals.
          </p>
        </div>
      </section>

      {/* STORY */}
      <section className="about-story">
        <div className="story-text">
          <h2>Our Story</h2>
          <p>
            Berry’s Recipes was created to bring food lovers together.
            From quick snacks to full meals, we believe cooking should
            be simple, beautiful, and enjoyable for everyone.
          </p>
          <p>
            Whether you're a beginner or a kitchen pro, this platform
            helps you explore delicious recipes from around the world.
          </p>
        </div>

        <img
          src="https://images.unsplash.com/photo-1543353071-873f17a7a088?w=1200"
          alt="Cooking"
        />
      </section>

      {/* FEATURES */}
      <section className="about-features">
        <h2>Why Choose Us?</h2>

        <div className="features-grid">
          <div className="feature-card">
            <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800" alt="Recipes" />
            <h3>Quality Recipes</h3>
            <p>Carefully curated meals with clear steps and ingredients.</p>
          </div>

          <div className="feature-card">
            <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800" alt="Community" />
            <h3>Food Community</h3>
            <p>Share your creations and discover ideas from others.</p>
          </div>

          <div className="feature-card">
            <img src="https://images.unsplash.com/photo-1521305916504-4a1121188589?w=800" alt="Easy Cooking" />
            <h3>Easy Cooking</h3>
            <p>Simple instructions designed for everyday cooking.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2>Let’s Cook Something Amazing 🍳</h2>
        <p>
          Join Berry’s Recipes today and turn every meal into something special.
        </p>
      </section>
    </div>
  );
}

export default About;
