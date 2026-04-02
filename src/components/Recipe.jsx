import { useLocation } from "react-router-dom";

function Recipes() {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("search") || "";

  const allRecipes = [
    { title: "Pasta Special", img: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80" },
    { title: "Grilled Chicken", img: "https://images.unsplash.com/photo-1512058564366-c9a0b47a5b76?auto=format&fit=crop&w=800&q=80" },
    { title: "Rice Bowl", img: "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80" },
    { title: "Stir Fry Veggies", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80" },
    { title: "Delicious Dessert", img: "https://images.unsplash.com/photo-1516685018646-54995e04f0b1?auto=format&fit=crop&w=800&q=80" },
    { title: "Jollof Rice", img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" },
  ];

  const filteredRecipes = allRecipes.filter(r =>
    r.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="recipes-grid">
      {filteredRecipes.length > 0 ? (
        filteredRecipes.map((r, i) => (
          <div key={i} className="recipe-card">
            <img src={r.img} alt={r.title} />
            <h3>{r.title}</h3>
          </div>
        ))
      ) : (
        <p>No recipes found.</p>
      )}
    </div>
  );
}

export default Recipes;





