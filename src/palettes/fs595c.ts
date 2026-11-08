import type { Palette } from '../types.js';
import { standardNormalize } from './normalize.js';

/**
 * Federal Standard 595C (FS595C) palette: US Federal Government
 * paint-color specification, widely used in military, aviation,
 * and government-equipment coatings. 682 entries.
 *
 * Source: 650 chips use the US General Services Administration's
 * measured FED-STD-595C and Change Notice 1 data, published in 2008
 * as a US Government work. The remaining 32 compatibility entries
 * are absent from GSA's data and retain their prior values from
 * Color::Names::FS595C. See NOTICE.md for sources and attribution.
 *
 * GSA measured CIELAB using the CIE 1964 10 degree observer. sRGB is
 * defined for the CIE 1931 2 degree observer, so the conversion has
 * an observer mismatch. Converted values outside the sRGB gamut are
 * clamped to its channel limits.
 *
 * Keys are the 5-digit FS codes prefixed with 'FS ' (e.g.
 * 'FS 11136'). Common names like "Insignia Red" are captured as
 * trailing comments on each entry for human readers but are NOT
 * used as lookup keys: the spec reuses many across different
 * chips (18 different "Green"s, 11 "Tan"s, etc.). Lookups still
 * accept any casing and punctuation via standardNormalize, so
 * 'fs11136', 'FS-11136', and 'FS 11136' all resolve identically.
 * 191 of 682 entries retain a common name
 * from Color::Names::FS595C.
 */
