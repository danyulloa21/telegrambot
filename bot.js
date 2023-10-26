// Importamos la librería node-telegram-bot-api 
const TelegramBot = require('node-telegram-bot-api');

// Importamos la biblioteca de mysql en nuestro bot
const mysql = require('mysql2');

//Creamos la conexion a nuestra base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'bot'
  });

  // Conectamos la base de datos
  db.connect((err) => {
    if (err) {
      console.error('Error al conectar a la base de datos MySQL: ' + err.message);
    } else {
      console.log('Conexión exitosa a la base de datos MySQL');
    }
  });

// Creamos una constante que guarda el Token de nuestro Bot de Telegram que previamente hemos creado desde el bot @BotFather
const token = 'xxxxx';
//6726849282:AAHTRlvjPJKhuayX9w3bIYjX5kCMKxG3FR8
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// ⚠️ Después de este comentario es donde ponemos la lógica de nuestro bot donde podemos crear los comandos y eventos para darle funcionalidades a nuestro bot

function generateRandomUserData() {
  const names = ["Alex", "Vicam", "Vicam2", "Econatura", "FontesKHackeado", "Ulloacrack", "Je"];
  const randomName = names[Math.floor(Math.random() * names.length)];

  const randomEmail = `${randomName.toLowerCase()}@example.com`;

  // Generate a random phone number with 10 digits
  const randomPhoneNumber = Math.floor(1000000000 + Math.random() * 9000000000);

  return { name: randomName, email: randomEmail, phone: randomPhoneNumber };
}


// Define a command to handle the /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = "Bienvenido al bot.\nComandos Disponibles:\n/consultar para mostrar los usuarios.\n/eliminar para eliminar un usuario.\n/generar para insertar usuario aleatorio.";
  
  // Send the welcome message to the user
  bot.sendMessage(chatId, welcomeMessage);
});


// Implementación de la primera funcionalidad: Cuando mandamos el mensaje "Hola" reconoce tú nombre y genera un input tipo "Hola Daniel"

// Comando para buscar un usuario por nombre
bot.onText(/\/consultar/, (msg) => {
    const query = 'SELECT id,nombre FROM usuarios';
    
    db.query(query, (err, results) => {
      if (err) {
        bot.sendMessage(msg.chat.id, 'Error al buscar el usuario: ' + err.message);
      } else {
        if (results.length > 0) {
          const keyboard = {
            inline_keyboard: []
          };

          for (let i = 0; i < results.length; i++) {
            const element = results[i];
            let { id, nombre } = element;

            // Crear un botón para cada usuario
            const button = {
              text: `${nombre}`,
              callback_data: `usuario_${id}` // Puedes usar este dato para identificar el usuario
            };

            keyboard.inline_keyboard.push([button]);
          }

          const options = {
            reply_markup: JSON.stringify(keyboard),
            parse_mode: 'Markdown' // Puedes usar 'HTML' en lugar de 'Markdown' si prefieres HTML
          };

          bot.sendMessage(msg.chat.id, 'Usuarios encontrados.\nSelecciona uno o varios usuarios:', options);
        } else {
          bot.sendMessage(msg.chat.id, 'Usuario no encontrado.');
        }
      }
    });
});
bot.onText(/\/eliminar/, (msg) => {
    const query = 'SELECT id,nombre FROM usuarios';
    
    db.query(query, (err, results) => {
      if (err) {
        bot.sendMessage(msg.chat.id, 'Error al buscar el usuario: ' + err.message);
      } else {
        if (results.length > 0) {
          const keyboard = {
            inline_keyboard: []
          };

          for (let i = 0; i < results.length; i++) {
            const element = results[i];
            let { id, nombre } = element;

            // Crear un botón para cada usuario
            const button = {
              text: `${nombre}`,
              callback_data: `eliminar_${id}` // Puedes usar este dato para identificar el usuario
            };

            keyboard.inline_keyboard.push([button]);
          }

          const options = {
            reply_markup: JSON.stringify(keyboard),
            parse_mode: 'Markdown' // Puedes usar 'HTML' en lugar de 'Markdown' si prefieres HTML
          };

          bot.sendMessage(msg.chat.id, 'Usuarios encontrados.\nSelecciona uno o varios usuarios para eliminar:', options);
        } else {
          bot.sendMessage(msg.chat.id, 'Usuario no encontrado.');
        }
      }
    });
});

bot.on('callback_query', (query) => {
    const data = query.data; // Obtiene el callback_data del botón presionado
    if (data.startsWith('usuario_')) {
      const userId = data.split('_')[1]; // Extrae el ID de usuario del callback_data
    //   Realiza una acción relacionada con el usuario, como buscar más información en la base de datos
      const userquery = 'SELECT * FROM usuarios WHERE id = ?';
      db.query(userquery, [userId], (err, result) => {
        if (err) {
          console.error('Error al buscar el usuario: ' + err.message);
        } else {
          // Enviar información adicional sobre el usuario al usuario
          const userInfo = result[0]; // Suponiendo que solo se devuelve un registro
          bot.sendMessage(query.message.chat.id, `Información del usuario:\nID: ${userInfo.id}\nNombre: ${userInfo.nombre}\nCorreo: ${userInfo.correo}\nCelular: ${userInfo.celular}`);
        }
      });
      
    } else if (data.startsWith('eliminar_')){

      const userIdToDelete = data.split('_')[1];

      const userdeletequery = 'DELETE FROM usuarios WHERE id = ?';

      db.query(userdeletequery, [userIdToDelete], (err, result) => {
        if (err) {
            bot.sendMessage(query.message.chat.id, 'Error al eliminar el usuario: ' + err.message);
        } else {
            if (result.affectedRows > 0) {
                bot.sendMessage(query.message.chat.id, 'Usuario eliminado exitosamente.');
            } else {
                bot.sendMessage(query.message.chat.id, 'Usuario no encontrado.');
            }
        }
    });
    }
  });

  bot.onText(/\/generar/, (msg) => {
    const chatId = msg.chat.id;

    // Generate random user data
    const userData = generateRandomUserData();

    // Insert the random user data into the database
    const insertQuery = 'INSERT INTO usuarios (nombre, correo, celular) VALUES (?, ?, ?)';
    
    db.query(insertQuery, [userData.name, userData.email, userData.phone], (err, result) => {
        if (err) {
            bot.sendMessage(chatId, 'Error al insertar el usuario: ' + err.message);
        } else {
            bot.sendMessage(chatId, 'Usuario aleatorio insertado exitosamente.');
        }
    });
});


  