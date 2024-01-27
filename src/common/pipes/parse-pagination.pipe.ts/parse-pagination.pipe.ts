import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParsePaginationPipe implements PipeTransform {
  transform(value: any) {
    const { offset, limit } = value;
    return {
      offset: this.validatedValue(offset, 'offset'),
      limit: this.validatedValue(limit, 'limit'),
    };
  }

  private validatedValue(value: any, name: string): number | undefined {
    let valueOffset: number;
    if (value) {
      valueOffset = parseInt(value);
      if (isNaN(valueOffset))
        throw new BadRequestException(`${name} must be a number`);
      if (valueOffset < 0)
        throw new BadRequestException(`${name} must be a positive number`);
    }
    return valueOffset;
  }
}
