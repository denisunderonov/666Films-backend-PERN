import express from "express";
import * as UserValid from "./validations.js";
import pool from "./db.js";
import cors from "cors";
import * as userController from "./controllers/UserController.js";
import * as videoController from "./controllers/videoController.js";

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

app.post(
  "/auth/register",
  UserValid.registerValidator,
  userController.register
);

app.post("/auth/login", userController.login);

app.get("/films", videoController.getAllFilms);
app.get("/films/:id", videoController.getFilm);

app.listen(4444, (error) => {
  if (error) {
    console.error("Ошибка запуска сервера: ", error);
  }

  console.log("Сервер запустился");
});
