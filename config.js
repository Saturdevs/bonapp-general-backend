module.exports = {
  port: process.env.PORT || 3000,
  db: process.env.MONGODB || 'mongodb://localhost:27017/dbgeneral',
  SECRET_TOKEN: process.env.NODE_ENV === 'production' ? process.env.SECRET : 'secret',
  USER_EMAIL: process.env.USER_EMAIL_BONAPP,
  USER_PASSWORD: process.env.USER_PASSWORD_BONAPP
}