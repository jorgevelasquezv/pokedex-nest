export const EnvConfigurations = () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: process.env.MONGODB || 'mongodb://localhost:27017/pokemon',

  pokeApiUrl: process.env.POKEMON_URL || 'https://pokeapi.co/api/v2/pokemon',

  defaultLimit: parseInt(process.env.PAGINATION_LIMIT, 10) || 20,
  defaultOffset: parseInt(process.env.PAGINATION_OFFSET, 10) || 0,
});
