# Материалы по математике и ОГЭ

Репозиторий содержит интерактивные страницы для подготовки к ОГЭ по математике, диагностики знаний, домашние задания, тренажёры и кабинет ученика.

Опубликованный сайт: https://liliya-math.github.io/oge/

## Карта проекта

### Пробники ОГЭ
- `probnik-oge-1.html`, `probnik-oge-2.html`, `probnik-oge-3.html` — полные интерактивные пробники.
- `mini-probnik-1.html` — мини-пробник.
- `razbor-probnik-oge-2.html` — разбор пробника № 2.

### Диагностика и разборы
- `diagnostika-1-4-klass.html`
- `diagnostika-6-klass.html`, `diagnostika-7-klass.html`, `diagnostika-8-klass.html`
- `razbor-diagnostika-6-klass.html`
- `razbor-drobi-dialog.html`, `razbor-treugolniki-dialog.html`, `razbor-znaki-dialog.html`

### Кабинет и навигация
- `index.html` — главная страница с разборами и материалами.
- `start.html` — панель перехода к классам и материалам.
- `kabinet.html` — кабинет ученика.
- `kabinet-apps-script.txt` — код и инструкции для интеграции кабинета с Google Apps Script. Менять его следует только после отдельной проверки интеграции.

### Классы и учебные материалы
- `7-klass.html`, `8-klass.html`, `9-klass.html` — страницы классов.
- `materialy-9-klass.html`, `materialy-drob.html`, `ucheba-6-klass.html`
- `drob-deistviya.html`, `drob-s-nulya.html`, `znaki-s-nulya.html`, `treug-s-nulya.html`
- `formulas.html`, `trainer.html`, `achievements.html`
- `bissektrisy-parallelogramma.html` и файлы `z15-*.html` — отдельные тематические материалы и задачи.

### Домашние задания и файлы
- `dz-6-chisla-s-raznymi-znakami-2.html` и соответствующий PDF.
- `dz-6-desyatichnye-drobi-1.html` и соответствующий PDF.
- `razbor-diagnostika-6-klass.pdf`
- `img/` — изображения, используемые страницами.

## Важные правила внесения изменений

1. Не редактировать `main` напрямую: сначала вносить изменения в отдельную ветку.
2. Не перемещать и не переименовывать страницы без проверки всех ссылок на них.
3. Перед изменением пробников проверять ответы, подсчёт баллов, подсказки, сохранение прогресса и отправку результатов.
4. Перед изменением `kabinet.html` или `kabinet-apps-script.txt` отдельно проверять обмен данными с Google Таблицами.
5. После правок проверять ссылки и пути к изображениям, мобильную ширину и работу интерактивных элементов.
6. Разные визуальные стили страниц не унифицировать автоматически: сначала установить, являются ли различия намеренными.

## Рабочий процесс

- Вести аудит и исправления в отдельной ветке.
- Проверять каждое изменение до переноса в `main`.
- Сохранять существующие URL страниц, если нет необходимости менять их.
