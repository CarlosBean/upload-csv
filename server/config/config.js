// port
process.env.PORT = process.env.PORT || 3000;

// enviroment
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//expiration time token
process.env.EXP_TOKEN = 60 * 60 * 24;

// auth seed token
process.env.SEED = process.env.SEED || 'development-seed';

// google client id
process.env.CLIENT_ID = process.env.CLIENT_ID || '526125339854-t2igmrh2433r2ndii3gmc5qnaipj2bq2.apps.googleusercontent.com';

// database
if (process.env.NODE_ENV === 'dev') {
    process.env.DB = 'mongodb://localhost:27017/coffee';
} else {
    process.env.DB = process.env.MONGO_URL;
}