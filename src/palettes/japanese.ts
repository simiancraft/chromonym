import type { Palette } from '../types.js';

/**
 * Traditional colors of Japan (227 names), keyed by the Hepburn
 * romanizations published by Wikipedia. The corresponding Japanese name is
 * preserved in each entry comment. Values are approximate sRGB renderings of
 * colors with historical variation, not specifications for physical dyes.
 *
 * Source: Wikipedia contributors, "Traditional colors of Japan," revision
 * 1372240562 (August 31, 2026), accessed November 7, 2026. Source text is
 * licensed under CC BY-SA 4.0. Hex values are lowercased; when the source
 * repeats a romanization, the first entry is retained. See NOTICE.md.
 *
 * The normalizer removes Hepburn macrons, case, spaces, hyphens, apostrophes,
 * and other punctuation. For example, `Kōbai-iro`, `kobai iro`, and
 * `KOBAI-IRO` resolve to the same key.
 */
const japaneseColors = {
  Ikkonzome: '#f08f90', // 一斤染
  'Momo-iro': '#f47983', // 桃色
  'Kōbai-iro': '#db5a6b', // 紅梅色
  Nakabeni: '#c93756', // 中紅
  'Sakura-iro': '#fcc9b9', // 桜色
  Arazome: '#ffb3a7', // 退紅
  Usubeni: '#f2666c', // 薄紅
  'Tokiha-iro': '#f58f84', // 鴇羽色
  Sakuranezumi: '#ac8181', // 桜鼠
  'Chōshun-iro': '#b95754', // 長春色
  Karakurenai: '#c91f37', // 唐紅/韓紅
  'Enji-iro': '#9d2933', // 臙脂色
  Kokiake: '#7b3b3a', // 深緋
  Jinzamomi: '#f7665a', // 甚三紅
  Mizugaki: '#b56c60', // 水がき
  Umenezumi: '#97645a', // 梅鼠
  "Su'ōkō": '#a24f46', // 蘇芳香
  Akabeni: '#c3272b', // 赤紅
  Shinshu: '#8f1d21', // 真朱
  'Azuki-iro': '#672422', // 小豆色
  Ginshu: '#bc2d29', // 銀朱
  Ebicha: '#5e2824', // 海老茶
  Kiriume: '#8b352d', // 栗梅
  'Akebono-iro': '#fa7b62', // 曙色
  'Sango-iro': '#f8674f', // 珊瑚色
  Shōjōhi: '#dc3023', // 猩々緋
  Shikancha: '#ab4c3d', // 芝翫茶
  'Kakishibu-iro': '#934337', // 柿渋色
  Benikaba: '#9d2b22', // 紅樺
  Benitobi: '#913228', // 紅鳶
  Benihibata: '#6f3028', // 紅檜皮
  Kurotobi: '#351e1c', // 黒鳶
  Benihi: '#f35336', // 紅緋
  Terigaki: '#d34e36', // 照柿
  Ake: '#cf3a24', // 緋
  Edocha: '#a13d2d', // 江戸茶
  'Bengara-iro': '#913225', // 紅柄色
  'Hihada-iro': '#752e23', // 檜皮色
  'Shishi-iro': '#f9906f', // 宍色
  Araishu: '#ff7952', // 洗朱
  'Akakō-iro': '#f07f5e', // 赤香色
  Tokigaracha: '#e68364', // ときがら茶
  Ōtan: '#ff4e20', // 黄丹
  Sohi: '#e35c38', // 蘇比
  Enshūcha: '#cb6649', // 遠州茶
  Karacha: '#b35c44', // 唐茶
  Kabacha: '#b14a30', // 樺茶
  Sōdenkaracha: '#9b533f', // 宗傳唐茶
  Suzumecha: '#8c4736', // 雀茶
  Kurikawacha: '#60281e', // 栗皮茶
  Momoshiocha: '#542d24', // 百塩茶
  'Tobi-iro': '#4c221b', // 鳶色
  'Shu-iro': '#ff3500', // 朱色
  Kurumizome: '#9f7462', // 胡桃染
  'Kaba-iro': '#b64925', // 蒲色
  Kōrozen: '#592b1f', // 黄櫨染
  Kogecha: '#351f19', // 焦茶
  Kokikuchinashi: '#f57f4f', // 深支子
  Araigaki: '#ec8254', // 洗柿
  'Taisha-iro': '#9f5233', // 代赭色
  Akashirotsurubami: '#ec956c', // 赤白橡
  Tonocha: '#985538', // 礪茶
  'Sencha-iro': '#824b35', // 煎茶色
  Sharegaki: '#ffa26b', // 洒落柿
  Usugaki: '#fca474', // 薄柿
  'Kanzō-iro': '#ff8936', // 萱草色
  Umezome: '#fa9258', // 梅染
  "Beni'ukon": '#fb8136', // 紅鬱金
  Chōjicha: '#8f583c', // 丁子茶
  Kenpōzome: '#2e211b', // 憲法染
  Biwacha: '#ab6134', // 枇杷茶
  'Kohaku-iro': '#ca6924', // 琥珀色
  Usukō: '#ffa565', // 淡香
  'Kuchiba-iro': '#d57835', // 朽葉色
  Kincha: '#c66b27', // 金茶
  Chōjizome: '#a96232', // 丁子染
  'Kitsune-iro': '#985629', // 狐色
  Fushizome: '#8c5939', // 柴染
  'Kyara-iro': '#6a432d', // 伽羅色
  'Susutake-iro': '#593a27', // 煤竹色
  Shiracha: '#c48e69', // 白茶
  'Ōdo-iro': '#be7f51', // 黄土色
  Kinsusutake: '#7d4e2d', // 銀煤竹
  Kigaracha: '#b7702d', // 黄唐茶
  Kobicha: '#6b4423', // 媚茶
  Akakuchiba: '#db8449', // 赤朽葉
  Asagi: '#f7bb7d', // 浅黄
  'Yamabuki-iro': '#ffa400', // 山吹色
  'Tamago-iro': '#ffa631', // 玉子色
  Hajizome: '#e08a1e', // 櫨染
  Yamabukicha: '#cb7e1f', // 山吹茶
  Kuwazome: '#c57f2e', // 桑染
  'Namakabe-iro': '#785e49', // 生壁色
  Kuchinashi: '#ffb95a', // 梔子
  'Tōmorokoshi-iro': '#faa945', // 玉蜀黍色
  Shirotsurubami: '#ce9f6f', // 白橡
  Kitsurubami: '#bb8141', // 黄橡
  "Tō'ō": '#ffb61e', // 藤黄
  'Hanaba-iro': '#ffb94e', // 花葉色
  'kayou-iro': '#ffb94e', // 花葉色
  'Torinoko-iro': '#e2be9f', // 鳥の子色
  'Ukon-iro': '#e69b3a', // 鬱金色
  Kikuchiba: '#e29c45', // 黄朽葉
  Rikyūshiracha: '#b0927a', // 利休白茶
  Rikyūcha: '#826b58', // 利休茶
  'Aku-iro': '#7f6b5d', // 灰汁色
  Higosusutake: '#7f5d3b', // 肥後煤竹
  Rokōcha: '#665343', // 路考茶
  Mirucha: '#4c3d30', // 海松茶
  'Nataneyu-iro': '#a17917', // 菜種油色
  Kimirucha: '#896c39', // 黄海松茶
  Uguisucha: '#5c4827', // 鶯茶
  Nanohanacha: '#e3b130', // 菜の花色
  Kariyasu: '#e2b13c', // 苅萱
  Kihada: '#f3c13a', // 黄蘗
  'Mushikuri-iro': '#d3b17d', // 蒸栗色
  Aokuchiba: '#aa8736', // 青朽葉
  Hiwacha: '#957b38', // 鶸茶
  Ominaeshi: '#d9b611', // 女郎花
  'Uguisu-iro': '#645530', // 鶯色
  'Hiwa-iro': '#bda928', // 鶸色
  Aoshirotsurubami: '#9ba88d', // 青白橡
  Yanagicha: '#9c8a4d', // 柳茶
  Rikancha: '#534a32', // 璃寛茶
  Aikobicha: '#473f2d', // 藍媚茶
  'Koke-iro': '#8b7d3a', // 苔色
  'Miru-iro': '#524b2a', // 海松色
  Sensaicha: '#3b3429', // 千歳茶
  Baikōcha: '#857c55', // 梅幸茶
  Iwaicha: '#5e5545', // 岩井茶
  "Hiwamo'egi": '#7a942e', // 鶸萌黄
  Yanagisusutake: '#4d4b3a', // 柳煤竹
  Urahayanagi: '#bcb58c', // 裏柳
  "Usumo'egi": '#8db255', // 淡萌黄
  Yanagizome: '#8c9e5e', // 柳染
  "Mo'egi": '#5b8930', // 萌黄
  Aoni: '#52593b', // 青丹
  'Matsuba-iro': '#454d32', // 松葉色
  "Usu'ao": '#8c9c76', // 薄青
  'Wakatake-iro': '#6b9362', // 若竹色
  Yanaginezumi: '#817b69', // 柳鼠
  'Oitake-iro': '#5e644f', // 老竹色
  Chitosemidori: '#374231', // 千歳緑
  Midori: '#2a603b', // 緑
  Byakuroku: '#a5ba93', // 白緑
  Sabiseiji: '#898a74', // 錆青磁
  Rokushō: '#407a52', // 緑青
  'Tokusa-iro': '#3d5d42', // 木賊色
  Onandocha: '#3d4035', // 御納戸茶
  'Aotake-iro': '#006442', // 青竹色
  Rikyūnezumi: '#656255', // 利休鼠
  Birōdo: '#224634', // びろうど
  "Mushi'ao": '#2d4436', // 虫襖
  Aimirucha: '#2e372e', // 藍海松茶
  "Mizu'asagi": '#749f8d', // 水浅葱
  'Seiji-iro': '#819c8b', // 青磁色
  Seiheki: '#3a6960', // 青碧
  Sabitetsuonando: '#3a403b', // 錆鉄御納戸
  'Tetsu-iro': '#2b3733', // 鉄色
  Omeshicha: '#354e4b', // 御召茶
  Kōrainando: '#203838', // 高麗納戸
  Minatonezumi: '#757d75', // 湊鼠
  Aonibi: '#4f4944', // 青鈍
  Tetsuonando: '#2b3736', // 鉄御納戸
  'Mizu-iro': '#86aba5', // 水色
  Sabiasagi: '#6a7f7a', // 錆浅葱
  Kamenozoki: '#c6c2b6', // 瓶覗
  'Asagi-iro': '#48929b', // 浅葱色
  'Shinbashi-iro': '#006c7f', // 新橋色
  Sabionando: '#455859', // 錆御納戸
  Ainezumi: '#5c544e', // 藍鼠
  'Ai-iro': '#264348', // 藍色
  'Onando-iro': '#364141', // 御納戸色
  Hanaasagi: '#1d697c', // 花浅葱
  'Chigusa-iro': '#317589', // 千草色
  'Masuhana-iro': '#4d646c', // 舛花色
  Hanada: '#044f67', // 縹
  'Noshimehana-iro': '#344d56', // 熨斗目花色
  Omeshionando: '#3d4c51', // 御召御納戸
  'Sora-iro': '#4d8fac', // 空色
  Kurotsurubami: '#252321', // 黒橡
  'Gunjō-iro': '#5d8cae', // 群青色
  Kon: '#192236', // 紺
  'Kachi-iro': '#181b26', // 褐色
  'Ruri-iro': '#1f4788', // 瑠璃色
  'Konjō-iro': '#003171', // 紺青色
  Rurikon: '#1b294b', // 瑠璃紺
  Benimidori: '#78779b', // 紅碧
  Konkikyō: '#191f45', // 紺桔梗
  Fujinezumi: '#766980', // 藤鼠
  'Benikakehana-iro': '#5a4f74', // 紅掛花色
  'Fuji-iro': '#89729e', // 藤色
  "Futa'ai": '#614e6e', // 二藍
  Fujimurasaki: '#875f9a', // 藤紫
  'Kikyō-iro': '#5d3f6a', // 桔梗色
  'Shion-iro': '#976e9a', // 紫苑色
  Messhi: '#3f313a', // 滅紫
  Shikon: '#2b2028', // 紫紺
  Kokimurasaki: '#3a243b', // 深紫
  'Usu-iro': '#a87ca0', // 薄色
  'Hashita-iro': '#8d608c', // 半色
  'Sumire-iro': '#5b3256', // 菫色
  Murasaki: '#4f284b', // 紫
  Kurobeni: '#23191e', // 黒紅
  'Ayame-iro': '#763568', // 菖蒲色
  Benifuji: '#bb7796', // 紅藤
  Kakitsubata: '#491e3c', // 杜若
  Hatobanezumi: '#755d5b', // 鳩羽鼠
  Budōnezumi: '#63424b', // 葡萄鼠
  Ebizome: '#6d2b50', // 蒲萄
  Fujisusutake: '#4d3b3c', // 藤煤竹
  Bōtan: '#a4345d', // 牡丹
  Umemurasaki: '#8f4155', // 梅紫
  Nisemurasaki: '#43242a', // 似せ紫
  Murasakitobi: '#512c31', // 紫鳶
  "Su'ō": '#7e2639', // 蘇芳
  Benikeshinezumi: '#44312e', // 紅消鼠
  Shironeri: '#ffddca', // 白練
  Shironezumi: '#b9a193', // 白鼠
  Ginnezumi: '#97867c', // 銀鼠
  Sunezumi: '#6e5f57', // 素鼠
  Dobunezumi: '#4b3c39', // 丼鼠
  Aisumicha: '#393432', // 藍墨茶
  Binrōjizome: '#352925', // 檳榔子染
  'Sumi-iro': '#27221f', // 墨色
  Kokushoku: '#171412', // 黒色
  Aijiro: '#ebf6f7', // 藍白
} as const;

const japaneseNormalize = (s: string): string =>
  s
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

export type JapaneseColorName = keyof typeof japaneseColors;

export const japanese = {
  name: 'japanese',
  colors: japaneseColors,
  normalize: japaneseNormalize,
  defaultMetric: 'deltaE2000',
} as const satisfies Palette<JapaneseColorName>;
