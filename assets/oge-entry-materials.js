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
  if (!Object.hasOwn(sections, id)) return [];
  return [
    {n: 'Теория № 18 · раздел квадратика', u: 'teoriya-oge-18-geometriya-na-kletkah.html#' + sections[id]},
    {n: 'Входной тест № 18', u: 'vhodnoy-test-oge-18-geometriya-na-kletkah.html'}
  ];
};
