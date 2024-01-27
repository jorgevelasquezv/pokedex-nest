import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PokemonDto } from './interfaces/pokemon.dto.interface';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeedService {
  private pokeApiUrl = this.configServices.get<string>('pokeApiUrl');

  constructor(
    @InjectModel(Pokemon.name)
    private readonly model: Model<Pokemon>,
    private readonly http: AxiosAdapter,
    private readonly configServices: ConfigService,
  ) {}

  async executedSeed() {
    const data = await this.http.get<PokeResponse>(this.pokeApiUrl);

    const pokemons: PokemonDto[] = data.results.map(({ name, url }) => ({
      no: +url.split('/').at(-2),
      name,
    }));
    await this.model.insertMany(pokemons);
    return pokemons;
  }
}
