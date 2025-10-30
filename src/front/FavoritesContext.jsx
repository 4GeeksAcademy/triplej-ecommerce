import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(new Set());
  const { currentUser } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFavorites(new Set(parsed));
      } catch {
        console.error("Failed to parse favorites from localStorage");
      }
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    fetch(`/my-favorites/${currentUser.id}`)
      .then(resp => {
        if (!resp.ok) console.log(`HTTP ${resp.status}`);
        return resp.json();
      })
      .then(data => {
        const fav_ids = data.map(f => f.id);
        setFavorites(new Set(fav_ids));
        localStorage.setItem("favorites", JSON.stringify(fav_ids));
      })
      .catch(e => console.error(e));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify([...favorites]));
  }, [favorites]);



  const addFavorite = (prod_id) => {
    if (!currentUser) return;

    fetch("/my-favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({prod_id, currentUser}),
    })
      .then(resp => {
        if (!resp.ok) console.log(`HTTP ${resp.status}`);
        return resp.json();
      })
      .then(() => {
        setFavorites((prev) => new Set(prev).add(prod_id));
      })
      .catch(e => console.error("Error adding favorite:", e));
  };

  const removeFavorite = (prod_id) => {
    if (!currentUser) return;

    fetch(`/my-favorites/${prod_id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentUser }),
    })
      .then(resp => {
        if (!resp.ok) console.log(`HTTP ${resp.status}`);
        return resp.json();
      })
      .then(() => {
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(prod_id);
          return next;
        });
      })
      .catch(e => console.error("Error removing favorite:", e));
  };

  const toggleFavorite = (id) => {
    if (favorites.has(id)) {
      removeFavorite(id);
    } else {
      addFavorite(id);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, toggleFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}