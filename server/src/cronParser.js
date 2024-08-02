const { PrismaClient } = require('@prisma/client');
const puppeteer = require('puppeteer');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const cheerio = require('cheerio');

const prisma = new PrismaClient();

const email_host = process.env.EMAIL_HOST;
const email_user = process.env.EMAIL_USER;
const email_pass = process.env.EMAIL_PASS;

// Настройка SMTP транспорта для отправки email
const transporter = nodemailer.createTransport({
  host: email_host,
  port: 25,
  secure: false,
  auth: {
    user: email_user,
    pass: email_pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendEmail = async (comments) => {
  const emailText = comments.map(comment => {
    return `Имя: ${comment.author}\nДата: ${comment.date}\nКомментарий: ${comment.text}\nС страницы: ${comment.webUrl.url}\n\n`;
  }).join('');

  const mailOptions = {
    from: '"Parser" <fromsite@gsl.ru>',
    to: 'saskiss23@icloud.com',
    subject: 'VC.RU/COMMENT BY USER',
    text: emailText,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error.message);
    return false;
  }
};

const parseAndSaveData = async () => {
  console.log('Запуск парсинга и сохранения данных...');
  try {
    // Получаем все уникальные sourceId из базы данных
    const sources = await prisma.source.findMany();

    for (const source of sources) {
      const { id: sourceId } = source;
      console.log(`Получаем URL для sourceId: ${sourceId}`);

      const webUrls = await prisma.webURL.findMany({
        where: { sourceId }
      });

      console.log(`Найдено ${webUrls.length} URL. Начинаем парсинг каждого URL...`);

      for (const webUrl of webUrls) {
        console.log(`Запускаем Puppeteer для получения данных с URL: ${webUrl.url}`);

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        try {
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

          // Извлечение JSON из <script> window.__INITIAL_STATE__
          let initialStateScript = null;
          const $ = cheerio.load(content);
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
              jsonString = jsonString.replace(/,\s*]/g, ']');
              jsonString = jsonString.replace(/,\s*}/g, '}');
              jsonString = jsonString.replace(/:\s*undefined/g, ': null');
              jsonString = jsonString.replace(/\\\\"/g, '\\\"');
              jsonString = jsonString.replace(/\\u002F/g, '/');
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
                    sourceId: sourceId,
                    webUrlId: webUrl.id,
                    author: authorName,
                    date: date,
                    text: text,
                    isSend: false
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
                    console.log(`Комментарий сохранён в базе данных для URL: ${webUrl.url}`);
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

        } catch (error) {
          console.error(`Ошибка при парсинге URL ${webUrl.url}:`, error.message);
        } finally {
          await browser.close();
        }
      }
    }

    console.log('Парсинг и сохранение данных завершены.');

    // Отправка новых комментариев, если они были успешно получены и сохранены
    const newComments = await prisma.data.findMany({
      where: { isSend: false },
      include: {
        webUrl: true,
      }
    });

    if (newComments.length > 0) {
      const emailSent = await sendEmail(newComments);

      if (emailSent) {
        // Обновление статуса isSend только если email отправлен успешно
        await prisma.data.updateMany({
          where: { id: { in: newComments.map(comment => comment.id) } },
          data: { isSend: true }
        });

        console.log('Статус отправки обновлён в базе данных.');
      } else {
        console.log('Ошибка при отправке email. Статус isSend не обновлён.');
      }
    } else {
      console.log('Новых комментариев для отправки нет.');
    }

  } catch (error) {
    console.error('Ошибка парсинга данных:', error.message);
  }
};

// Запланируйте выполнение задачи каждую минуту
cron.schedule('* * * * *', parseAndSaveData, {
  scheduled: true,
  timezone: "Europe/Moscow"
});

console.log('CRON-задача запущена и будет выполняться каждую минуту.');
