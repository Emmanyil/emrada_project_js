const express = require("express");
const bodyParser = require("body-parser");
const Sequelize = require("sequelize");
const jwt = require("jsonwebtoken");
const { Op } = Sequelize;
const express_graphql = require("express-graphql");
const { buildSchema } = require("graphql");
const cors = require("cors");
const expressJwt = require("express-jwt");
const mailer = require("./smtpGmail");
const app = express();

app.use(bodyParser.json());
app.use(express.static("emrada_project"));

const sequelize = new Sequelize("emrada", "root", "Emmanuil2228125%", {
  timezone: "+03:00",
  host: "localhost",
  dialect: "mysql",
});

class User extends Sequelize.Model {
  // static get users() {
  //   const a = User.findOne();
  //   return a;
  //   // return User.findOne((user) => user.login === query.login && user.password === query.password);
  // }
  // static findOne1(query) {
  //   return Promise.resolve(
  //     User.users.find(
  //       (user) => user.login === query.login && user.password === query.password
  //     )
  //   );
  // }
}

User.init(
  {
    email: Sequelize.STRING,
    password: Sequelize.STRING,
    nickname: Sequelize.STRING,
  },
  { sequelize, modelName: "user" }
);

app.get("/users", async (req, res) => res.send(await User.findAll()));

app.post("/users", async (req, res) => {
  const twoUsers = async () => {
    const userEmail = await User.findOne({ where: { email: req.body.email } });
    if (userEmail !== null) console.log(err);
    else {
      console.log("hi");
      var newUser = new User(req.body);
      const message = {
        to: req.body.email,
        subject: "Registered",
        text: `Отлично. Вот ваши данные:
        login: ${req.body.email}
        password: ${req.body.password}

        Перейдите по ссылке, чтобы войти в свой аккаунт
        url: http://localhost:3335/sign_in`,
      };
      mailer(message);
      await newUser.save();
      res.status(201).send(newUser);
    }
  };
  twoUsers();
});

app.get("/login", async (req, res) => {
  res.send(await User.findAll());
  // res.send("hello")
});

// app.post("/login", async (req, res) => {
//   console.log(req.body);
//   let user = await User.findOne({
//     where: {
//       login: req.body.login,
//       password: req.body.password,
//     },
//   });
//   user ? console.log("hi") : console.log("bye");

// res.end(
//   JSON.stringify({
//     token: jwt.sign({ sub: { id: user.id, login: user.login } }, secret),
//   })
// );
// });

app.listen(3333, () => console.log("The server started on port 3333"));

// (async () => {
//   let persone =
//     // User.findOne({ where: { login: "David" } }) ||
//     (await User.create({ email: "asjhdkaj@hjh.jsd", password: "12345", nickname: "Hkdsl" }));
// })();

sequelize.sync();

const config = {
  secret: `google`,
};

// function jwtWare() {
//   // const { secret } = config;
//   return expressJwt( config.secret ).unless({
//     path: ["/users/authenticate"],
//   });
// }

function errorHandler(err, req, res, next) {
  if (typeof err === "string") {
    return res.status(400).json({ message: err });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "Invalid Token" });
  }

  return res.status(500).json({ message: err.message });
}

// const users = User.findOne();

const authenticate = async ({ email, password }) => {
  console.log(email, password);
  const user = await User.findOne({
    where: {
      email: email,
      password: password,
    },
  });
  console.log(user);
  if (user) {
    const token = jwt.sign({ sub: user.id }, config.secret);
    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      token,
    };
  }
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.post("/users/authenticate", async (req, res, next) => {
  authenticate(req.body)
    .then((user) =>
      user
        ? res.json(user)
        : res.status(400).json({ message: "Username or password is incorrect" })
    )
    .catch((err) => next(err));
});

// app.use(jwtWare());

// app.get("/a", (req, res, next) => {
//   // res.send("hello")
//   console.log(req.headers.authorization);
//   res.json({ all: "ok" });
//   // next();
// });

app.get("/a", (req, res, next) => {
  console.log(req.headers.authorization);
  const token =
    req.headers.authorization &&
    req.headers.authorization.slice("Bearer ".length);
  console.log(token);
  // if (token) {
  //   const data = jwt.verify(token, config.secret);
  //   if (data) {
  //     res.end(`<h1>Hello ${data.sub.login}</h1>`);
  //   } else {
  //     res.end(`<h1>Hello haker</h1>`);
  //   }
  // } else {
  //   res.end(`<h1>Hello</h1>`);
  // }
});

app.use(errorHandler);
