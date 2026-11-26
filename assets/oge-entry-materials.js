'use strict';

window.LiliOgeEntryMaterials = function (id) {
  const sections = {
    'OGE-18-1': 'ugly',
    'OGE-18-2': 'rasstoyanie',
    'OGE-18-3': 'treugolnik',
    'OGE-18-4': 'pryamougolnyy',
    'OGE-18-5': 'parallelogram',
    'OGE-18-6': 'romb',
    'OGE-18-7': 'trapetsiya',
    'OGE-18-8': 'mnogougolnik'
  };
  const theoryByTile = {
    'OGE-01-1': 'pdf-teoriya/oge-05-prakticheskie-zadachi-teoriya.pdf#page=8',
    'OGE-02-1': 'pdf-teoriya/oge-05-prakticheskie-zadachi-teoriya.pdf#page=3',
    'OGE-03-1': 'teoriya-oge-18-geometriya-na-kletkah.html#mnogougolnik',
    'OGE-04-1': 'teoriya-oge-18-geometriya-na-kletkah.html#pryamougolnyy',
    'OGE-05-1': 'pdf-teoriya/oge-05-prakticheskie-zadachi-teoriya.pdf',
    'OGE-06-1': 'z6-obyknovennye-teoriya.html',
    'OGE-06-2': 'z6-drobi.html',
    'OGE-06-3': 'z6-drobi.html',
    'OGE-06-4': 'pdf-teoriya/stepen-teoriya-8.pdf',
    'OGE-07-1': 'pdf-teoriya/oge7-teoriya.pdf',
    'OGE-07-2': 'pdf-teoriya/oge7-teoriya.pdf',
    'OGE-08-1': 'pdf-teoriya/oge-8-teoriya.pdf',
    'OGE-08-2': 'pdf-teoriya/oge-8-teoriya.pdf',
    'OGE-08-3': 'pdf-teoriya/oge-8-teoriya.pdf',
    'OGE-09-1': 'teoriya-oge-9-lineynye-uravneniya.html',
    'OGE-09-2': 'teoriya-oge-9-kvadratnye-uravneniya.html',
    'OGE-09-3': 'teoriya-oge-9-sistemy-uravneniy.html',
    'OGE-10-1': 'pdf-teoriya/oge-10-teoriya.pdf',
    'OGE-10-2': 'pdf-teoriya/oge-10-teoriya.pdf',
    'OGE-11-1': 'z22-grafiki-teoriya.pdf',
    'OGE-11-2': 'pdf-teoriya/oge-22-grafiki-i-parametr-teoriya.pdf',
    'OGE-12-1': 'pdf-teoriya/oge-12-raschyoty-po-formulam-teoriya.pdf',
    'OGE-13-1': 'pdf-teoriya/oge-13-neravenstva-teoriya.pdf',
    'OGE-13-2': 'pdf-teoriya/oge-13-neravenstva-teoriya.pdf',
    'OGE-13-3': 'pdf-teoriya/oge-13-neravenstva-teoriya.pdf',
    'OGE-13-4': 'pdf-teoriya/oge-13-neravenstva-teoriya.pdf',
    'OGE-14-1': 'pdf-teoriya/oge-14-progressii-teoriya.pdf',
    'OGE-14-2': 'pdf-teoriya/oge-14-progressii-teoriya.pdf',
    'OGE-15-1': 'teoriya-oge-15-1-ugly.html',
    'OGE-15-2': 'teoriya-oge-15-2-ravnobedrennyy-ugly.html',
    'OGE-15-3': 'teoriya-oge-15-3-ravnobedrennyy-elementy.html',
    'OGE-15-4': 'teoriya-oge-15-4-pryamougolnyy-ugly.html',
    'OGE-15-5': 'teoriya-oge-15-5-pryamougolnyy-elementy.html',
    'OGE-15-6': 'pdf-teoriya/oge-17-chetyryokhugolniki-teoriya.pdf',
    'OGE-15-7': 'teoriya-9g-pravilnye-mnogougolniki.html',
    'OGE-16-1': 'pdf-teoriya/oge-16-okruzhnost-i-krug-teoriya.pdf',
    'OGE-16-2': 'pdf-teoriya/oge-16-okruzhnost-i-krug-teoriya.pdf',
    'OGE-17-1': 'pdf-teoriya/oge-17-chetyryokhugolniki-teoriya.pdf',
    'OGE-17-2': 'teoriya-8g-ploshchad-pryamougolnika-kvadrata.html',
    'OGE-17-3': 'teoriya-8g-ploshchad-parallelogramma.html',
    'OGE-17-4': 'teoriya-8g-ploshchad-treugolnika.html',
    'OGE-17-5': 'teoriya-8g-ploshchad-treugolnika.html',
    'OGE-17-6': 'teoriya-8g-ploshchad-treugolnika.html',
    'OGE-17-7': 'teoriya-8g-ploshchad-trapetsii.html',
    'OGE-17-8': 'teoriya-9g-ploshchad-kruga.html',
    'OGE-19-1': 'pdf-teoriya/oge-19-geometricheskie-utverzhdeniya-teoriya.pdf'
  };
  const match = /^OGE-(0[1-9]|1[0-9])-\d{1,2}$/.exec(id);
  if (!match) return [];
  const number = Number(match[1]);
  if (number !== 18) {
    const theory = theoryByTile[id];
    if (!theory) return [];
    return [
      {n: 'Входной тест № ' + number, u: 'vhodnye-testy-oge.html?n=' + number},
      {n: 'Теория квадратика', u: theory}
    ];
  }
  if (!Object.hasOwn(sections, id)) return [];
  return [
    {n: 'Теория № 18 · раздел квадратика', u: 'teoriya-oge-18-geometriya-na-kletkah.html#' + sections[id]},
    {n: 'Входной тест № 18', u: 'vhodnoy-test-oge-18-geometriya-na-kletkah.html'}
  ];
};
