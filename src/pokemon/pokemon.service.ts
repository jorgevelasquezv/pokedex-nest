import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

import { Model, isValidObjectId } from 'mongoose';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PokemonService {
  private defaultLimit = this.configServices.get<number>('defaultLimit');
  private defaultOffset = this.configServices.get<number>('defaultOffset');

  constructor(
    @InjectModel(Pokemon.name)
    private readonly model: Model<Pokemon>,
    private readonly configServices: ConfigService,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      return await this.model.create(createPokemonDto);
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = this.defaultOffset } =
      paginationDto;
    return await this.model
      .find()
      .limit(limit)
      .skip(offset)
      .sort({ no: 1 })
      .select('-__v')
      .exec();
  }

  async findOne(term: string) {
    let pokemon: Pokemon;
    if (!isNaN(Number(term))) {
      pokemon = await this.model
        .findOne({ no: Number(term) })
        .select('-__v')
        .exec();
    }

    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.model.findById(term).select('-__v').exec();
    }

    if (!pokemon) {
      pokemon = await this.model
        .findOne({ name: term.toLowerCase().trim() })
        .select('-__v')
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
