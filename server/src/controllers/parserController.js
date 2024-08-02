const { PrismaClient } = require('@prisma/client');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const parseAndSaveData = async (req, res) => {
  console.log('Начинаем парсинг и сохранение данных...');
  try {
    const { sourceId } = req.body;
    if (!sourceId) {
      return res.status(400).json({ error: "sourceId обязателен" });
    }

    console.log(`Получаем URL для sourceId: ${sourceId}`);
    const webUrls = await prisma.webURL.findMany({
      where: { sourceId: parseInt(sourceId, 10) }
    });

    console.log(`Найдено ${webUrls.length} URL. Начинаем парсинг каждого URL...`);

    for (const webUrl of webUrls) {
      console.log(`Запускаем Puppeteer для получения данных с URL: ${webUrl.url}`);

      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      await page.goto(webUrl.url, { waitUntil: 'networkidle2' });

      // Пытаемся нажать на "Показать больше комментариев" и ждем, пока контент загрузится
      try {
        await page.click('.comments-limit__expand');
        console.log('Нажата кнопка "Показать больше комментариев"');
        await page.waitForTimeout(3000); // Ждем 3 секунды, чтобы комментарии загрузились
      } catch (e) {
        console.log('Кнопка "Показать больше комментариев" не найдена или не удалось нажать');
      }

      const content = await page.content();

      // Используем Cheerio для загрузки HTML-контента
      const $ = cheerio.load(content);

      // Извлечение JSON из <script> window.__INITIAL_STATE__
      let initialStateScript = null;
      $('script').each((i, el) => {
        const scriptContent = $(el).html();
        if (scriptContent && scriptContent.includes('window.__INITIAL_STATE__')) {
          initialStateScript = scriptContent;
        }
      });

      if (initialStateScript) {
        try {
          // Извлечение строки JSON из скрипта
          const jsonStartIndex = initialStateScript.indexOf('{');
          const jsonEndIndex = initialStateScript.lastIndexOf('}');
          let jsonString = initialStateScript.substring(jsonStartIndex, jsonEndIndex + 1);

          // Исправление ошибок в JSON
          jsonString = jsonString.replace(/,\s*]/g, ']'); // Удаление запятых перед закрывающими скобками массива
          jsonString = jsonString.replace(/,\s*}/g, '}'); // Удаление запятых перед закрывающими скобками объекта
          jsonString = jsonString.replace(/:\s*undefined/g, ': null'); // Замена undefined на null
          jsonString = jsonString.replace(/\\\\"/g, '\\\"'); // Исправление экранирования кавычек

          // Замена \u002F на / для URL
          jsonString = jsonString.replace(/\\u002F/g, '/');

          // Удаление возвратов каретки
          jsonString = jsonString.replace(/\\r\\n/g, '');

          // Парсинг JSON
          const jsonData = JSON.parse(jsonString);

          // Извлечение только объекта с комментариями
          const commentsKey = Object.keys(jsonData).find(key => key.startsWith('comments@') && key.endsWith('@hotness'));
          if (commentsKey) {
            const commentsData = { [commentsKey]: jsonData[commentsKey] };


            

            const parsedComments = commentsData[commentsKey].items.map(comment => {
              const authorName = comment.author.name || 'Неизвестный автор';
              const text = comment.text || 'Нет текста';
              const date = new Date(comment.date * 1000); // Преобразование из UNIX timestamp
              return {
                sourceId: parseInt(sourceId, 10),
                webUrlId: webUrl.id,
                author: authorName,
                date: date,
                text: text
              };
            });

            console.log(`Спарсено ${parsedComments.length} комментариев с URL: ${webUrl.url}`);

            for (const comment of parsedComments) {
              const existingComment = await prisma.data.findFirst({
                where: {
                  sourceId: comment.sourceId,
                  webUrlId: comment.webUrlId,
                  author: comment.author,
                  date: comment.date,
                  text: comment.text
                }
              });

              if (!existingComment) {
                await prisma.data.create({
                  data: comment
                });
                console.log(`Комментарий сохранен в базу данных для URL: ${webUrl.url}`);
              } else {
                console.log(`Пропущен дубликат комментария для URL: ${webUrl.url}`);
              }
            }
          } else {
            console.log('Комментарии не найдены.');
          }

        } catch (e) {
          console.log('Ошибка при парсинге JSON:', e.message);
        }
      } else {
        console.log('JSON начального состояния не найден.');
      }

      await browser.close();
    }

    res.status(200).json({ message: 'Данные успешно спарсены и сохранены' });
    console.log('Парсинг и сохранение данных успешно завершены.');
  } catch (error) {
    console.error('Ошибка при парсинге данных:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { parseAndSaveData };
