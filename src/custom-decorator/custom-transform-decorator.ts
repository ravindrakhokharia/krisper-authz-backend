import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';

export const TransformDate = ({ isNullable = false } = {}) => {
  return Transform(({ value }) => {
    try {
      return new Date(value).toISOString();
    } catch (err) {
      if (isNullable && (value === null || value === '')) {
        return null;
      }
      throw new BadRequestException('Invalid date');
    }
  });
};

export const TransformUppercase = () => {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  );
};

export const TransformEnum = (enumObj) => {
  return Transform(
    ({ value }) =>
      (value = isNaN(parseInt(value))
        ? enumObj[value]
        : enumObj[enumObj[value]]),
  );
};
export const TransformStringify = () => {
  return Transform(({ value }) => JSON.stringify(value));
};

export const TransformParse = () => {
  return Transform(({ value }) => JSON.parse(value));
};

export const TransformToNumber = (fieldName: string = 'field') => {
  return Transform((value) => {
    const numberValue = Number(value.value);

    if (Number.isNaN(numberValue)) {
      throw new BadRequestException(`${fieldName} Must be number`);
    }

    if (typeof numberValue === 'number') {
      return +value.value;
    }
    throw new BadRequestException(`${fieldName} Must be number`);
  });
};
export const TransformToBoolean = (fieldName: string = 'field') => {
  return Transform((value) => {
    const numberValue = Boolean(value.value);

    if (typeof numberValue === 'boolean') {
      return Boolean(value.value);
    }

    throw new BadRequestException(`${fieldName} must be boolean`);
  });
};
