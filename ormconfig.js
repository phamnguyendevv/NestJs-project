import { config } from 'dotenv';

config(); // Load biến môi trường từ .env

module.exports = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['dist/**/*.entity{.ts,.js}'], // Đường dẫn đến các entity sau khi build
  migrations: ['dist/migrations/*{.ts,.js}'], // Đường dẫn đến các migration sau khi build
  cli: {
    migrationsDir: 'dist/migrations', // Thư mục chứa các file migration trước khi build
  },
  synchronize: false, // Set to true only for development
  migrationsRun: true,
};
