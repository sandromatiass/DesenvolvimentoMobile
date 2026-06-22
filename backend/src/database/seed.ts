import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { PasswordReset } from '../password-resets/entities/password-reset.entity';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [User, PasswordReset, Product],
  synchronize: false,
});

const SEED_PRODUCTS = [
  {
    name: 'X-Burguer Clássico',
    description: 'Hambúrguer artesanal com queijo cheddar, alface americana, tomate e maionese especial no pão brioche',
    price: 28.90,
    category: 'Lanches',
    imageUrl: undefined,
  },
  {
    name: 'X-Bacon Double',
    description: 'Dois hambúrgueres artesanais com bacon crocante, queijo derretido e molho especial da casa',
    price: 36.90,
    category: 'Lanches',
    imageUrl: undefined,
  },
  {
    name: 'Frango Grelhado',
    description: 'Peito de frango grelhado com temperos especiais, alface, tomate e cream cheese no pão integral',
    price: 24.90,
    category: 'Lanches',
    imageUrl: undefined,
  },
  {
    name: 'Coca-Cola',
    description: 'Refrigerante gelado Coca-Cola lata 350ml, refrescante e saboroso',
    price: 7.90,
    category: 'Bebidas',
    imageUrl: undefined,
  },
  {
    name: 'Suco Natural',
    description: 'Suco natural de fruta da estação, feito na hora com frutas frescas e sem adição de açúcar',
    price: 12.90,
    category: 'Bebidas',
    imageUrl: undefined,
  },
  {
    name: 'Brownie com Sorvete',
    description: 'Brownie quentinho de chocolate amargo servido com uma bola de sorvete de creme e calda de chocolate',
    price: 19.90,
    category: 'Sobremesas',
    imageUrl: undefined,
  },
  {
    name: 'Petit Gateau',
    description: 'Bolo de chocolate com centro vulcânico servido com sorvete de baunilha e calda quente de chocolate belga',
    price: 22.90,
    category: 'Sobremesas',
    imageUrl: undefined,
  },
  {
    name: 'Filé à Parmegiana',
    description: 'Filé mignon empanado coberto com molho de tomate caseiro e queijo gratinado, acompanhado de arroz e fritas',
    price: 54.90,
    category: 'Pratos Principais',
    imageUrl: undefined,
  },
  {
    name: 'Risoto de Funghi',
    description: 'Risoto cremoso de funghi secchi com parmesão ralado na hora, manteiga e ervas aromáticas frescas',
    price: 48.90,
    category: 'Pratos Principais',
    imageUrl: undefined,
  },
  {
    name: 'Prato Executivo',
    description: 'Frango grelhado temperado com arroz branco, feijão preto, salada verde e batata assada no alho',
    price: 35.90,
    category: 'Pratos Principais',
    imageUrl: undefined,
  },
];

async function seed() {
  console.log('Conectando ao banco de dados...');
  await AppDataSource.initialize();
  console.log('Conexão estabelecida!');

  const repo = AppDataSource.getRepository(Product);

  let inseridos = 0;
  let ignorados = 0;

  for (const p of SEED_PRODUCTS) {
    const exists = await repo.findOne({ where: { name: p.name } });
    if (!exists) {
      await repo.save(repo.create(p));
      console.log(`✅ Inserido: ${p.name}`);
      inseridos++;
    } else {
      console.log(`⏭️  Já existe: ${p.name}`);
      ignorados++;
    }
  }

  console.log(`\nSeed concluído! Inseridos: ${inseridos} | Ignorados: ${ignorados}`);
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Erro no seed:', err);
  process.exit(1);
});
