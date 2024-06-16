import pool from "../db.js";
import jwt from "jsonwebtoken";

export const getAllFilms = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, rating, title, url FROM movies"
    );
    res.json({
      status: true,
      result: result.rows,
    });
  } catch (error) {
    console.error("Ошибка при получении фильмов:", error);
    res.status(500).send("Ошибка на сервере");
  }
};

export const getAllSerials = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, rating, title, url FROM series"
    );
    res.json({
      status: true,
      result: result.rows,
    });
  } catch (error) {
    console.error("Ошибка при получении сериалов:", error);
    res.status(500).send("Ошибка на сервере");
  }
};

export const getAllAnime = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, rating, title, url FROM animes"
    );
    res.json({
      status: true,
      result: result.rows,
    });
  } catch (error) {
    console.error("Ошибка при получении аниме:", error);
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

export const getSerial = async (req, res) => {
  try {
    const filmId = req.params.id;
    const result = await pool.query("SELECT * FROM series WHERE id = $1", [
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

export const getAnime = async (req, res) => {
  try {
    const filmId = req.params.id;
    const result = await pool.query("SELECT * FROM animes WHERE id = $1", [
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

export const getGenres = async (req, res) => {
  try {
    // Выполнить запросы для получения жанров из всех таблиц
    const moviesGenresResult = await pool.query("SELECT genres FROM movies");
    const seriesGenresResult = await pool.query("SELECT genres FROM series");
    const animesGenresResult = await pool.query("SELECT genres FROM animes");

    // Объединить жанры из всех результатов в один массив для каждого типа
    const moviesGenres = [
      ...new Set(
        moviesGenresResult.rows
          .map((row) => row.genres)
          .join(",")
          .split(",")
          .map((genre) => genre.trim())
      ),
    ];
    const seriesGenres = [
      ...new Set(
        seriesGenresResult.rows
          .map((row) => row.genres)
          .join(",")
          .split(",")
          .map((genre) => genre.trim())
      ),
    ];
    const animesGenres = [
      ...new Set(
        animesGenresResult.rows
          .map((row) => row.genres)
          .join(",")
          .split(",")
          .map((genre) => genre.trim())
      ),
    ];

    const genres = {
      films: moviesGenres,
      series: seriesGenres,
      animes: animesGenres,
    };

    res.json(genres);
  } catch (error) {
    console.error("Ошибка при получении жанров:", error);
    res.status(500).json({ message: "Ошибка при получении жанров" });
  }
};

export const updateRecommendations = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(token, "secretTOKENMAN");
  const userId = decodedToken.id;

  if (!userId) {
    return res.status(401).json({ message: "Ошибка: Неверный токен" });
  }

  const { series, animes, films } = req.body;

  try {
    const checkRecommendationsQuery =
      "SELECT * FROM recommendations WHERE user_id = $1";
    const checkResult = await pool.query(checkRecommendationsQuery, [userId]);

    if (checkResult.rows.length > 0) {
      const updateRecommendationsQuery =
        "UPDATE recommendations SET series_rec = $1, animes_rec = $2, films_rec = $3 WHERE user_id = $4";
      await pool.query(updateRecommendationsQuery, [
        series.join(', '), // Преобразуем массив в текстовую строку с разделителем запятая
        animes.join(', '),
        films.join(', '),
        userId,
      ]);
    } else {
      const insertRecommendationsQuery =
        "INSERT INTO recommendations (user_id, series_rec, animes_rec, films_rec) VALUES ($1, $2, $3, $4)";
      await pool.query(insertRecommendationsQuery, [
        userId,
        series.join(', '), // Преобразуем массив в текстовую строку с разделителем запятая
        animes.join(', '),
        films.join(', '),
      ]);
    }

    res.status(200).json({ message: "Рекомендации успешно обновлены" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при обновлении рекомендаций" });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'secretTOKENMAN');
    const userId = decodedToken.id;

    if (!userId) {
      return res.status(401).json({ message: 'Ошибка: Неверный токен' });
    }

    // Функция для преобразования текстовой строки жанров в массив
    const cleanAndConvertGenres = (genreString) => {
      if (!genreString) return [];
      return genreString.split(',').map(genre => genre.trim().toLowerCase());
    };

    // Получение рекомендаций пользователя
    const recommendationsQuery = `
      SELECT series_rec, animes_rec, films_rec 
      FROM recommendations 
      WHERE user_id = $1
    `;
    const recommendationsResult = await pool.query(recommendationsQuery, [userId]);

    if (recommendationsResult.rows.length === 0) {
      return res.status(404).json({ message: 'Рекомендации не найдены' });
    }

    const { series_rec, animes_rec, films_rec } = recommendationsResult.rows[0];

    // Функция для получения всех фильмов, сериалов или аниме
    const getAllContent = async (contentTable, genreColumn) => {
      const query = `
        SELECT id, title, rating, url, ${genreColumn} AS genres 
        FROM ${contentTable}
      `;
      const result = await pool.query(query);
      return result.rows;
    };

    // Получаем все фильмы, сериалы и аниме
    const movies = await getAllContent('movies', 'genres');
    const series = await getAllContent('series', 'genres');
    const animes = await getAllContent('animes', 'genres');

    // Преобразуем текстовое представление жанров в массивы для рекомендаций
    const recommendedSeriesGenres = cleanAndConvertGenres(series_rec);
    const recommendedAnimeGenres = cleanAndConvertGenres(animes_rec);
    const recommendedFilmGenres = cleanAndConvertGenres(films_rec);

    // Функция для фильтрации контента по совпадающим жанрам
    const filterContentByGenres = (contentList, recommendedGenres) => {
      return contentList.filter(content => {
        const contentGenres = cleanAndConvertGenres(content.genres);
        return contentGenres.some(genre => recommendedGenres.includes(genre));
      });
    };

    // Фильтруем фильмы, сериалы и аниме по рекомендованным жанрам
    const recommendedMovies = filterContentByGenres(movies, recommendedFilmGenres);
    const recommendedSeries = filterContentByGenres(series, recommendedSeriesGenres);
    const recommendedAnimes = filterContentByGenres(animes, recommendedAnimeGenres);

    const recommendations = {
      movies: recommendedMovies,
      series: recommendedSeries,
      animes: recommendedAnimes,
    };

    res.json(recommendations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении рекомендаций' });
  }
};
