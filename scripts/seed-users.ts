import { PrismaClient, Role, UserStatus } from "@prisma/client";

const prisma = new PrismaClient();

const givenNames = [
  "太郎",
  "花子",
  "大輔",
  "結衣",
  "健太",
  "美咲",
  "悠斗",
  "葵",
  "陽菜",
  "翔太"
];

const familyNames = ["佐藤", "鈴木", "高橋", "田中", "伊藤", "渡辺", "山本", "中村", "小林", "加藤"];

const departments = ["営業部", "開発部", "人事部", "総務部", "経理部", "マーケ部", "CS部", "企画部"];
const titles = ["主任", "リーダー", "マネージャー", "部長", "課長", "アナリスト", "エンジニア", "サポート"];

const roles: Role[] = ["ADMIN", "MANAGER", "USER"];
const statuses: UserStatus[] = ["ACTIVE", "INVITED", "DISABLED"];

const randomItem = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

const generateEmail = (name: string, index: number) =>
  `${name.replace(/\s/g, "").toLowerCase()}${index}@example.com`;

const generateKana = (name: string) =>
  name
    .replace(/佐藤|さとう/g, "サトウ")
    .replace(/鈴木|すずき/g, "スズキ")
    .replace(/高橋|たかはし/g, "タカハシ")
    .replace(/田中|たなか/g, "タナカ")
    .replace(/伊藤|いとう/g, "イトウ")
    .replace(/渡辺|わたなべ/g, "ワタナベ")
    .replace(/山本|やまもと/g, "ヤマモト")
    .replace(/中村|なかむら/g, "ナカムラ")
    .replace(/小林|こばやし/g, "コバヤシ")
    .replace(/加藤|かとう/g, "カトウ")
    .replace(/太郎/g, "タロウ")
    .replace(/花子/g, "ハナコ")
    .replace(/大輔/g, "ダイスケ")
    .replace(/結衣/g, "ユイ")
    .replace(/健太/g, "ケンタ")
    .replace(/美咲/g, "ミサキ")
    .replace(/悠斗/g, "ユウト")
    .replace(/葵/g, "アオイ")
    .replace(/陽菜/g, "ヒナ")
    .replace(/翔太/g, "ショウタ");

const main = async () => {
  const users = Array.from({ length: 100 }, (_v, idx) => {
    const family = randomItem(familyNames);
    const given = randomItem(givenNames);
    const fullName = `${family} ${given}`;
    const email = generateEmail(`${family}.${given}`, idx);

    return {
      email,
      name: fullName,
      nameKana: generateKana(fullName),
      role: randomItem(roles),
      status: randomItem(statuses),
      department: randomItem(departments),
      title: randomItem(titles),
      phoneNumber: `03-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      note: "自動生成データ",
      image: `https://picsum.photos/seed/${encodeURIComponent(email)}/200/200`
    };
  });

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true
  });

  console.log(`✅ ユーザーマスタに ${users.length} 件のダミーデータを投入しました。`);
};

main()
  .catch((error) => {
    console.error("❌ ユーザー投入に失敗しました:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
