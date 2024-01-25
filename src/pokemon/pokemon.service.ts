import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly model: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      return await this.model.create(createPokemonDto);
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll() {
    return await this.model.find().exec();
  }

  async findOne(term: string) {
    let pokemon: Pokemon;
    if (!isNaN(Number(term))) {
      pokemon = await this.model.findOne({ no: Number(term) }).exec();
    }

    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.model.findById(term).exec();
    }

    if (!pokemon) {
      pokemon = await this.model
        .findOne({ name: term.toLowerCase().trim() })
        .exec();
    }

    if (!pokemon) {
      throw new NotFoundException(
        `Pokemon with name, id or no ${term} not found`,
      );
    }
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);

    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      await pokemon.updateOne(updatePokemonDto, { new: true });

      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const pokemon = await this.model.findByIdAndDelete(id).exec();

    if (!pokemon)
      throw new NotFoundException(`Pokemon with id '${id}' not found`);

    return pokemon;
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon already exists, error: ${JSON.stringify(error.keyValue)}`,
      );
    }
    throw new InternalServerErrorException('Internal server error');
  }
}
