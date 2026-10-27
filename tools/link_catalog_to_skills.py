#!/usr/bin/env python3
"""Проставляет в catalog.json поле node: список ID из skills-by-grade.json (любой уровень: 7A, 7A.4, 7A.4.2).
Правила привязки ниже; новые материалы добавляйте в RULES. Запуск: python3 tools/link_catalog_to_skills.py"""
import json, re, sys, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cat = json.load(open(f'{ROOT}/catalog.json', encoding='utf-8'))
ids = {n['id'] for n in json.load(open(f'{ROOT}/skills-by-grade.json', encoding='utf-8'))}
ids |= {'5A','6A','7A','8A','9A','5G','6G','7G','8G','9G'}
# (регулярка по имени файла, список ID). Первое совпадение выигрывает.
RULES = [
 (r'^z6-drobi', ['5A.5.3','5A.5.4']),
 (r'^z6-obyknovennye', ['6A.2.3','6A.2.4','6A.2.5']),
 (r'^z6-umn-del', ['5A.3.1','5A.3.2']),
 (r'^z7-koord-pryamaya', ['6A.5.2','8A.2.2']),
 (r'^z8-stepeni', ['7A.3','8A.1.6']),
 (r'^z8-korni', ['8A.2']),
 (r'^z10-veroyatnost', ['7A.7.2','9A.5.2']),
 (r'^z14-progressii', ['9A.4']),
 (r'^z15-bissektrisa', ['7G.2.3','7G.2.4']),
 (r'^z15-mediana-bissektrisa', ['7G.2.3','8G.3.2']),
 (r'^z15-mediana-polovina', ['8G.4.4']),
 (r'^z15-pifagor', ['8G.2.2']),
 (r'^z15-ploshchad', ['8G.2.1']),
 (r'^z15-ravnobedrennyy', ['7G.2.4']),
 (r'^z15-ravnostoronniy', ['7G.2.4','8G.2.1']),
 (r'^z15-sin-cos', ['8G.3.5']),
 (r'^z15-summa', ['7G.4.1']),
 (r'^z15-vysota', ['7G.2.3','7G.4.1']),
 (r'^z20-kvadratnye', ['8A.3']),
 (r'^z20-sistemy', ['7A.6','9A.3.1']),
 (r'^z20-neravenstva', ['8A.4','9A.2.3']),
 (r'^z20-drobno-ratsionalnye', ['8A.1.4','8A.3.5']),
 (r'^z21-dvizhenie', ['9A.3.2']),
 (r'^z21-procenty', ['6A.4','9A.3.2']),
 (r'^z21-smesi', ['9A.3.2']),
 (r'^z22-grafiki', ['7A.2','9A.1.4']),
 (r'^z22-funkcij', ['9A.1.2','9A.1.4','8A.1.5']),
 (r'^z23-trapeciya', ['8G.1.3']),
 (r'^razbor-(dvizhenie|smesi)-dialog', ['9A.3.2']),
 (r'^razbor-procenty-dialog', ['6A.4','9A.3.2']),
 (r'^razbor-kvadratnye-dialog', ['8A.3']),
 (r'^razbor-drobi-6-dialog', ['5A.5.3','5A.5.4']),
 (r'^razbor-obyknovennye-dialog', ['6A.2.3','6A.2.4']),
 (r'^razbor-drobi-dialog', ['6A.2']),
 (r'^razbor-sistemy-dialog', ['7A.6','9A.3.1']),
 (r'^razbor-neravenstva-dialog', ['8A.4','9A.2.3']),
 (r'^razbor-stepeni-dialog', ['7A.3','8A.1.6']),
 (r'^razbor-korni-dialog', ['8A.2']),
 (r'^razbor-progressii-dialog', ['9A.4']),
 (r'^razbor-veroyatnost-dialog', ['7A.7.2','9A.5.2']),
 (r'^razbor-(grafiki|funkcij)-dialog', ['9A.1.2','9A.1.4']),
 (r'^razbor-trapeciya-dialog', ['8G.1.3']),
 (r'^razbor-treugolniki-dialog', ['7G.2','7G.4','8G.3']),
 (r'^razbor-znaki-dialog', ['6A.5.3']),
 (r'^razbor-racionalnye-dialog', ['8A.1.3']),
 (r'^razbor-diag-5-geom', ['5G']), (r'^razbor-diag-6-geom', ['6G']),
 (r'^razbor-diag-7-geom', ['7G']), (r'^razbor-diag-8-geom', ['8G']),
 (r'^razbor-diag-6-klass|^razbor-diagnostika-6-klass', ['6A']),
 (r'^razbor-diag-7-klass', ['7A']), (r'^razbor-diag-8-klass', ['8A']),
 (r'^razbor-5-klass', ['5A']),
 (r'^diagnostika-5-geom', ['5G']), (r'^diagnostika-6-geom', ['6G']),
 (r'^diagnostika-7-geom', ['7G']), (r'^diagnostika-8-geom', ['8G']),
 (r'^diagnostika-5-kr|^diagnostiki-5-klass', ['5A']),
 (r'^diagnostika-6-klass', ['6A']), (r'^diagnostika-7-klass', ['7A']), (r'^diagnostika-8-klass', ['8A']),
 (r'^diagnostika-naturalnye-chisla', ['5A.1']),
 (r'^domashnee-zadanie-trapeciya', ['8G.1.3']),
 (r'^dz-chisla-s-raznymi-znakami', ['6A.5.3']),
 (r'^dz-desyatichnye-drobi', ['5A.5']),
 (r'^dz-procenty', ['6A.4']),
 (r'^dz-koren-1', ['8A.2']),
 (r'^dz-9-umnozhenie-delenie-drobey', ['6A.2.4']),
 (r'^7-klass', ['7A','7G']), (r'^8-klass', ['8A','8G']), (r'^9-klass', ['9A','9G']),
 (r'^drob-deistviya', ['6A.2.3','6A.2.4']), (r'^drob-s-nulya', ['5A.4']), (r'^materialy-drob', ['6A.2']),
 (r'^treug-s-nulya', ['7G.2']), (r'^znaki-s-nulya', ['6A.5.3']),
 (r'^ucheba-6-klass', ['6A']), (r'^ucheba-racionalnye', ['8A.1.3']), (r'^y-k-na-x', ['8A.1.5']),
 (r'^materialy-9-klass', ['9A','9G']),
 (r'^umk-8-9-zadanie-6', ['5A.5.4','6A.2.5']),
 (r'^obyasnenie-5-9-drobi', ['5A.5','6A.2']),
 (r'^obyasnenie-5-9-grafiki', ['7A.2','9A.1']),
 (r'^obyasnenie-5-9-kusochnaya', ['9A.1.4']),
 (r'^obyasnenie-5-9-arifm', ['9A.4.2']),
 (r'^obyasnenie-5-9-geom', ['9A.4.3']),
 (r'^obyasnenie-5-9-veroyat', ['9A.5.2']),
 (r'^obyasnenie-5-9-smesi', ['9A.3.2']),
 (r'^obyasnenie-5-9-korni', ['8A.2']),
 (r'^obyasnenie-5-9-stepeni', ['7A.3','8A.1.6']),
 (r'^obyasnenie-5-9-lineynye', ['6A.6.2','7A.1.5']),
 (r'^obyasnenie-5-9-kvadratnye', ['8A.3']),
 (r'^obyasnenie-5-9-neravenstva', ['8A.4','9A.2.3']),
 (r'^obyasnenie-5-9-sistemy', ['7A.6','9A.3']),
 (r'^obyasnenie-5-9-procenty', ['6A.4']),
 (r'^obyasnenie-5-9-dvizhenie', ['9A.3.2']),
 (r'^obyasnenie-5-9-treugolnik', ['7G.2','7G.4']),
 (r'^obyasnenie-5-9-(mediana|bissektrisa)', ['7G.2.3','8G.3.3']),
 (r'^obyasnenie-5-9-vysota', ['7G.2.3']),
 (r'^obyasnenie-5-9-parallelogramm', ['8G.1.2']),
 (r'^obyasnenie-5-9-(kvadrat\.|romb)', ['8G.1.4']),
 (r'^obyasnenie-5-9-trapeciya', ['8G.1.3']),
 (r'^trenazher-5-klass', ['5A.3.3','5A.4','5A.5','6A.1.1']),
 (r'^trenazher-znaki-6-klass', ['6A.5']), (r'^trenazher-fsu-7-klass', ['7A.5']),
 (r'^trenazher-linejnaya-funkciya-7-klass', ['7A.1.5','7A.2.2']),
 (r'^trenazher-geometriya-osnovy', ['7G.1']), (r'^trenazher-procenty-7-klass', ['6A.4']),
 (r'^trenazher-drobi-s-nulya', ['5A.4','6A.2']), (r'^trenazher-kvadratnyj-koren', ['8A.2']),
 (r'^trenazher-sopryazhennye', ['8A.2.5']), (r'^trenazher-kvadratnye-neravenstva', ['9A.2.3']), (r'^trenazher-formuly-oge12', ['9A.8.1']), (r'^trenazher-vychisleniya-oge6', ['9A.7.1']), (r'^trenazher-uravneniya-oge20', ['9A.2.1','9A.2.2','9A.2.4']), (r'^trenazher-tablica-umnozheniya', ['5A.3.1']),
 (r'^trenazher-ustnyj-schet', ['5A.3.1','5A.3.4','7A.3.1','8A.2.1']),
 (r'^trainer\.html', ['5A.5.4','6A.2.5']),
 (r'^bissektrisy-parallelogramma', ['8G.1.2']), (r'^triangle-medians', ['8G.3.3']),
 (r'^zadacha-691', ['9G.3.1']), (r'^G12 трапеция', ['8G.1.3']), (r'^G12\.html', ['8A.2.5']),
 (r'^N20 ?-N21', ['8A.2.5']),
]
rules = [(re.compile(p), v) for p, v in RULES]
bad = [i for _, v in RULES for i in v if i not in ids]
if bad: sys.exit(f'Неизвестные ID в RULES: {bad}')
unmapped = []
for it in cat['items']:
    for rx, v in rules:
        if rx.search(it['file']):
            it['node'] = v; break
    else:
        it.pop('node', None); unmapped.append(it['file'])
json.dump(cat, open(f'{ROOT}/catalog.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(f'{ROOT}/catalog.json', 'a').write('\n')
print('привязано', len(cat['items']) - len(unmapped), 'из', len(cat['items']))
print('без привязки (общие/служебные/пробники):'); [print(' ', f) for f in unmapped]
