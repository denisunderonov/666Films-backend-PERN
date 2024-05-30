import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

export async function register(req, res) {
  try {
    const { login, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (login, email, password_hash) VALUES ($1, $2, $3) RETURNING id, login, email',
      [login, email, hash]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      {
        id: user.id,
      },
      'secretTOKENMAN',
      {
        expiresIn: '30d',
      }
    );

    return res.status(200).json({
      status: true,
      user,
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: 'Регистрация не удалась',
    });
  }
}

export const login = async (req, res) => {
  try {
    const { login, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE login = $1',
      [login]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }

    const isValidPass = await bcrypt.compare(password, user.password_hash);

    if (!isValidPass) {
      return res.status(400).json({
        message: 'Неверный логин или пароль',
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
      },
      'secretTOKENMAN',
      {
        expiresIn: '30d',
      }
    );

    const { password_hash, ...userData } = user;

    res.json({
      status: true,
      user: userData,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Авторизация не удалась',
    });
  }
};
