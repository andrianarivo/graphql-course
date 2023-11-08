/* eslint-disable no-await-in-loop */
/* eslint-disable no-magic-numbers */
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

faker.seed(123);

console.log('creating users and posts');

async function main() {
  for (let i = 1; i <= 100; i += 1) {
    await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        age: faker.number.int({ min: 18, max: 100 }),
      },
    });
  }

  for (let i = 1; i <= 100; i += 1) {
    await prisma.post.create({
      data: {
        authorId: faker.number.int({ min: 1, max: 100 }),
        title: faker.lorem.text(),
        body: faker.lorem.paragraphs(2),
      },
    });
  }

  for (let i = 1; i <= 100; i += 1) {
    await prisma.comment.create({
      data: {
        authorId: faker.number.int({ min: 1, max: 100 }),
        postId: faker.number.int({ min: 1, max: 100 }),
        text: faker.lorem.text(),
      },
    });
  }
}

void main()
  .then(() => void console.log('DB seeded with test data'))
  .catch((error) => {
    console.error(error);
    throw error;
  })
  .finally(() => void prisma.$disconnect());