# Исправление кэша кабинетов в Google Apps Script

Изменение в GitHub не обновляет развёрнутый Google Apps Script автоматически.

В Google-таблице откройте «Расширения → Apps Script». Найдите `function doPost(e)` и замените только эту функцию кодом ниже. `doPostRun_`, `admin_` и остальные функции оставьте на месте.

```javascript
function doPost(e) {
  // Admin writes invalidate in admin_(). Reads must leave cached answers usable.
  let adminRequest = false;
  try {
    const body = JSON.parse(e.postData.contents);
    adminRequest = body.admin !== undefined;
  } catch (err) { /* Invalid requests are handled by doPostRun_(). */ }
  try { return doPostRun_(e); } finally { if (!adminRequest) bumpVer_(); }
}
```

Сохраните проект. Откройте «Развернуть → Управление развертываниями», отредактируйте существующее веб-приложение, выберите новую версию и разверните. Сохраните прежний адрес веб-приложения и прежние настройки доступа.

Не запускайте `doPost` вручную: она получает данные от сайта.

Проверка: откройте кабинет ученика, дождитесь данных, затем откройте его повторно в пределах двух минут. В коде сайта есть и локальный кэш, поэтому для отдельной проверки серверного кэша нужны измерения запросов или журнал выполнения Apps Script. Сохранение ДЗ и ручная правка таблицы должны по-прежнему обновлять данные.

Исправление сохраняет кэш при чтении. Оно не устраняет холодный запуск Apps Script и не гарантирует ускорение самого первого запроса.
