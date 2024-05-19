import express from "express";
import * as UserValid from "./validations.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import cors from 'cors';
import UserModel from "./models/Usermodel.js";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
app.use(cors());

const url =
  "mongodb+srv://admin:Denimz13.@cluster0.izogo3m.mongodb.net/devil?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(url)
  .then(() => {
    console.log("База данных работает");
  })
  .catch((error) => {
    console.error("БД не работает: ", error);
  });

app.post("/auth/register", UserValid.registerValidator, async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new UserModel({
      login: req.body.login,
      email: req.body.email,
      passwordHash: hash,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      "secretTOKENMAN",
      {
        expiresIn: "30d",
      }
    );

    const { passwordHash, ...userData } = user._doc;

    return res.status(200).json({
      status: true,
      ...userData,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Регистрация не удалась",
    });
  }
});

app.listen(4445, (error) => {
  if (error) {
    console.error("Ошбика запуска сервера: ", error);
  }

  console.log("Сервер запустился");
});
