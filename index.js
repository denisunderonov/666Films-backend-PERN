import express from "express";
import * as UserValid from "./validations.js";
import pool from "./db.js";
import cors from "cors";
import * as userController from "./controllers/UserController.js";
import * as videoController from "./controllers/videoController.js";
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.use(cors());

pool
  .connect()
  .then(() => {
    console.log("База данных работает");
  })
  .catch((error) => {
    console.error("БД не работает: ", error);
  });

  const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Токен отсутствует' });
  
    jwt.verify(token, 'secretTOKENMAN', (err, user) => {
      if (err) return res.status(403).json({ message: 'Неверный токен' });
  
      req.user = user;
      next();
    });
  };

app.post(
  "/auth/register",
  UserValid.registerValidator,
  userController.register
);

app.post("/auth/login", userController.login);
app.post("/deleteacc", userController.deleteAcc);
app.get("/films", videoController.getAllFilms);
app.get("/films/:id", videoController.getFilm);
app.get("/serials", videoController.getAllSerials);
app.get("/serials/:id", videoController.getSerial);
app.get("/anime", videoController.getAllAnime);
app.get("/anime/:id", videoController.getAnime);
app.get("/genres", videoController.getGenres);
app.get("/getrecomends", videoController.getRecommendations);
app.post("/recomendations", videoController.updateRecommendations);
app.post("/changepassword", userController.changePassword); 
app.post("/watched/add", authenticateToken, videoController.addToWatch)
app.post("/watched/remove", authenticateToken, videoController.removeFromWatch)
app.get("/watched/:type/:id", authenticateToken, videoController.isWatched);
app.get("/watched", videoController.getWatched);
app.get("/watched/check/:route/:id", videoController.checkIfWatched)


app.listen(4444, (error) => {
  if (error) {
    console.error("Ошибка запуска сервера: ", error);
  }

  console.log("Сервер запустился");
});
