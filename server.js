const http = require('http');
const errorHandle = require('./errorHandle');
const { v4: uuidv4 } = require('uuid');
const todos = [];

const requestListener = (req, res) => {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
    'Content-Type': 'application/json',
  };

  // 接收 post request 的 body
  let body = '';
  // 等待 body 接收資料
  req.on('data', chunk => {
    body += chunk;
  });

  if (req.url === '/todos' && req.method === 'GET') {
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: 'success',
        data: todos,
      })
    );
    res.end();
  } else if (req.url === '/todos' && req.method === 'POST') {
    req.on('end', () => {
      try {
        const title = JSON.parse(body).title;
        if (title !== undefined) {
          const newTodo = {
            id: uuidv4(),
            title: title,
          };
          todos.push(newTodo);
          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              status: 'success',
              data: todos,
            })
          );
          res.end();
        } else {
          errorHandle(res);
          // 或直接 throw new Error ?
          // throw new Error();
        }
      } catch (error) {
        errorHandle(res);
      }
    });
  } else if (req.url === '/todos' && req.method === 'DELETE') {
    todos.length = 0;
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: 'success',
        data: todos,
      })
    );
    res.end();
  } else if (req.url.startsWith('/todos/') && req.method === 'DELETE') {
    // startsWith() 方法用於檢測字串是否以指定的子字串開始。
    // /todos/ -> true
    // /todos/123 -> true
    // /todos -> false
    const id = req.url.split('/').pop();
    // pop() 方法會移除陣列中的最後一個元素，並回傳該元素的值。
    const index = todos.findIndex(todo => todo.id === id);
    // findIndex() 方法會回傳陣列中滿足提供的測試函式的第一個元素的索引。
    // index = -1 -> not found
    // index >= 0 -> found
    if (index !== -1) {
      todos.splice(index, 1);
      res.writeHead(200, headers);
      res.write(
        JSON.stringify({
          status: 'success',
          data: todos,
        })
      );
      res.end();
    } else {
      errorHandle(res);
    }
  } else if (req.url.startsWith('/todos/') && req.method === 'PATCH') {
    req.on('end', () => {
      try {
        const todo = JSON.parse(body).title;
        const id = req.url.split('/').pop();
        const index = todos.findIndex(todo => todo.id === id);
        if (todo !== undefined && index !== -1) {
          // 如果 todo title 不是 undefined 且 有找到對應的 id
          todos[index].title = todo;
          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              status: 'success',
              data: todos,
            })
          );
          res.end();
        } else {
          errorHandle(res);
        }
      } catch (error) {
        errorHandle(res);
      }
    });
  } else if (req.method === 'OPTIONS') {
    // preflight request
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(
      JSON.stringify({
        status: 'false',
        message: 'Not Found',
      })
    );
    res.end();
  }
};

const server = http.createServer(requestListener);
server.listen(3005);