const fs595cColors = {
  'FS 10032': '#473f3f',
  'FS 10045': '#605452',
  'FS 10049': '#534040',
  'FS 10055': '#6d4c3f',
  'FS 10059': '#5f504b',
  'FS 10070': '#5a4842',
  'FS 10075': '#654a46',
  'FS 10076': '#7a453f',
  'FS 10080': '#625046',
  'FS 10091': '#7e4c3f',
  'FS 10115': '#9e674b',
  'FS 10129': '#876f55',
  'FS 10219': '#947867',
  'FS 10233': '#a2756a',
  'FS 10260': '#c8a36d',
  'FS 10266': '#a9855c',
  'FS 10324': '#ad9282',
  'FS 10371': '#c58f61',
  'FS 11086': '#9f3c3e',
  'FS 11105': '#a13b3f',
  'FS 11120': '#b24341',
  'FS 11136': '#8c4040', // Insignia Red
  'FS 11140': '#a23d3f',
  'FS 11302': '#b84d48',
  'FS 11310': '#b74440',
  'FS 11328': '#af4e55',
  'FS 11350': '#ac3e42',
  'FS 11400': '#ca5144',
  'FS 11630': '#ddb7b0', // Pink
  'FS 11670': '#f1cbb2',
  'FS 12160': '#ac624f',
  'FS 12197': '#c24e3a', // International Orange
  'FS 12199': '#dd483a',
  'FS 12215': '#cb5d3c',
  'FS 12243': '#d26a38',
  'FS 12246': '#d45b3a',
  'FS 12250': '#d34e37',
  'FS 12300': '#e07a2f',
  'FS 12473': '#e06e39',
  'FS 12648': '#e6be9a',
  'FS 13275': '#b9823a',
  'FS 13415': '#e99533',
  'FS 13432': '#eb9531',
  'FS 13507': '#fca829',
  'FS 13522': '#c7b69b',
  'FS 13523': '#d7b784',
  'FS 13531': '#cdb79f',
  'FS 13538': '#f19e1e', // Orange Yellow
  'FS 13578': '#d6c19e',
  'FS 13591': '#f1c136',
  'FS 13594': '#ebbf81',
  'FS 13596': '#e3ba7f',
  'FS 13613': '#e7c69f',
  'FS 13618': '#eec368',
  'FS 13637': '#dda33b',
  'FS 13655': '#fcb217', // Blue Angels Yellow
  'FS 13670': '#d8cc64', // Lime Yellow
  'FS 13690': '#e2cdad',
  'FS 13695': '#f2c883',
  'FS 13711': '#eacda8',
  'FS 13740': '#e8d7c1',
  'FS 13814': '#e0db9b',
  'FS 14036': '#3f4946',
  'FS 14050': '#4c4f4a',
  'FS 14052': '#4c4d47', // Green
  'FS 14056': '#474c48',
  'FS 14062': '#3d5846', // Dark Green
  'FS 14064': '#525048',
  'FS 14066': '#2b5b4a',
  'FS 14077': '#4e534e',
  'FS 14079': '#55564b',
  'FS 14081': '#535346',
  'FS 14084': '#484641',
  'FS 14087': '#3c3727', // Olive Drab
  'FS 14090': '#2d6e4e',
  'FS 14097': '#636753',
  'FS 14108': '#2a563f',
  'FS 14109': '#30604c',
  'FS 14110': '#446b46',
  'FS 14115': '#35765a', // Green
  'FS 14120': '#0f7c5e',
  'FS 14151': '#666241',
  'FS 14158': '#6b7874',
  'FS 14159': '#72796d',
  'FS 14187': '#5b7a41',
  'FS 14193': '#389154',
  'FS 14223': '#648669',
  'FS 14241': '#839d91',
  'FS 14255': '#948663',
  'FS 14257': '#918a68',
  'FS 14260': '#699a7b',
  'FS 14272': '#77987c',
  'FS 14277': '#889990',
  'FS 14325': '#81a693',
  'FS 14449': '#a4b595',
  'FS 14491': '#a7bba5',
  'FS 14516': '#aebfad',
  'FS 14533': '#adb792',
  'FS 14664': '#bcd0b6',
  'FS 14672': '#cdd2b5',
  'FS 15042': '#3e464a', // Sea Blue
  'FS 15044': '#3c434b', // Insignia Blue
  'FS 15045': '#3b4851',
  'FS 15048': '#39495b',
  'FS 15050': '#384c60', // "Blue Angels"  Blue
  'FS 15052': '#325273',
  'FS 15053': '#263b56',
  'FS 15055': '#384869',
  'FS 15056': '#364871', // Blue
  'FS 15065': '#1c5f80',
  'FS 15080': '#36596d',
  'FS 15090': '#205d78',
  'FS 15092': '#027aa0',
  'FS 15095': '#236ca4',
  'FS 15102': '#2c698d', // Dark Blue
  'FS 15107': '#5f8291',
  'FS 15109': '#4f7180',
  'FS 15123': '#3970a0',
  'FS 15125': '#007488',
  'FS 15177': '#5a8093',
  'FS 15180': '#1d76a5',
  'FS 15182': '#0f86aa',
  'FS 15187': '#009bbc',
  'FS 15193': '#56888d',
  'FS 15200': '#4eb7c8', // Sky Blue
  'FS 15450': '#8ab8ca', // Air Superiority Blue
  'FS 15526': '#aac0c2',
  'FS 16076': '#5a6066',
  'FS 16081': '#565959', // Engine Gray
  'FS 16099': '#596265',
  'FS 16152': '#5c6369',
  'FS 16160': '#857257',
  'FS 16165': '#777366',
  'FS 16187': '#757e7d',
  'FS 16231': '#767b7f',
  'FS 16250': '#848b89',
  'FS 16251': '#858989',
  'FS 16293': '#8f9594',
  'FS 16307': '#96988e',
  'FS 16314': '#949993',
  'FS 16329': '#8e9f9d',
  'FS 16350': '#958c78',
  'FS 16357': '#a4a092',
  'FS 16360': '#afa793',
  'FS 16376': '#a1a297',
  'FS 16405': '#c0b6a0',
  'FS 16440': '#b5b4aa', // Light Gull Gray
  'FS 16473': '#a1aba6', // Aircraft Gray
  'FS 16480': '#adbab3',
  'FS 16492': '#bcbcb4',
  'FS 16515': '#bec1bc', // Canadian Voodoo Gray
  'FS 16555': '#c9bca0',
  'FS 17038': '#383838', // Black
  'FS 17043': '#b89964', // Gold
  'FS 17100': '#6c5574', // Purple
  'FS 17142': '#925f82',
  'FS 17155': '#8d658d',
  'FS 17178': '#c3c6c6', // Aluminum / Silver
  'FS 17200': '#919699',
  'FS 17773': '#dde2d4',
  'FS 17778': '#e9e0c7',
  'FS 17855': '#ecdcb9',
  'FS 17860': '#e8e8dc',
  'FS 17865': '#e1e5e0',
  'FS 17875': '#e7e8db', // Insignia White
  'FS 17877': '#e5efe8',
  'FS 17886': '#f0ead7',
  'FS 17925': '#f2f3ea', // Insignia White
  'FS 20040': '#534b46',
  'FS 20045': '#615553',
  'FS 20059': '#5e4e4a',
  'FS 20061': '#654948', // Maroon
  'FS 20062': '#5a504e', // Brown
  'FS 20065': '#60564e',
  'FS 20068': '#62584a',
  'FS 20090': '#695445',
  'FS 20095': '#776759',
  'FS 20100': '#865947', // Brown Yellow
  'FS 20109': '#85534a', // Red Brown
  'FS 20117': '#7f5e4e',
  'FS 20122': '#745949',
  'FS 20129': '#876f55',
  'FS 20140': '#826a5d', // Brown Special
  'FS 20150': '#7b6851',
  'FS 20152': '#8c4f48',
  'FS 20155': '#7f5f4d',
  'FS 20170': '#83715d',
  'FS 20180': '#867965',
  'FS 20206': '#987c77',
  'FS 20219': '#947967',
  'FS 20220': '#927f6a',
  'FS 20227': '#9b8474',
  'FS 20233': '#a2776b',
  'FS 20252': '#b07866', // Tan
  'FS 20260': '#caa470', // Tan
  'FS 20266': '#a9875d', // Yellow Sand
  'FS 20270': '#a29283',
  'FS 20313': '#b2978a',
  'FS 20318': '#a99881',
  'FS 20372': '#af9e8b',
  'FS 20400': '#ca9c76', // Tan
  'FS 20450': '#c3a692', // Night Tan
  'FS 20460': '#c3b6a1',
  'FS 20475': '#d0b08f',
  'FS 21105': '#99403f', // Red
  'FS 21136': '#8f4443',
  'FS 21158': '#b65a64',
  'FS 21302': '#b84d49',
  'FS 21310': '#ba4842', // Red
  'FS 21400': '#cc5347', // Red
  'FS 21433': '#ca9886',
  'FS 21575': '#dfb6a3',
  'FS 21643': '#e8ccb3',
  'FS 21667': '#e8caab',
  'FS 21668': '#e8cbc0',
  'FS 21670': '#f0c9b1',
  'FS 22144': '#a65747',
  'FS 22190': '#cd4a3a', // Red
  'FS 22203': '#b8614b',
  'FS 22246': '#d95f3c',
  'FS 22276': '#c27360',
  'FS 22356': '#d68170',
  'FS 22473': '#de6e3a',
  'FS 22510': '#f36730',
  'FS 22516': '#d79775', // Tan
  'FS 22519': '#d5af95',
  'FS 22544': '#ee9353',
  'FS 22563': '#dab99b',
  'FS 22630': '#e3bfa3',
  'FS 22648': '#e5be99',
  'FS 23275': '#be833d',
  'FS 23420': '#857e6d',
  'FS 23430': '#9f9178',
  'FS 23435': '#9e937b',
  'FS 23448': '#baa07c',
  'FS 23522': '#c9b89d',
  'FS 23525': '#bfb4a3',
  'FS 23530': '#b4a697',
  'FS 23531': '#d0bba3',
  'FS 23538': '#f1a025',
  'FS 23540': '#e0a14c',
  'FS 23564': '#d7c49c',
  'FS 23578': '#d7c29f', // Cream
  'FS 23594': '#e9bf82', // Beige
  'FS 23613': '#eac8a2',
  'FS 23617': '#d7c3a9',
  'FS 23619': '#e1c59d',
  'FS 23640': '#fdb424',
  'FS 23655': '#fdb320', // Yellow
  'FS 23685': '#e2d6a1',
  'FS 23690': '#e3cdac',
  'FS 23695': '#f1c784',
  'FS 23697': '#edc884', // Yellow Sand
  'FS 23711': '#eacda8',
  'FS 23717': '#e7d1af',
  'FS 23722': '#e7d0a5', // Sand
  'FS 23727': '#ebd5a3',
  'FS 23785': '#eec654',
  'FS 23793': '#f3dc8c',
  'FS 23814': '#e0dc9c',
  'FS 24052': '#4d4e48', // Green
  'FS 24064': '#545249',
  'FS 24070': '#4c524e',
  'FS 24079': '#55574d', // Forest Green
  'FS 24084': '#4a4843',
  'FS 24087': '#454031',
  'FS 24091': '#64605d',
  'FS 24097': '#616651',
  'FS 24098': '#666249',
  'FS 24108': '#4e6757',
  'FS 24111': '#525f4f',
  'FS 24112': '#556257',
  'FS 24119': '#616353',
  'FS 24148': '#627675',
  'FS 24158': '#6a7874',
  'FS 24159': '#737a6e',
  'FS 24165': '#6d6f69',
  'FS 24172': '#6d7a68',
  'FS 24190': '#529b57',
  'FS 24201': '#897f6b',
  'FS 24210': '#80745d',
  'FS 24226': '#808b7b',
  'FS 24227': '#7d8b6f',
  'FS 24233': '#80928d',
  'FS 24241': '#839e91',
  'FS 24260': '#68977a',
  'FS 24272': '#78987c', // Green
  'FS 24277': '#869a91',
  'FS 24300': '#859d8d',
  'FS 24325': '#80a694',
  'FS 24373': '#99a78e',
  'FS 24410': '#a0b0a0', // Green
  'FS 24417': '#a9b09b',
  'FS 24424': '#acae96',
  'FS 24432': '#a8af9d',
  'FS 24441': '#a9b399',
  'FS 24449': '#a3b495',
  'FS 24466': '#a1b59c',
  'FS 24491': '#a6baa4',
  'FS 24504': '#abb8a0',
  'FS 24516': '#b0c1af',
  'FS 24518': '#aab9a5',
  'FS 24525': '#b1bca2',
  'FS 24533': '#adb894',
  'FS 24552': '#cac186',
  'FS 24554': '#cecdb0',
  'FS 24558': '#b7c6a7',
  'FS 24583': '#b7ba9d',
  'FS 24585': '#c3d9bc',
  'FS 24664': '#bcd1b7',
  'FS 24670': '#c7d4bf',
  'FS 24672': '#ccd2b6',
  'FS 25042': '#40474b',
  'FS 25045': '#3b4a52',
  'FS 25048': '#374a5c',
  'FS 25049': '#434548',
  'FS 25051': '#4b5463',
  'FS 25052': '#33516e',
  'FS 25053': '#405367',
  'FS 25056': '#36496e',
  'FS 25060': '#414f5e',
  'FS 25095': '#276da3',
  'FS 25102': '#2e698e',
  'FS 25109': '#507182',
  'FS 25177': '#5d8092',
  'FS 25183': '#2a83ac',
  'FS 25184': '#528495',
  'FS 25185': '#2c869d',
  'FS 25189': '#6d878d',
  'FS 25190': '#5d8d9f',
  'FS 25193': '#588a8e',
  'FS 25200': '#4cb7ca',
  'FS 25230': '#4291c2',
  'FS 25237': '#7c8a8e',
  'FS 25240': '#7596b1',
  'FS 25299': '#75a199',
  'FS 25352': '#89a09c', // Blue
  'FS 25414': '#8eaaa6',
  'FS 25440': '#7fafc5',
  'FS 25466': '#83c2e5',
  'FS 25488': '#96bacd',
  'FS 25526': '#a9bfc2',
  'FS 25530': '#b6c4c3',
  'FS 25550': '#c5d7d8', // Light Blue
  'FS 25622': '#c8d2c7',
  'FS 25630': '#d4d4cb',
  'FS 26008': '#565b5e', // Dark Gray
  'FS 26044': '#474d51', // Gray
  'FS 26081': '#585b5a', // Seaplane Gray
  'FS 26099': '#5a6266',
  'FS 26118': '#5c646a',
  'FS 26120': '#615752',
  'FS 26122': '#6b6867',
  'FS 26132': '#6b6e70',
  'FS 26134': '#6f706d',
  'FS 26152': '#6e7475', // Gray
  'FS 26173': '#798186',
  'FS 26176': '#757f87',
  'FS 26187': '#757c7c',
  'FS 26231': '#828787',
  'FS 26250': '#858c89',
  'FS 26251': '#878a89',
  'FS 26255': '#828688',
  'FS 26260': '#8a8a80',
  'FS 26270': '#888f90', // Medium Gray
  'FS 26280': '#8e928e',
  'FS 26290': '#8d9190',
  'FS 26293': '#8e9494',
  'FS 26295': '#a1a3a5',
  'FS 26306': '#9b9288',
  'FS 26307': '#94958b',
  'FS 26314': '#939994',
  'FS 26329': '#90a09e',
  'FS 26357': '#a4a193',
  'FS 26360': '#afa895',
  'FS 26373': '#a3a8a6',
  'FS 26380': '#a2a9ab',
  'FS 26400': '#ccc1a6',
  'FS 26405': '#c0b7a0',
  'FS 26408': '#bdbaab',
  'FS 26420': '#b3afab',
  'FS 26424': '#beb6aa',
  'FS 26440': '#b4b4aa', // Light Gull Gray
  'FS 26480': '#aebbb4',
  'FS 26492': '#bcbbb4',
  'FS 26493': '#b7bbb7',
  'FS 26496': '#b2b2a6',
  'FS 26521': '#c5b9aa',
  'FS 26555': '#c9bda1',
  'FS 26559': '#c1beae',
  'FS 26586': '#cdc3a9',
  'FS 26595': '#c3c2b2',
  'FS 26622': '#c5c3b6',
  'FS 26630': '#ced0ca',
  'FS 27038': '#3b3c3d', // Black
  'FS 27040': '#414243',
  'FS 27041': '#414244',
  'FS 27043': '#ba9c69',
  'FS 27142': '#915f82',
  'FS 27144': '#806b88',
  'FS 27160': '#8d83b7',
  'FS 27722': '#ddd8c9',
  'FS 27769': '#e0d3ba',
  'FS 27778': '#ece2c8',
  'FS 27780': '#ece5d2', // White
  'FS 27855': '#ecdcb9',
  'FS 27875': '#e8e9dc', // Insignia White
  'FS 27880': '#f6eeda',
  'FS 27885': '#f4f2e5',
  'FS 27886': '#f0ead6',
  'FS 27925': '#eff1e7',
  'FS 28913': '#f74432',
  'FS 28915': '#ff5a23',
  'FS 30040': '#514741',
  'FS 30045': '#5a4945', // Brown
  'FS 30051': '#5a4d45', // Leather Brown
  'FS 30059': '#513c34',
  'FS 30076': '#620000',
  'FS 30097': '#614f41', // Brown
  'FS 30099': '#685748', // Brown
  'FS 30108': '#5d453b', // Red Brown
  'FS 30109': '#834d43',
  'FS 30111': '#704d46', // Brown
  'FS 30117': '#805d4c', // Earth Red
  'FS 30118': '#705b41', // Field Drab
  'FS 30129': '#876f55',
  'FS 30140': '#7b604e', // Brown Special
  'FS 30145': '#7f624a',
  'FS 30152': '#843320',
  'FS 30160': '#75454e', // Brown
  'FS 30166': '#834f45',
  'FS 30206': '#916f69',
  'FS 30215': '#926649', // Brown
  'FS 30219': '#91735f', // Tan
  'FS 30227': '#9a7f6e', // Tan
  'FS 30233': '#9d6e61',
  'FS 30252': '#b0755e',
  'FS 30257': '#b8895b', // Tan
  'FS 30266': '#a58052', // Yellow Sand
  'FS 30277': '#9b8970', // Sand Brown
  'FS 30279': '#ae917e', // Sand
  'FS 30313': '#ac8f80',
  'FS 30315': '#ae9380',
  'FS 30318': '#a9967b',
  'FS 30324': '#aa8e7c',
  'FS 30340': '#a8927e',
  'FS 30372': '#ac9a85', // Sand
  'FS 30400': '#c29963', // Yellow Sand
  'FS 30450': '#c5a892',
  'FS 30475': '#c9a987',
  'FS 30480': '#cdab8a',
  'FS 31090': '#79543b', // Brown
  'FS 31136': '#90403d', // Insignia Red
  'FS 31158': '#b25760',
  'FS 31302': '#ba463e', // Red
  'FS 31310': '#bc4334',
  'FS 31350': '#af3837', // Red
  'FS 31400': '#c24a3a', // Red
  'FS 31433': '#c4917f',
  'FS 31575': '#d9b19b',
  'FS 31638': '#e3abac',
  'FS 31643': '#e6c8ae',
  'FS 31667': '#e8c6a7',
  'FS 31668': '#e9cbbf',
  'FS 31669': '#e9c7c2',
  'FS 31670': '#f1cab3',
  'FS 32169': '#a95536',
  'FS 32246': '#d35b35',
  'FS 32276': '#be6c56',
  'FS 32356': '#d57b68',
  'FS 32473': '#e16e33', // Orange
  'FS 32516': '#d6946f',
  'FS 32540': '#fb8e43',
  'FS 32544': '#ee934e',
  'FS 32555': '#ee9f5b',
  'FS 32630': '#e1bb9d',
  'FS 32648': '#e4ba96', // Sand
  'FS 33070': '#564f3c',
  'FS 33105': '#715b41', // Brown
  'FS 33245': '#a57b52', // Tan
  'FS 33275': '#ba7f2d',
  'FS 33303': '#a19073', // Sand
  'FS 33432': '#e59a00',
  'FS 33434': '#d2994e', // Ochre
  'FS 33440': '#9e8258', // Tan
  'FS 33446': '#b79d7f', // Dessert Tan
  'FS 33448': '#bb9f7a', // Dark Yellow
  'FS 33481': '#c8a54a',
  'FS 33510': '#bfab8f',
  'FS 33522': '#c6b296',
  'FS 33531': '#c9b49d', // Middlestone
  'FS 33538': '#f5a01c', // Orange Yellow
  'FS 33564': '#d8c39b',
  'FS 33578': '#d7c29f',
  'FS 33591': '#e8d300',
  'FS 33613': '#eac6a1', // Radome Tan
  'FS 33617': '#d3bfa2', // Sand
  'FS 33637': '#dea022',
  'FS 33655': '#f9af00',
  'FS 33685': '#e2d59f',
  'FS 33690': '#e0cbaa', // Sand
  'FS 33695': '#f0c57b', // Yellow Sand
  'FS 33696': '#ffc667',
  'FS 33711': '#e7caa5', // Sand
  'FS 33717': '#e8d1ae', // Sand
  'FS 33722': '#e7cea3',
  'FS 33727': '#ebd5a3',
  'FS 33793': '#f5dc8d',
  'FS 33798': '#f6d899',
  'FS 33814': '#dbd799',
  'FS 34031': '#484742', // Dark Green
  'FS 34052': '#4c4e47', // USMC Green
  'FS 34056': '#232d24',
  'FS 34058': '#305250', // Sea Blue
  'FS 34062': '#00401e',
  'FS 34064': '#4c4b41', // Dark Green
  'FS 34077': '#2e3933', // Green
  'FS 34079': '#555547', // Forest Green
  'FS 34082': '#575c42', // Green
  'FS 34083': '#494a3b', // Green
  'FS 34084': '#45433d', // Green
  'FS 34086': '#56544b', // I. R. Dark Green
  'FS 34087': '#554f44', // Olive Drab
  'FS 34088': '#675e4b', // Olive Drab
  'FS 34089': '#625e38',
  'FS 34090': '#1f6947',
  'FS 34092': '#495950', // Dark Green
  'FS 34094': '#4f5443', // Green
  'FS 34095': '#51533d', // Field Green
  'FS 34096': '#555546', // Dark Green
  'FS 34097': '#5d6248', // Field Green
  'FS 34098': '#656042', // Green
  'FS 34102': '#595b44', // Light Green
  'FS 34108': '#476653', // Medium Green
  'FS 34115': '#005d39',
  'FS 34127': '#625e40', // Green
  'FS 34128': '#5a6651', // Deep Green
  'FS 34129': '#5c5b4a',
  'FS 34130': '#5e5a3b',
  'FS 34138': '#587648', // Green
  'FS 34148': '#59716f',
  'FS 34151': '#67633c', // Interior Green
  'FS 34158': '#62706d',
  'FS 34159': '#6b7366', // Green
  'FS 34160': '#676961',
  'FS 34170': '#616153',
  'FS 34172': '#556f56',
  'FS 34201': '#847962', // Tan Green
  'FS 34226': '#7b8676',
  'FS 34227': '#7b8a6d', // Medium Gray Green
  'FS 34230': '#578f4d', // Green
  'FS 34233': '#7d8f8a',
  'FS 34241': '#809b8d',
  'FS 34258': '#828159', // Green
  'FS 34259': '#857134', // Yellow Green
  'FS 34272': '#729475',
  'FS 34277': '#819489',
  'FS 34300': '#849b8c',
  'FS 34325': '#81a694',
  'FS 34350': '#6ec7af',
  'FS 34373': '#99a78e',
  'FS 34410': '#9eae9e',
  'FS 34414': '#adb8a2', // Green
  'FS 34424': '#abad94', // Light Gray Green
  'FS 34432': '#a6ad9b',
  'FS 34441': '#a6b094',
  'FS 34449': '#a4b596',
  'FS 34491': '#a4b9a2',
  'FS 34504': '#a8b59b',
  'FS 34516': '#b1c0ad',
  'FS 34518': '#a8b6a2',
  'FS 34524': '#b3ba90',
  'FS 34533': '#abb68f',
  'FS 34540': '#9cc47e',
  'FS 34552': '#c9be81', // Light Green
  'FS 34554': '#cccaad', // Sky
  'FS 34558': '#bac8a9',
  'FS 34583': '#b4b697',
  'FS 34666': '#d2da9f', // Green
  'FS 34670': '#c9d3c0',
  'FS 34672': '#cad0b3',
  'FS 35042': '#3d4549', // Sea Blue
  'FS 35044': '#383b48', // Insignia Blue
  'FS 35045': '#35444d', // Dark Blue
  'FS 35048': '#33445a',
  'FS 35050': '#18324d',
  'FS 35052': '#324e6a', // Blue
  'FS 35053': '#263b56',
  'FS 35056': '#33436a',
  'FS 35095': '#1f639a',
  'FS 35109': '#466b7d', // Dark Blue
  'FS 35115': '#035c3c',
  'FS 35164': '#61727e', // Intermediate Blue
  'FS 35177': '#53798d', // Medium Blue
  'FS 35180': '#0b70a1',
  'FS 35182': '#2a6da2',
  'FS 35183': '#187da6',
  'FS 35189': '#6f868b', // Blue Gray
  'FS 35190': '#5a8b9d', // Dark Blue
  'FS 35193': '#51868b',
  'FS 35231': '#698aab', // Azure Blue
  'FS 35237': '#7a898d', // Gray Blue
  'FS 35240': '#6e92b0', // Blue
  'FS 35250': '#42a2c8', // Blue
  'FS 35260': '#30abc7',
  'FS 35275': '#289fa1',
  'FS 35299': '#70a097',
  'FS 35352': '#819b96', // Blue
  'FS 35414': '#86a4a0', // Blue
  'FS 35450': '#84b2c4', // Air Superiority Blue
  'FS 35466': '#76c7d7',
  'FS 35488': '#93b9cc',
  'FS 35526': '#a3bbbd', // Light Sky Blue
  'FS 35550': '#c5d8d8',
  'FS 35622': '#c6d0c6', // Light Blue
  'FS 35630': '#d2d2c8',
  'FS 36076': '#4c5259', // Gray
  'FS 36081': '#575a59', // Dark Gunship Gray
  'FS 36099': '#515c60', // Dark Gray
  'FS 36118': '#5b6268', // Medium Gunship Gray
  'FS 36134': '#676864',
  'FS 36152': '#676e70', // Gray
  'FS 36170': '#6d6d6b',
  'FS 36173': '#6f787e', // Neutral Gray
  'FS 36176': '#6d7881', // Dark Gull Gray
  'FS 36187': '#697374',
  'FS 36231': '#7f8586', // Dark Gull Gray
  'FS 36251': '#828584', // Gray
  'FS 36270': '#848a8c', // Medium Gray
  'FS 36280': '#898d8a', // Dark Gray
  'FS 36293': '#898f8f',
  'FS 36300': '#91989d', // Aircraft Exterior Gray
  'FS 36306': '#988e84',
  'FS 36307': '#96978e', // Gray
  'FS 36314': '#8f9590', // Flint Gray
  'FS 36320': '#8a969c', // Dark Compass Ghost Gray
  'FS 36329': '#849899', // Light Gray
  'FS 36357': '#a09c8e',
  'FS 36373': '#9ba2a1', // Light Gray
  'FS 36375': '#9ba5a9', // Light Compass Ghost Gray
  'FS 36400': '#c3c19b',
  'FS 36405': '#beb49d',
  'FS 36415': '#bdab91',
  'FS 36424': '#bcb3a6', // Medium Gray
  'FS 36440': '#aeada2', // Light Gull Gray
  'FS 36463': '#a5a9a8', // Gray
  'FS 36473': '#9da9a5', // Sky Gray
  'FS 36480': '#aab7b0',
  'FS 36492': '#bbbbb3', // Gray
  'FS 36495': '#c3c8c5', // Light Gray
  'FS 36521': '#c3b7a7', // Tan
  'FS 36555': '#cbbda0', // Tan
  'FS 36559': '#c2bfae', // Gray
  'FS 36586': '#cabfa6',
  'FS 36595': '#c3c3b3',
  'FS 36622': '#c3c1b3', // Gray
  'FS 36628': '#cbcec6', // Flat Aluminum
  'FS 36642': '#e2ccb6',
  'FS 36650': '#e3e0d6',
  'FS 37030': '#363738',
  'FS 37031': '#353637', // Black Gray
  'FS 37038': '#373838', // Black
  'FS 37043': '#807537',
  'FS 37056': '#4c4542',
  'FS 37100': '#644871', // Purple
  'FS 37142': '#8f567d',
  'FS 37144': '#7d6686',
  'FS 37150': '#d1c8b9',
  'FS 37178': '#879296',
  'FS 37200': '#9c9d9d',
  'FS 37722': '#dad4c3',
  'FS 37769': '#e1d3bb',
  'FS 37778': '#e8dec6',
  'FS 37855': '#ecdcb8', // White
  'FS 37875': '#e4e5d8', // Insignia White
  'FS 37886': '#efe8d5',
  'FS 37925': '#f0f1e5', // Insignia White
  'FS 38901': '#10a03e',
  'FS 38903': '#ff520b',
  'FS 38905': '#fc3b2c',
  'FS 38907': '#ffa900',
  'FS 38913': '#ff2d00',
} as const;

export type Fs595cColorName = keyof typeof fs595cColors;

/**
 * Federal Standard 595C paint-color specification
 * (682 entries), widely used in US military,
 * aviation, and government-equipment coatings. Revised from
 * the 1989 FS595B; pick whichever revision matches your
 * reference documentation. Default metric CIEDE2000 for the
 * dense olive / tan / grey regions where ΔE76 mis-ranks.
 *
 * @example
 * identify('#8c4040', { palette: fs595c });         // 'FS 11136' (aka "Insignia Red")
 * resolve('FS 11136', { palette: fs595c });         // '#8c4040'
 * resolve('fs-11136', { palette: fs595c });         // '#8c4040' (normalize strips casing + dash)
 * fs595c.colors['FS 10032'];                        // '#473f3f'
 */
export const fs595c = {
  name: 'fs595c',
  colors: fs595cColors,
  normalize: standardNormalize,
  defaultMetric: 'deltaE2000',
} as const satisfies Palette<Fs595cColorName>;
