import { body } from "express-validator";

export const registerValidator = [
  body("login").isLength({min: 2}),
  body("password").isLength({ min: 5 }),
  body("email").isEmail()
];