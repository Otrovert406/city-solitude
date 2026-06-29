import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  // Create a demo user
  const password = await bcrypt.hash('123456', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      username: '独处探索者',
      email: 'demo@example.com',
      password,
      bio: '喜欢一个人在城市里散步',
    },
  });

  // Create cities
  const cities = await Promise.all([
    prisma.city.upsert({ where: { slug: 'hangzhou' }, update: {}, create: { name: '杭州', province: '浙江', slug: 'hangzhou' } }),
    prisma.city.upsert({ where: { slug: 'shanghai' }, update: {}, create: { name: '上海', province: '上海', slug: 'shanghai' } }),
    prisma.city.upsert({ where: { slug: 'beijing' }, update: {}, create: { name: '北京', province: '北京', slug: 'beijing' } }),
    prisma.city.upsert({ where: { slug: 'chengdu' }, update: {}, create: { name: '成都', province: '四川', slug: 'chengdu' } }),
    prisma.city.upsert({ where: { slug: 'nanjing' }, update: {}, create: { name: '南京', province: '江苏', slug: 'nanjing' } }),
    prisma.city.upsert({ where: { slug: 'xiamen' }, update: {}, create: { name: '厦门', province: '福建', slug: 'xiamen' } }),
  ]);

  // Create sample places
  const places = [
    { city: cities[0], title: '满觉陇 · 山间茶室', desc: '沿着满觉陇路往上走，有一家藏在竹林里的茶室。窗外是层层叠叠的青山，点一杯龙井，能坐一下午。这里游客很少，大多是本地人。', address: '杭州市西湖区满觉陇路', lat: 30.2210, lng: 120.1130, cat: 'CAFE', vibe: 'QUIET,NATURE,HEALING' },
    { city: cities[0], title: '单向空间 · 乐堤港店', desc: '三层楼的书店，二楼靠窗的位置可以看到运河。工作日几乎没人，适合看书写作。咖啡也不错。', address: '杭州市拱墅区丽水路远洋乐堤港', lat: 30.3090, lng: 120.1460, cat: 'BOOKSTORE', vibe: 'QUIET,LITERARY' },
    { city: cities[0], title: '云栖竹径', desc: '比起西湖的人山人海，云栖竹径安静得像另一个世界。石板路两旁是参天翠竹，走累了在亭子里发呆特别好。', address: '杭州市西湖区梅灵南路', lat: 30.1950, lng: 120.1000, cat: 'PARK', vibe: 'QUIET,NATURE,HEALING' },
    { city: cities[1], title: '思南书局 · 诗歌店', desc: '坐落在思南公馆里的小书店，专门卖诗集。空间不大但很精致，有复古的吊灯和木地板。', address: '上海市黄浦区思南路', lat: 31.2140, lng: 121.4680, cat: 'BOOKSTORE', vibe: 'LITERARY,QUIET,COZY' },
    { city: cities[1], title: '龙美术馆 · 西岸馆', desc: '工作日午后去的，整个展厅只有几个人。空间巨大，混凝土结构本身就像艺术品。看展的同时也在独处。', address: '上海市徐汇区龙腾大道', lat: 31.1730, lng: 121.4590, cat: 'MUSEUM', vibe: 'QUIET,MINIMAL,LITERARY' },
    { city: cities[2], title: 'PageOne 书店 · 前门', desc: '在热闹的前门大街旁，这家书店却出奇安静。二楼大落地窗正对正阳门城楼，阅读和看风景两不误。', address: '北京市东城区前门大街', lat: 39.8980, lng: 116.3970, cat: 'BOOKSTORE', vibe: 'LITERARY,QUIET' },
    { city: cities[2], title: '地坛公园', desc: '比起天坛的喧嚣，地坛更适合一个人。古树参天，长椅上能坐一下午。史铁生写过这里，氛围很特别。', address: '北京市东城区安定门外大街', lat: 39.9530, lng: 116.4170, cat: 'PARK', vibe: 'QUIET,NATURE,LITERARY' },
    { city: cities[3], title: '無早书店', desc: '成都独立书店的代表，小小的门脸里别有洞天。选书品味极好，隔壁还有無早小食。', address: '成都市锦江区青莲上街', lat: 30.6540, lng: 104.0820, cat: 'BOOKSTORE', vibe: 'COZY,LITERARY' },
    { city: cities[3], title: '人民公园鹤鸣茶社', desc: '百年老茶馆，虽然人多但各喝各的茶谁也不打扰谁。坐在竹椅上盖碗茶配瓜子，是成都式的独处。', address: '成都市青羊区人民公园内', lat: 30.6590, lng: 104.0570, cat: 'CAFE', vibe: 'COZY,HEALING' },
    { city: cities[4], title: '先锋书店 · 五台山总店', desc: '由地下车库改造的巨大书店，十字架和斜坡是标志。空间大到能让人消失其中，找本书坐台阶上读半天。', address: '南京市鼓楼区广州路', lat: 32.0510, lng: 118.7700, cat: 'BOOKSTORE', vibe: 'LITERARY,QUIET' },
    { city: cities[5], title: '不在书店', desc: '藏在华新路老别墅区里的书店，绿植环绕着老洋房。厦门午后的阳光透过百叶窗洒进来，安静美好。', address: '厦门市思明区华新路', lat: 24.4530, lng: 118.0890, cat: 'BOOKSTORE', vibe: 'LITERARY,COZY,NATURE' },
  ];

  for (const p of places) {
    await prisma.place.create({
      data: {
        title: p.title,
        description: p.desc,
        address: p.address,
        latitude: p.lat,
        longitude: p.lng,
        category: p.cat,
        vibe: JSON.stringify(p.vibe.split(',')),
        images: JSON.stringify([]),
        authorId: user.id,
        cityId: p.city.id,
      },
    });
  }

  console.log(`✅ Seeded: 1 user, ${cities.length} cities, ${places.length} places`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
