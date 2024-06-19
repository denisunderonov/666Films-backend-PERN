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

    // Функция для получения всех фильмов, сериалов или аниме с указанием типа контента
    const getAllContent = async (contentTable, genreColumn) => {
      let contentType;
      if (contentTable === 'movies') {
        contentType = 'films';
      } else if (contentTable === 'series') {
        contentType = 'serials';
      } else if (contentTable === 'animes') {
        contentType = 'anime';
      } else {
        throw new Error('Unsupported content table');
      }

      const query = `
        SELECT id, title, rating, url, ${genreColumn} AS genres 
        FROM ${contentTable}
      `;
      const result = await pool.query(query);
      
      return result.rows.map(row => ({
        ...row,
        type: contentType,
      }));
    };

    // Получаем все фильмы, сериалы и аниме с указанием типа
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


const checkExistence = async (type, id) => {
  const table = type === 'series' ? 'series' : type === 'movies' ? 'movies' : 'animes';

  const result = await pool.query(`SELECT 1 FROM ${table} WHERE id = $1`, [id]);
  return result.rows.length > 0;
};

export const addToWatch = async (req, res) => {
  const userId = req.user.id;
  const { series_id, movie_id, anime_id } = req.body;

  try {
    if ((series_id && await checkExistence('series', series_id)) ||
        (movie_id && await checkExistence('movies', movie_id)) ||
        (anime_id && await checkExistence('animes', anime_id))) {

      await pool.query(
        `INSERT INTO watched (user_id, series_id, movie_id, anime_id) VALUES ($1, $2, $3, $4)`,
        [userId, series_id || null, movie_id || null, anime_id || null]
      );
      res.status(200).json({ message: 'Запись добавлена в watched' });
    } else {
      res.status(400).json({ message: 'Переданный идентификатор не существует в соответствующей таблице' });
    }
  } catch (error) {
    console.error('Ошибка при добавлении записи в watched:', error);
    res.status(500).json({ message: 'Ошибка при добавлении записи в watched' });
  }
};

export const removeFromWatch = async (req, res) => {
  const userId = req.user.id;
  const { series_id, movie_id, anime_id } = req.body;

  try {
    await pool.query(
      `DELETE FROM watched WHERE user_id = $1 AND (series_id = $2 OR movie_id = $3 OR anime_id = $4)`,
      [userId, series_id || null, movie_id || null, anime_id || null]
    );
    res.status(200).json({ message: 'Запись удалена из watched' });
  } catch (error) {
    console.error('Ошибка при удалении записи из watched:', error);
    res.status(500).json({ message: 'Ошибка при удалении записи из watched' });
  }
};


export const isWatched = async (req, res) => {
  const userId = req.user.id;
  const { type, id } = req.params;

  try {
    const column = type === 'series' ? 'series_id' : type === 'movies' ? 'movie_id' : 'anime_id';
    const result = await pool.query(
      `SELECT * FROM watched WHERE user_id = $1 AND ${column} = $2`,
      [userId, id]
    );

    res.status(200).json({ isWatched: result.rows.length > 0 });
  } catch (error) {
    console.error('Ошибка при проверке записи в watched:', error);
    res.status(500).json({ message: 'Ошибка при проверке записи в watched' });
  }
}

export const getWatched = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "secretTOKENMAN");
    const userId = decodedToken.id;

    if (!userId) {
      return res.status(401).json({ message: "Ошибка: Неверный токен" });
    }

    const query = `
      SELECT 
        'films' AS type, movies.id, movies.title, movies.url, movies.rating
      FROM 
        watched
        JOIN movies ON watched.movie_id = movies.id
      WHERE 
        watched.user_id = $1
      
      UNION
      
      SELECT 
        'serials' AS type, series.id, series.title, series.url, series.rating
      FROM 
        watched
        JOIN series ON watched.series_id = series.id
      WHERE 
        watched.user_id = $1
      
      UNION
      
      SELECT 
        'anime' AS type, animes.id, animes.title, animes.url, animes.rating
      FROM 
        watched
        JOIN animes ON watched.anime_id = animes.id
      WHERE 
        watched.user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    
    res.status(200).json({
      status: true,
      result: result.rows,
    });
  } catch (error) {
    console.error("Ошибка при получении просмотренных элементов:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const checkIfWatched = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "secretTOKENMAN");
    const userId = decodedToken.id;

    if (!userId) {
      return res.status(401).json({ message: "Ошибка: Неверный токен" });
    }

    const { route, id } = req.params;

    let query;
    let queryParams;

    // Определяем, в какую таблицу (фильмы, сериалы, аниме) делать запрос
    if (route === 'films') {
      query = `
        SELECT movie_id
        FROM watched
        WHERE user_id = $1 AND movie_id = $2
      `;
      queryParams = [userId, id];
    } else if (route === 'serials') {
      query = `
        SELECT series_id
        FROM watched
        WHERE user_id = $1 AND series_id = $2
      `;
      queryParams = [userId, id];
    } else if (route === 'anime') {
      query = `
        SELECT anime_id
        FROM watched
        WHERE user_id = $1 AND anime_id = $2
      `;
      queryParams = [userId, id];
    } else {
      return res.status(400).json({ message: "Неподдерживаемый тип элемента" });
    }

    const result = await pool.query(query, queryParams);

    if (result.rows.length > 0) {
      res.status(200).json({ isWatched: true });
    } else {
      res.status(200).json({ isWatched: false });
    }
  } catch (error) {
    console.error("Ошибка при проверке состояния просмотра:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};