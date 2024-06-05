import pool from "../db.js";

export const getAllFilms = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, rating, title, url FROM movies");
    res.json({
      status: true,
      result: result.rows,
    });
  } catch (error) {
    console.error("Ошибка при получении фильмов:", error);
    res.status(500).send("Ошибка на сервере");
  }
};

export const getFilm = async (req, res) => {
  try {
    const filmId = req.params.id;
    const result = await pool.query("SELECT * FROM movies WHERE id = $1", [
      filmId,
    ]);
    res.status(200).json({
      status: true,
      result: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
