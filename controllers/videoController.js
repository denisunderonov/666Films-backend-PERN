import pool from "../db.js";

export const getAllFilms = async (req, res) => {
  try {
    const result = await pool.query("SELECT title, url FROM movies");
    res.json({
      status: true,
      result: result.rows,
    });
  } catch (error) {
    console.error("Ошибка при получении фильмов:", error);
    res.status(500).send("Ошибка на сервере");
  }
};
