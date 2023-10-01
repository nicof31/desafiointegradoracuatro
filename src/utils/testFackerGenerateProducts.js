import { Faker, es, fakerES } from '@faker-js/faker';
import { v4 as uuidv4 } from "uuid";

const faker = new Faker({ locale: [es] });

export const generateProduct = () => {
  return {
    title: faker.commerce.productName(),
    description: fakerES.commerce.productDescription(),
    code: uuidv4(),
    price: faker.commerce.price(),
    status: true,
    category: faker.commerce.department(),
    thumbnail: [faker.internet.avatar()] || [],
    stock: faker.string.numeric(1),
    _id: faker.database.mongodbObjectId(),
  };
};
