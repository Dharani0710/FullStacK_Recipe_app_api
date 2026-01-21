import express from "express";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { favorites } from "./db/schema.js";
import { eq, and } from "drizzle-orm";

const app = express();
const PORT = ENV.PORT || 5001;

app.use(express.json());

app.post("/api/favorites", async (req, res) => {
  try {
    const { userId, recipeId, title, image, cookTime, servings } = req.body;

    if (!userId || !recipeId || !title) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newFavorite = await db.insert(favorites).values({
      userId,
      recipeId,
      title,
      image,
      cookTime,
      servings,
    }).returning();

    res.status(201).json({ success: true, data: newFavorite[0] });
  } catch (error) {
    console.error("Error adding favorite:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});

app.delete("/api/favorites/:userId/:recipeId", async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    await db.delete(favorites).where(
      and(
        eq(favorites.userId, parseInt(userId)),
        eq(favorites.recipeId, parseInt(recipeId))
      )
    );

    res.status(200).json({ success: true, message: "Favorite removed successfully" });
  } catch (error) {
    console.error("Error deleting favorite:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
});
app.get("/api/favorites/:userId", async (req, res) => {
  try {
    const { userId } = req.params;  
    const userfavorites = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, parseInt(userId)));

    res.status(200).json({ success: true, data: userfavorites });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
}); 

app.listen(PORT, () => {
  console.log("Server started on port", PORT);
});
