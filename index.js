const express = require('express')
const app = express()
const dotenv = require('dotenv');
const mongoose = require("mongoose");
const { MONGO_DB_CONFIG } = require("./config/app.config");
const errors = require("./middleware/errors.js");
const swaggerUi = require("swagger-ui-express"), swaggerDocument = require("./swagger.json");
const CookieParser = require("cookie-parser");
const productRoute = require('./routes/products');
const authRoute = require('./routes/auth');
const usersRoute = require('./routes/users');
const ordersRoute = require('./routes/orders');
const cartRoute = require('./routes/cart');
const categoryRoute = require('./routes/category');
const cookieParser = require('cookie-parser');
const port = 3000
dotenv.config()

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_DB_CONFIG.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('db connect')).catch((err) => console.log(err))
app.use(express.json({ limit: '10mb' }));
// app.use("/api", require("./routes/app.routes"));
// app.use(errors.errorHandler);
app.use(cookieParser());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/api/cart', cartRoute);
app.use('/api/orders', ordersRoute);
app.use('/api/users', usersRoute);
app.use('/api/products', productRoute);
app.use('/api/', authRoute);
app.use('/api/categories', categoryRoute);
app.listen(MONGO_DB_CONFIG.PORT || port, () => console.log(`Example app listening on port ${MONGO_DB_CONFIG.PORT}!`))