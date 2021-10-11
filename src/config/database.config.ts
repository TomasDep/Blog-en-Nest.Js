import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path/posix';

function typeormModuleOption(): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [join(__dirname + '../**/**/*entity{.ts,.js}')],
    autoLoadEntities: true,

    // Implementacion de las migraciones
    /** Recursos
     *  * https://typeorm.io/#/migrations
     */
    migrations: [join(__dirname + '../migration/**/*{.ts,.js')],
    migrationsTableName: 'migrations_typeorm',
    migrationsRun: true,
    cli: {
      migrationsDir: 'src/migration',
    },

    // Activar solo manualmente en desarrollo si es necesario (desactivar en entorno de produccion)
    synchronize: false,
    logging: true,
    logger: 'file',
  };
}

export default registerAs('database', () => ({
  config: typeormModuleOption(),
}));
